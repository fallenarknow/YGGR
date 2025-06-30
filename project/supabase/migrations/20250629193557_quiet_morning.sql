/*
  # Fix Profile Creation Trigger

  1. Changes
    - Replace the existing handle_new_user trigger function with an improved version
    - The new function checks if a profile already exists before attempting to create one
    - Adds error handling to prevent duplicates and improve reliability
*/

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create an improved trigger function that prevents duplicate profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if profile already exists for this user
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.id) THEN
    -- Profile already exists, do nothing
    RETURN NEW;
  END IF;

  -- Insert new profile with error handling
  BEGIN
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
    );
  EXCEPTION
    WHEN unique_violation THEN
      -- If there's a race condition and profile was created in between our check and insert
      -- Just ignore the error and continue
      RAISE NOTICE 'Profile for user % already exists, skipping creation', NEW.id;
  END;

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