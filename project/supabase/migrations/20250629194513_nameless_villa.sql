/*
  # Fix Profile Creation Trigger

  1. Changes
    - Improve the handle_new_user trigger function to properly handle race conditions
    - Add explicit error handling to prevent duplicate key violations
    - Add ON CONFLICT DO NOTHING clause for profile creation
    - Add logging for better debugging

  2. Security
    - Maintain existing RLS policies
    - No changes to security model
*/

-- Drop the existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create an improved trigger function that prevents duplicate profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  profile_exists boolean;
BEGIN
  -- Check if profile already exists for this user
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = NEW.id
  ) INTO profile_exists;
  
  -- Only create profile if it doesn't exist
  IF NOT profile_exists THEN
    -- Insert new profile with ON CONFLICT DO NOTHING to handle race conditions
    INSERT INTO public.profiles (
      id,
      full_name,
      role,
      business_name,
      business_verified,
      avatar_url
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
      COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
      NEW.raw_user_meta_data->>'business_name',
      false,
      COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture')
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Add a comment to the function for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Enhanced trigger function that creates profiles with error handling and prevents duplicates';