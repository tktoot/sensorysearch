-- Ensure organizer_profiles table has correct RLS policies
-- This script is idempotent and can be run multiple times

-- Drop existing policies if they exist (to ensure clean state)
DROP POLICY IF EXISTS "Users can view their own organizer profile" ON organizer_profiles;
DROP POLICY IF EXISTS "Users can view own organizer profile" ON organizer_profiles;
DROP POLICY IF EXISTS "Users can insert their own organizer profile" ON organizer_profiles;
DROP POLICY IF EXISTS "Users can insert own organizer profile" ON organizer_profiles;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON organizer_profiles;

-- Enable RLS on organizer_profiles
ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own organizer profile
CREATE POLICY "organizer_profiles_select_own"
ON organizer_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own organizer profile
CREATE POLICY "organizer_profiles_insert_own"
ON organizer_profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own organizer profile
CREATE POLICY "organizer_profiles_update_own"
ON organizer_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Add index on user_id for faster lookups (idempotent)
CREATE INDEX IF NOT EXISTS organizer_profiles_user_id_idx ON organizer_profiles(user_id);

-- Verify the table structure matches expectations
DO $$
BEGIN
  -- Check if required columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizer_profiles' 
    AND column_name = 'user_id'
  ) THEN
    RAISE EXCEPTION 'organizer_profiles.user_id column is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizer_profiles' 
    AND column_name = 'business_name'
  ) THEN
    RAISE EXCEPTION 'organizer_profiles.business_name column is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'organizer_profiles' 
    AND column_name = 'email'
  ) THEN
    RAISE EXCEPTION 'organizer_profiles.email column is missing';
  END IF;

  RAISE NOTICE 'organizer_profiles table structure verified';
END $$;
