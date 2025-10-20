-- Add last_login_at column to users table for tracking login activity
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- Create index for faster queries on last_login_at
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at);

-- Update existing users to set last_login_at to created_at if null
UPDATE users SET last_login_at = created_at WHERE last_login_at IS NULL;
