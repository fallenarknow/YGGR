/*
  # Improved Profile Creation Trigger

  1. Changes
    - Replace the existing handle_new_user trigger function with a more robust version
    - Uses advisory locks to prevent race conditions during profile creation
    - Adds explicit conflict handling with ON CONFLICT DO NOTHING
    - Improves error handling to prevent transaction failures
*/

-- Drop the existing trigger first to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create an improved trigger function with advisory locks
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
    lock_key TEXT;
    lock_acquired BOOLEAN;
BEGIN
    -- Create lock key based on user ID
    lock_key := 'profile_creation_' || NEW.id::TEXT;
    
    -- Try to acquire advisory lock
    SELECT pg_try_advisory_xact_lock(hashtext(lock_key)) INTO lock_acquired;
    
    IF NOT lock_acquired THEN
        -- Another process is already creating this profile
        RAISE NOTICE 'Could not acquire lock for user %, profile creation may be in progress', NEW.id;
        RETURN NEW;
    END IF;
    
    -- Create profile with conflict handling
    INSERT INTO public.profiles (
        id, 
        full_name, 
        role,
        business_name,
        business_verified,
        avatar_url,
        created_at
    )
    VALUES (
        NEW.id, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'buyer'),
        NEW.raw_user_meta_data->>'business_name',
        false,
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture'),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the transaction
        RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Add a comment to the function for documentation
COMMENT ON FUNCTION handle_new_user() IS 'Enhanced trigger function that creates profiles with advisory locks and prevents duplicates';