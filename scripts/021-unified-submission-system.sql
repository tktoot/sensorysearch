-- =====================================================
-- UNIFIED SUBMISSION SYSTEM WITH EMAIL CAPTURE
-- =====================================================
-- This migration creates a complete submission-to-approval pipeline
-- with proper final tables, email capture, and data promotion.

-- Step 1: Create places_of_worship table (missing from current schema)
CREATE TABLE IF NOT EXISTS places_of_worship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  denomination TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  
  -- Contact info
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Media
  images TEXT[] DEFAULT '{}',
  
  -- Sensory attributes
  noise_level TEXT CHECK (noise_level IN ('Quiet', 'Moderate', 'Loud')),
  lighting TEXT CHECK (lighting IN ('Dim', 'Natural', 'Bright')),
  crowd_level TEXT CHECK (crowd_level IN ('Low', 'Moderate', 'High')),
  sensory_features TEXT[] DEFAULT '{}',
  
  -- Accessibility
  wheelchair_accessible BOOLEAN DEFAULT false,
  quiet_space_available BOOLEAN DEFAULT false,
  sensory_friendly_hours_available BOOLEAN DEFAULT false,
  accessibility_notes TEXT,
  
  -- Schedule
  hours_text TEXT,
  
  -- Meta
  organizer_id UUID REFERENCES users(id),
  submission_id UUID REFERENCES listings(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Update listings table to be a true unified submissions table
-- Add missing columns if they don't exist
ALTER TABLE listings ADD COLUMN IF NOT EXISTS payload JSONB;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_entity_id UUID;

-- Update type constraint to include all 4 types
ALTER TABLE listings DROP CONSTRAINT IF EXISTS listings_type_check;
ALTER TABLE listings ADD CONSTRAINT listings_type_check 
  CHECK (type IN ('event', 'venue', 'park_playground', 'place_of_worship'));

-- Step 3: Ensure all final tables have required columns
-- Add missing columns to venues table
ALTER TABLE venues ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';
ALTER TABLE venues ADD COLUMN IF NOT EXISTS hours_text TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS entry_fee_text TEXT;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false;
ALTER TABLE venues ADD COLUMN IF NOT EXISTS sensory_friendly_hours_available BOOLEAN DEFAULT false;

-- Sync images to photo_urls if needed
UPDATE venues SET photo_urls = images WHERE photo_urls IS NULL OR photo_urls = '{}';
UPDATE venues SET hero_image_url = images[1] WHERE hero_image_url IS NULL AND array_length(images, 1) > 0;

-- Add missing columns to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';
ALTER TABLE events ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false;

-- Sync images to photo_urls if needed
UPDATE events SET photo_urls = images WHERE photo_urls IS NULL OR photo_urls = '{}';
UPDATE events SET hero_image_url = images[1] WHERE hero_image_url IS NULL AND array_length(images, 1) > 0;

-- Add missing columns to parks table
ALTER TABLE parks ADD COLUMN IF NOT EXISTS hero_image_url TEXT;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT '{}';
ALTER TABLE parks ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false;
ALTER TABLE parks ADD COLUMN IF NOT EXISTS entry_fee_text TEXT DEFAULT 'Free';

-- Sync images to photo_urls if needed
UPDATE parks SET photo_urls = images WHERE photo_urls IS NULL OR photo_urls = '{}';
UPDATE parks SET hero_image_url = images[1] WHERE hero_image_url IS NULL AND array_length(images, 1) > 0;

-- Step 4: Create email_signups table for email capture
CREATE TABLE IF NOT EXISTS email_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL CHECK (source IN ('favorites', 'alerts', 'organizer_submit', 'beta_signup')),
  zip TEXT,
  opted_in BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- Step 5: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_places_of_worship_city ON places_of_worship(city);
CREATE INDEX IF NOT EXISTS idx_places_of_worship_published ON places_of_worship(published_at);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON listings(type);
CREATE INDEX IF NOT EXISTS idx_email_signups_email ON email_signups(email);
CREATE INDEX IF NOT EXISTS idx_email_signups_opted_in ON email_signups(opted_in);

-- Step 6: Set up RLS policies for places_of_worship
ALTER TABLE places_of_worship ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all places of worship"
  ON places_of_worship FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert places of worship"
  ON places_of_worship FOR INSERT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update places of worship"
  ON places_of_worship FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Organizers can update their own worship places"
  ON places_of_worship FOR UPDATE
  TO authenticated
  USING (organizer_id = auth.uid());

-- Step 7: Set up RLS policies for email_signups
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert email signups"
  ON email_signups FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins can view all email signups"
  ON email_signups FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Users can update their own email signup"
  ON email_signups FOR UPDATE
  TO public
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

-- Step 8: Create helper function for submission approval
CREATE OR REPLACE FUNCTION approve_submission(
  submission_id UUID,
  reviewer_id UUID
) RETURNS UUID AS $$
DECLARE
  submission_record RECORD;
  new_entity_id UUID;
BEGIN
  -- Get the submission
  SELECT * INTO submission_record
  FROM listings
  WHERE id = submission_id AND status = 'pending';
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found or already processed';
  END IF;
  
  -- Promote to appropriate final table based on type
  CASE submission_record.type
    WHEN 'event' THEN
      INSERT INTO events (
        name, description, venue_name, address, city, state, zip,
        event_date, event_start_time, event_end_time,
        noise_level, lighting, crowd_level, sensory_features,
        accessibility_notes, images, photo_urls, hero_image_url,
        email, phone, website,
        organizer_id, submission_id
      ) VALUES (
        submission_record.title,
        submission_record.description,
        submission_record.venue_name,
        submission_record.address,
        submission_record.city,
        submission_record.state,
        submission_record.zip,
        submission_record.event_date,
        submission_record.event_start_time,
        submission_record.event_end_time,
        COALESCE((submission_record.payload->>'noise_level')::text, 'Moderate'),
        COALESCE((submission_record.payload->>'lighting')::text, 'Natural'),
        submission_record.crowd_level,
        submission_record.sensory_features,
        submission_record.accessibility_notes,
        submission_record.images,
        submission_record.images,
        submission_record.images[1],
        submission_record.email,
        submission_record.phone,
        submission_record.website,
        submission_record.organizer_id,
        submission_record.id
      ) RETURNING id INTO new_entity_id;
      
    WHEN 'venue' THEN
      INSERT INTO venues (
        name, description, category, address, city, state, zip,
        noise_level, lighting, crowd_level, sensory_features,
        accessibility_notes, images, photo_urls, hero_image_url,
        hours_text, email, phone, website,
        wheelchair_accessible, quiet_space_available, sensory_friendly_hours_available,
        organizer_id, submission_id
      ) VALUES (
        submission_record.title,
        submission_record.description,
        submission_record.category,
        submission_record.address,
        submission_record.city,
        submission_record.state,
        submission_record.zip,
        COALESCE((submission_record.payload->>'noise_level')::text, 'Moderate'),
        COALESCE((submission_record.payload->>'lighting')::text, 'Natural'),
        submission_record.crowd_level,
        submission_record.sensory_features,
        submission_record.accessibility_notes,
        submission_record.images,
        submission_record.images,
        submission_record.images[1],
        COALESCE((submission_record.payload->>'hours')::text, 'See website'),
        submission_record.email,
        submission_record.phone,
        submission_record.website,
        COALESCE((submission_record.payload->>'wheelchair_accessible')::boolean, false),
        COALESCE((submission_record.payload->>'quiet_space_available')::boolean, false),
        COALESCE((submission_record.payload->>'sensory_friendly_hours')::boolean, false),
        submission_record.organizer_id,
        submission_record.id
      ) RETURNING id INTO new_entity_id;
      
    WHEN 'park_playground' THEN
      INSERT INTO parks (
        name, description, address, city, state, zip,
        noise_level, crowd_level, sensory_features,
        accessibility_notes, images, photo_urls, hero_image_url,
        hours, email, phone, website,
        wheelchair_accessible, quiet_space_available,
        organizer_id, submission_id
      ) VALUES (
        submission_record.title,
        submission_record.description,
        submission_record.address,
        submission_record.city,
        submission_record.state,
        submission_record.zip,
        COALESCE((submission_record.payload->>'noise_level')::text, 'Moderate'),
        submission_record.crowd_level,
        submission_record.sensory_features,
        submission_record.accessibility_notes,
        submission_record.images,
        submission_record.images,
        submission_record.images[1],
        COALESCE((submission_record.payload->>'hours')::text, 'Dawn to dusk'),
        submission_record.email,
        submission_record.phone,
        submission_record.website,
        COALESCE((submission_record.payload->>'wheelchair_accessible')::boolean, false),
        COALESCE((submission_record.payload->>'quiet_space_available')::boolean, false),
        submission_record.organizer_id,
        submission_record.id
      ) RETURNING id INTO new_entity_id;
      
    WHEN 'place_of_worship' THEN
      INSERT INTO places_of_worship (
        name, description, denomination, address, city, state, zip,
        noise_level, lighting, crowd_level, sensory_features,
        accessibility_notes, images,
        hours_text, email, phone, website,
        wheelchair_accessible, quiet_space_available, sensory_friendly_hours_available,
        organizer_id, submission_id
      ) VALUES (
        submission_record.title,
        submission_record.description,
        submission_record.category,
        submission_record.address,
        submission_record.city,
        submission_record.state,
        submission_record.zip,
        COALESCE((submission_record.payload->>'noise_level')::text, 'Quiet'),
        COALESCE((submission_record.payload->>'lighting')::text, 'Natural'),
        submission_record.crowd_level,
        submission_record.sensory_features,
        submission_record.accessibility_notes,
        submission_record.images,
        COALESCE((submission_record.payload->>'hours')::text, 'See website'),
        submission_record.email,
        submission_record.phone,
        submission_record.website,
        COALESCE((submission_record.payload->>'wheelchair_accessible')::boolean, false),
        COALESCE((submission_record.payload->>'quiet_space_available')::boolean, false),
        COALESCE((submission_record.payload->>'sensory_friendly_hours')::boolean, false),
        submission_record.organizer_id,
        submission_record.id
      ) RETURNING id INTO new_entity_id;
      
    ELSE
      RAISE EXCEPTION 'Unknown submission type: %', submission_record.type;
  END CASE;
  
  -- Update submission status
  UPDATE listings
  SET 
    status = 'approved',
    approved_entity_id = new_entity_id,
    reviewed_by = reviewer_id,
    reviewed_at = NOW()
  WHERE id = submission_id;
  
  RETURN new_entity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION approve_submission(UUID, UUID) TO authenticated;

COMMENT ON FUNCTION approve_submission IS 'Promotes an approved submission to its final table';
