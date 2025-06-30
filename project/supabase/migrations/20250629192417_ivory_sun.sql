/*
  # Password Reset Functionality

  1. New Table
    - `password_reset_tokens`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users.id)
      - `token` (text, unique)
      - `created_at` (timestamp with time zone)
      - `expires_at` (timestamp with time zone)
      - `used` (boolean)
  
  2. Security
    - Enable RLS on `password_reset_tokens` table
    - Add policy for authenticated users to view their own tokens
    - Add policy for service role to manage tokens
  
  3. Functions
    - `create_password_reset_token` - Creates a new reset token for a user
    - `validate_password_reset_token` - Validates a token and marks it as used
    - `handle_password_reset` - Updates user password and invalidates token
*/

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  used boolean DEFAULT false
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at) WHERE used = false;

-- Enable Row Level Security
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own reset tokens"
  ON password_reset_tokens
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all tokens"
  ON password_reset_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to create a password reset token
CREATE OR REPLACE FUNCTION create_password_reset_token(
  user_email text,
  token_expiry_hours int DEFAULT 24
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id uuid;
  reset_token text;
BEGIN
  -- Find the user by email
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Generate a secure random token
  reset_token := encode(gen_random_bytes(32), 'hex');
  
  -- Insert the token into the table
  INSERT INTO password_reset_tokens (
    user_id,
    token,
    expires_at
  ) VALUES (
    user_id,
    reset_token,
    now() + (token_expiry_hours * interval '1 hour')
  );
  
  RETURN reset_token;
END;
$$;

-- Function to validate a password reset token
CREATE OR REPLACE FUNCTION validate_password_reset_token(
  reset_token text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_user_id uuid;
BEGIN
  -- Find the token and check if it's valid
  SELECT user_id INTO token_user_id
  FROM password_reset_tokens
  WHERE token = reset_token
    AND used = false
    AND expires_at > now();
  
  IF token_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired token';
  END IF;
  
  -- Mark the token as used
  UPDATE password_reset_tokens
  SET used = true
  WHERE token = reset_token;
  
  RETURN token_user_id;
END;
$$;

-- Function to handle password reset
CREATE OR REPLACE FUNCTION handle_password_reset(
  reset_token text,
  new_password text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_user_id uuid;
BEGIN
  -- Validate the token and get user ID
  token_user_id := validate_password_reset_token(reset_token);
  
  -- Update the user's password
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = token_user_id;
  
  -- Invalidate all existing reset tokens for this user
  UPDATE password_reset_tokens
  SET used = true
  WHERE user_id = token_user_id;
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- Create a trigger function to automatically clean up expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM password_reset_tokens
  WHERE expires_at < now() AND used = false;
  RETURN NULL;
END;
$$;

-- Create a trigger to run the cleanup function periodically
CREATE TRIGGER trigger_cleanup_expired_tokens
AFTER INSERT ON password_reset_tokens
EXECUTE FUNCTION cleanup_expired_tokens();

-- Create a function to handle password reset requests via email
CREATE OR REPLACE FUNCTION request_password_reset(
  user_email text,
  reset_url_base text
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  reset_token text;
  reset_url text;
BEGIN
  -- Create a reset token
  reset_token := create_password_reset_token(user_email);
  
  -- Generate the reset URL
  reset_url := reset_url_base || '?token=' || reset_token;
  
  -- In a real implementation, you would send an email here
  -- For now, we just return the URL for testing purposes
  RETURN reset_url;
END;
$$;