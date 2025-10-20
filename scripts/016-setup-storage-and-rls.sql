-- Create storage bucket for public uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-uploads', 'public-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-uploads');

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-uploads');

-- Ensure listings table has all required columns
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS website text,
ADD COLUMN IF NOT EXISTS social_link text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS zip text,
ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sensory_features text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS crowd_level text,
ADD COLUMN IF NOT EXISTS accessibility_notes text,
ADD COLUMN IF NOT EXISTS event_date date,
ADD COLUMN IF NOT EXISTS event_start_time time,
ADD COLUMN IF NOT EXISTS event_end_time time,
ADD COLUMN IF NOT EXISTS venue_name text,
ADD COLUMN IF NOT EXISTS organizer_id uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS organizer_email text,
ADD COLUMN IF NOT EXISTS submitted_at timestamptz DEFAULT now(),
ADD COLUMN IF NOT EXISTS reviewed_at timestamptz,
ADD COLUMN IF NOT EXISTS reviewed_by uuid REFERENCES users(id),
ADD COLUMN IF NOT EXISTS rejection_reason text,
ADD COLUMN IF NOT EXISTS moderator_notes text,
ADD COLUMN IF NOT EXISTS source text DEFAULT 'web',
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- RLS policies for listings
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved listings
CREATE POLICY "Public can view approved listings"
ON listings FOR SELECT
TO public
USING (status = 'approved');

-- Authenticated users can insert during beta
CREATE POLICY "Authenticated users can submit listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can view their own pending submissions
CREATE POLICY "Users can view own submissions"
ON listings FOR SELECT
TO authenticated
USING (organizer_id = auth.uid());

-- Admins can update any listing
CREATE POLICY "Admins can update listings"
ON listings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Ensure users table has role column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Ensure organizer_profiles table exists
CREATE TABLE IF NOT EXISTS organizer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) UNIQUE NOT NULL,
  business_name text,
  email text,
  subscription_status text DEFAULT 'trial',
  subscription_tier text DEFAULT 'free',
  trial_started_at timestamptz,
  trial_ends_at timestamptz,
  is_trial_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizer_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own organizer profile"
ON organizer_profiles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own organizer profile"
ON organizer_profiles FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Ensure analytics tables exist
CREATE TABLE IF NOT EXISTS analytics_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  user_id uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics"
ON analytics_clicks FOR INSERT
TO public
WITH CHECK (true);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own favorites"
ON favorites FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Ratings table
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own ratings"
ON ratings FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
