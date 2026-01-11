-- Ensure organizer_profiles table exists with proper structure and RLS
-- This script is idempotent and safe to run multiple times

-- The organizer_profiles table should already exist, but this ensures it
CREATE TABLE IF NOT EXISTS public.organizer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  email text NOT NULL,
  trial_started_at timestamptz DEFAULT now(),
  trial_ends_at timestamptz,
  is_trial_active boolean DEFAULT true,
  subscription_status text DEFAULT 'trial',
  subscription_tier text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own organizer profile" ON public.organizer_profiles;
DROP POLICY IF EXISTS "Users can insert their own organizer profile" ON public.organizer_profiles;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON public.organizer_profiles;

-- Create RLS policies
-- Users can SELECT their own organizer profile
CREATE POLICY "Users can view their own organizer profile"
  ON public.organizer_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can INSERT their own organizer profile
CREATE POLICY "Users can insert their own organizer profile"
  ON public.organizer_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can UPDATE their own organizer profile
CREATE POLICY "Users can update their own organizer profile"
  ON public.organizer_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_user_id ON public.organizer_profiles(user_id);

-- Add comment
COMMENT ON TABLE public.organizer_profiles IS 'Stores organizer-specific profile information and subscription details';
