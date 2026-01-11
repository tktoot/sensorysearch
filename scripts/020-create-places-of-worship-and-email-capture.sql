-- Priority 1 & 2: Create places_of_worship table
CREATE TABLE IF NOT EXISTS places_of_worship (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  organizer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  denomination TEXT,
  description TEXT NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Contact
  service_times TEXT,
  hours TEXT,
  website TEXT,
  email TEXT,
  phone TEXT,
  social_link TEXT,
  
  -- Sensory attributes
  noise_level TEXT,
  crowd_level TEXT,
  lighting TEXT,
  sensory_features TEXT[] DEFAULT ARRAY[]::TEXT[],
  accessibility_notes TEXT,
  
  -- Media
  images TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Metadata
  published_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for places_of_worship
ALTER TABLE places_of_worship ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all places of worship"
  ON places_of_worship FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert places of worship"
  ON places_of_worship FOR INSERT
  TO authenticated
  WITH CHECK (
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

-- Priority 3: Email capture system
CREATE TABLE IF NOT EXISTS email_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  source TEXT NOT NULL, -- 'favorites', 'alerts', 'resource_download', 'organizer_submit'
  zip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  opted_in BOOLEAN DEFAULT true,
  unsubscribed_at TIMESTAMPTZ,
  
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_source CHECK (source IN ('favorites', 'alerts', 'resource_download', 'organizer_submit', 'beta_signup'))
);

-- RLS for email_signups
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

CREATE POLICY "Admins can update email signups"
  ON email_signups FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add constraint to listings type if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'listings_type_check'
  ) THEN
    ALTER TABLE listings 
    ADD CONSTRAINT listings_type_check 
    CHECK (type IN ('event', 'venue', 'park', 'playground', 'place_of_worship'));
  END IF;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_places_of_worship_city ON places_of_worship(city);
CREATE INDEX IF NOT EXISTS idx_places_of_worship_zip ON places_of_worship(zip);
CREATE INDEX IF NOT EXISTS idx_email_signups_source ON email_signups(source);
CREATE INDEX IF NOT EXISTS idx_email_signups_opted_in ON email_signups(opted_in);

COMMENT ON TABLE places_of_worship IS 'Final promoted table for approved place of worship submissions';
COMMENT ON TABLE email_signups IS 'Email capture for various user actions - NOT connected to ConvertKit';
