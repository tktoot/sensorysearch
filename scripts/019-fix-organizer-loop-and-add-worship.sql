-- Fix organizer loop by adding proper role tracking to profiles
-- Add Places of Worship submission type
-- Update RLS policies to use profiles.is_organizer

-- Step 1: Add is_organizer to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_organizer boolean NOT NULL DEFAULT false;

-- Step 2: Sync existing organizer roles from users table to profiles
UPDATE profiles p
SET is_organizer = true
FROM users u
WHERE p.id = u.id AND u.role IN ('organizer', 'business', 'admin');

-- Step 3: Create places_of_worship table
CREATE TABLE IF NOT EXISTS places_of_worship (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid REFERENCES listings(id),
  organizer_id uuid REFERENCES auth.users(id),
  name text NOT NULL,
  denomination text,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip text NOT NULL,
  latitude numeric,
  longitude numeric,
  website text,
  phone text,
  email text,
  service_times text,
  description text,
  noise_level text,
  crowd_level text,
  lighting text,
  sensory_features text[],
  accessibility_notes text,
  images text[],
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Step 4: Update listings type constraint to include place_of_worship
-- First, check if the constraint exists and drop it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'listings_type_check'
  ) THEN
    ALTER TABLE listings DROP CONSTRAINT listings_type_check;
  END IF;
END $$;

-- Add new constraint with place_of_worship
ALTER TABLE listings ADD CONSTRAINT listings_type_check 
CHECK (type IN ('event', 'venue', 'park', 'playground', 'place_of_worship'));

-- Step 5: Enable RLS on places_of_worship
ALTER TABLE places_of_worship ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for places_of_worship
CREATE POLICY "Public can view all places of worship"
  ON places_of_worship
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert places of worship"
  ON places_of_worship
  FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update places of worship"
  ON places_of_worship
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Organizers can update their own places of worship"
  ON places_of_worship
  FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid());

-- Step 7: Create function to automatically set is_organizer when user role changes
CREATE OR REPLACE FUNCTION sync_profile_organizer_role()
RETURNS TRIGGER AS $$
BEGIN
  -- When users.role is set to organizer/business/admin, update profiles.is_organizer
  IF NEW.role IN ('organizer', 'business', 'admin') THEN
    UPDATE profiles
    SET is_organizer = true, updated_at = now()
    WHERE id = NEW.id;
  ELSIF OLD.role IN ('organizer', 'business', 'admin') AND NEW.role NOT IN ('organizer', 'business', 'admin') THEN
    UPDATE profiles
    SET is_organizer = false, updated_at = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Create trigger to sync role changes
DROP TRIGGER IF EXISTS sync_organizer_role_trigger ON users;
CREATE TRIGGER sync_organizer_role_trigger
  AFTER INSERT OR UPDATE OF role ON users
  FOR EACH ROW
  EXECUTE FUNCTION sync_profile_organizer_role();

-- Step 9: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_is_organizer ON profiles(is_organizer);
CREATE INDEX IF NOT EXISTS idx_places_of_worship_organizer ON places_of_worship(organizer_id);
CREATE INDEX IF NOT EXISTS idx_places_of_worship_city_state ON places_of_worship(city, state);

COMMENT ON TABLE places_of_worship IS 'Free submission type for places of worship offering sensory-friendly services';
COMMENT ON COLUMN profiles.is_organizer IS 'Synced from users.role - true if user can submit listings';
