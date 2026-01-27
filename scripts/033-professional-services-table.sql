-- Create professional_services table matching existing patterns
-- This table stores approved professional service listings (dentists, therapists, etc.)

CREATE TABLE IF NOT EXISTS professional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT, -- dentist, therapist, OT, PT, speech therapy, pediatrician, etc.
  
  -- Address fields (matching other tables)
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Contact info
  phone TEXT,
  email TEXT,
  website TEXT,
  social_link TEXT,
  
  -- Business details
  hours TEXT,
  appointment_required BOOLEAN DEFAULT false,
  insurance_accepted BOOLEAN DEFAULT false,
  
  -- Sensory fields (matching other tables)
  noise_level TEXT,
  lighting_level TEXT,
  crowd_level TEXT,
  density_level TEXT,
  
  -- Accessibility fields
  wheelchair_accessible BOOLEAN DEFAULT false,
  accessible_parking BOOLEAN DEFAULT false,
  accessible_restroom BOOLEAN DEFAULT false,
  
  -- Sensory support fields
  quiet_space_available BOOLEAN DEFAULT false,
  sensory_friendly_hours_available BOOLEAN DEFAULT false,
  headphones_allowed BOOLEAN DEFAULT false,
  staff_trained BOOLEAN DEFAULT false,
  
  -- Images (matching other tables)
  images ARRAY DEFAULT '{}',
  hero_image_url TEXT,
  photo_urls TEXT[],
  sensory_features ARRAY DEFAULT '{}',
  accessibility_notes TEXT,
  
  -- Tracking fields
  organizer_id UUID REFERENCES profiles(id),
  submission_id UUID REFERENCES listings(id),
  created_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_professional_services_city ON professional_services(city);
CREATE INDEX IF NOT EXISTS idx_professional_services_category ON professional_services(category);
CREATE INDEX IF NOT EXISTS idx_professional_services_organizer ON professional_services(organizer_id);

-- Enable RLS
ALTER TABLE professional_services ENABLE ROW LEVEL SECURITY;

-- RLS Policies (matching other tables)
-- Public can view all professional services
DROP POLICY IF EXISTS "Public can view all professional services" ON professional_services;
CREATE POLICY "Public can view all professional services"
  ON professional_services FOR SELECT
  USING (true);

-- Admins can insert professional services
DROP POLICY IF EXISTS "Admins can insert professional services" ON professional_services;
CREATE POLICY "Admins can insert professional services"
  ON professional_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update professional services
DROP POLICY IF EXISTS "Admins can update professional services" ON professional_services;
CREATE POLICY "Admins can update professional services"
  ON professional_services FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Beta users can insert (matching other tables' beta policy)
DROP POLICY IF EXISTS "professional_services_insert_beta" ON professional_services;
CREATE POLICY "professional_services_insert_beta"
  ON professional_services FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Organizers can update their own listings
DROP POLICY IF EXISTS "Organizers can update their own professional services" ON professional_services;
CREATE POLICY "Organizers can update their own professional services"
  ON professional_services FOR UPDATE
  USING (organizer_id = auth.uid());

COMMENT ON TABLE professional_services IS 'Stores approved professional service listings like dentists, therapists, etc.';
