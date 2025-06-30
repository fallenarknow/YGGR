/*
  # Fix Profile Creation and Error Handling

  1. Changes
    - Create a more robust handle_new_user trigger function
    - Add explicit ON CONFLICT DO NOTHING clause
    - Improve error handling to prevent duplicate key violations
    - Add better logging for debugging purposes

  2. Security
    - No changes to security model
    - Maintains existing RLS policies
*/

-- Drop the existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create an improved trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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