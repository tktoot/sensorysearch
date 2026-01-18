-- Ensure unified role system is properly configured
-- This script makes the role system consistent and functional

-- 1. Ensure users table has role column with proper default
DO $$ 
BEGIN
  -- Check if role column exists, if not add it
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'role') THEN
    ALTER TABLE public.users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
  END IF;
  
  -- Ensure default is set
  ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'user';
END $$;

-- 2. Update any NULL roles to 'user'
UPDATE public.users SET role = 'user' WHERE role IS NULL;

-- 3. Ensure profiles table is properly set up
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  home_zip TEXT,
  age_focus TEXT,
  favorites TEXT[],
  has_seen_onboarding BOOLEAN DEFAULT FALSE,
  radius_miles INTEGER DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Create comprehensive RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can delete their own profile" 
  ON public.profiles FOR DELETE 
  USING (auth.uid() = id);

-- 6. Create or replace function to auto-create profile and user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into users table
  INSERT INTO public.users (id, email, role, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',  -- Default role
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        updated_at = NOW();

  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, has_seen_onboarding, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    FALSE,  -- User needs to see onboarding
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 7. Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Ensure organizer_profiles RLS policies are correct
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own organizer profile" ON public.organizer_profiles;
DROP POLICY IF EXISTS "Users can insert their own organizer profile" ON public.organizer_profiles;
DROP POLICY IF EXISTS "Users can update their own organizer profile" ON public.organizer_profiles;

CREATE POLICY "Users can view their own organizer profile" 
  ON public.organizer_profiles FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own organizer profile" 
  ON public.organizer_profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own organizer profile" 
  ON public.organizer_profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- 9. Create helper function to check if user is organizer or admin
CREATE OR REPLACE FUNCTION public.is_organizer_or_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role VARCHAR(50);
  has_organizer_profile BOOLEAN;
BEGIN
  -- Check role from users table
  SELECT role INTO user_role FROM public.users WHERE id = user_id;
  
  -- Check if organizer profile exists
  SELECT EXISTS(SELECT 1 FROM public.organizer_profiles WHERE organizer_profiles.user_id = $1) 
    INTO has_organizer_profile;
  
  RETURN (user_role = 'organizer' OR user_role = 'admin' OR has_organizer_profile);
END;
$$;

-- 10. Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_user_id ON public.organizer_profiles(user_id);

COMMENT ON TABLE public.users IS 'User accounts with role information';
COMMENT ON TABLE public.profiles IS 'User profiles with preferences and settings';
COMMENT ON TABLE public.organizer_profiles IS 'Organizer-specific profiles for business information';
COMMENT ON COLUMN public.users.role IS 'User role: user, organizer, or admin';
