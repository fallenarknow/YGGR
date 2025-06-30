/*
  # RevenueCat Integration

  1. New Tables
    - `seller_subscriptions` - Stores seller subscription information
    - `subscription_usage` - Tracks usage metrics for subscription limits

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users and service role
*/

-- Create seller_subscriptions table
CREATE TABLE IF NOT EXISTS seller_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL DEFAULT 'free_plan' CHECK (plan IN ('free_plan', 'basic_plan', 'premium_plan', 'enterprise_plan')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled', 'expired', 'pending')),
  starts_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  payment_provider text,
  payment_id text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_usage table
CREATE TABLE IF NOT EXISTS subscription_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL,
  current_usage integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_seller_id ON seller_subscriptions(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_subscriptions_status ON seller_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_seller_id ON subscription_usage(seller_id);
CREATE INDEX IF NOT EXISTS idx_subscription_usage_feature ON subscription_usage(feature);

-- Enable RLS
ALTER TABLE seller_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for seller_subscriptions with checks to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'seller_subscriptions' 
    AND policyname = 'Sellers can view their own subscriptions'
  ) THEN
    CREATE POLICY "Sellers can view their own subscriptions"
      ON seller_subscriptions
      FOR SELECT
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'seller_subscriptions' 
    AND policyname = 'Service role can manage all subscriptions'
  ) THEN
    CREATE POLICY "Service role can manage all subscriptions"
      ON seller_subscriptions
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Create policies for subscription_usage with checks to prevent duplicates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_usage' 
    AND policyname = 'Sellers can view their own usage'
  ) THEN
    CREATE POLICY "Sellers can view their own usage"
      ON subscription_usage
      FOR SELECT
      TO authenticated
      USING (auth.uid() = seller_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'subscription_usage' 
    AND policyname = 'Service role can manage all usage'
  ) THEN
    CREATE POLICY "Service role can manage all usage"
      ON subscription_usage
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Add unique constraint to subscription_usage
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'subscription_usage_seller_id_feature_key'
  ) THEN
    ALTER TABLE subscription_usage ADD CONSTRAINT subscription_usage_seller_id_feature_key UNIQUE (seller_id, feature);
  END IF;
EXCEPTION
  WHEN duplicate_table THEN
    NULL;
END
$$;

-- Create function to update usage
CREATE OR REPLACE FUNCTION update_subscription_usage(
  p_seller_id uuid,
  p_feature text,
  p_usage integer
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO subscription_usage (seller_id, feature, current_usage, last_updated)
  VALUES (p_seller_id, p_feature, p_usage, now())
  ON CONFLICT (seller_id, feature) DO UPDATE
  SET current_usage = p_usage, last_updated = now();
END;
$$;

-- Create function to check if a seller has access to a feature
CREATE OR REPLACE FUNCTION check_subscription_access(
  p_seller_id uuid,
  p_feature text,
  p_quantity integer DEFAULT 1
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan text;
  v_limit integer;
BEGIN
  -- Get the seller's current plan
  SELECT plan INTO v_plan
  FROM seller_subscriptions
  WHERE seller_id = p_seller_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Default to free plan if no active subscription
  IF v_plan IS NULL THEN
    v_plan := 'free_plan';
  END IF;
  
  -- Determine the limit based on the plan and feature
  CASE
    WHEN p_feature = 'plantListings' THEN
      CASE v_plan
        WHEN 'free_plan' THEN v_limit := 10;
        WHEN 'basic_plan' THEN v_limit := 50;
        WHEN 'premium_plan' THEN v_limit := 200;
        WHEN 'enterprise_plan' THEN v_limit := 2147483647; -- Effectively unlimited
        ELSE v_limit := 10; -- Default to free plan
      END CASE;
    WHEN p_feature = 'locations' THEN
      CASE v_plan
        WHEN 'free_plan' THEN v_limit := 1;
        WHEN 'basic_plan' THEN v_limit := 2;
        WHEN 'premium_plan' THEN v_limit := 5;
        WHEN 'enterprise_plan' THEN v_limit := 2147483647; -- Effectively unlimited
        ELSE v_limit := 1; -- Default to free plan
      END CASE;
    WHEN p_feature = 'featured' THEN
      CASE v_plan
        WHEN 'free_plan' THEN v_limit := 0;
        WHEN 'basic_plan' THEN v_limit := 0;
        WHEN 'premium_plan' THEN v_limit := 1;
        WHEN 'enterprise_plan' THEN v_limit := 1;
        ELSE v_limit := 0; -- Default to free plan
      END CASE;
    WHEN p_feature = 'customBranding' THEN
      CASE v_plan
        WHEN 'free_plan' THEN v_limit := 0;
        WHEN 'basic_plan' THEN v_limit := 0;
        WHEN 'premium_plan' THEN v_limit := 0;
        WHEN 'enterprise_plan' THEN v_limit := 1;
        ELSE v_limit := 0; -- Default to free plan
      END CASE;
    ELSE
      v_limit := 0; -- Unknown feature
  END CASE;
  
  -- Check if the requested quantity is within the limit
  RETURN p_quantity <= v_limit;
END;
$$;

-- Create trigger function to update usage when plants are added/removed
CREATE OR REPLACE FUNCTION update_plant_listing_usage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
  v_seller_id uuid;
BEGIN
  -- Determine the seller_id based on whether this is an INSERT, UPDATE, or DELETE
  IF TG_OP = 'DELETE' THEN
    v_seller_id := OLD.seller_id;
  ELSE
    v_seller_id := NEW.seller_id;
  END IF;

  -- Count the seller's active plant listings
  SELECT COUNT(*) INTO v_count
  FROM plants
  WHERE seller_id = v_seller_id
    AND status != 'draft';
  
  -- Update the usage
  PERFORM update_subscription_usage(v_seller_id, 'plantListings', v_count);
  
  RETURN NEW;
END;
$$;

-- Create trigger on plants table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_update_plant_listing_usage'
  ) THEN
    CREATE TRIGGER trigger_update_plant_listing_usage
    AFTER INSERT OR UPDATE OR DELETE ON plants
    FOR EACH ROW
    EXECUTE FUNCTION update_plant_listing_usage();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist yet, so we'll skip creating the trigger
    NULL;
END
$$;

-- Create trigger function to update usage when locations are added/removed
CREATE OR REPLACE FUNCTION update_location_usage()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
  v_seller_id uuid;
BEGIN
  -- Determine the seller_id based on whether this is an INSERT, UPDATE, or DELETE
  IF TG_OP = 'DELETE' THEN
    v_seller_id := OLD.seller_id;
  ELSE
    v_seller_id := NEW.seller_id;
  END IF;

  -- Count the seller's active locations
  SELECT COUNT(*) INTO v_count
  FROM seller_locations
  WHERE seller_id = v_seller_id
    AND is_active = true;
  
  -- Update the usage
  PERFORM update_subscription_usage(v_seller_id, 'locations', v_count);
  
  RETURN NEW;
END;
$$;

-- Create trigger on seller_locations table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'trigger_update_location_usage'
  ) THEN
    CREATE TRIGGER trigger_update_location_usage
    AFTER INSERT OR UPDATE OR DELETE ON seller_locations
    FOR EACH ROW
    EXECUTE FUNCTION update_location_usage();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    -- Table doesn't exist yet, so we'll skip creating the trigger
    NULL;
END
$$;

-- Add updated_at trigger for seller_subscriptions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_seller_subscriptions_updated_at'
  ) THEN
    CREATE TRIGGER update_seller_subscriptions_updated_at
    BEFORE UPDATE ON seller_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END
$$;