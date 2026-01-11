-- Create separate final tables for approved listings

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES listings(id),
  organizer_id UUID REFERENCES users(id),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT,
  
  -- Location
  venue_name TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Event Details
  event_date DATE NOT NULL,
  event_start_time TIME,
  event_end_time TIME,
  capacity INTEGER,
  age_range TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  social_link TEXT,
  
  -- Sensory Attributes
  noise_level TEXT,
  lighting TEXT,
  crowd_level TEXT,
  sensory_features TEXT[],
  accessibility_notes TEXT,
  
  -- Media
  images TEXT[],
  
  -- Metadata
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Venues table
CREATE TABLE IF NOT EXISTS venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES listings(id),
  organizer_id UUID REFERENCES users(id),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Venue Details
  hours TEXT,
  age_range TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  social_link TEXT,
  
  -- Sensory Attributes
  noise_level TEXT,
  lighting TEXT,
  crowd_level TEXT,
  sensory_features TEXT[],
  accessibility_notes TEXT,
  
  -- Media
  images TEXT[],
  
  -- Metadata
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Parks table
CREATE TABLE IF NOT EXISTS parks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES listings(id),
  organizer_id UUID REFERENCES users(id),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Park Details
  hours TEXT,
  age_range TEXT,
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Sensory Attributes
  noise_level TEXT,
  crowd_level TEXT,
  sensory_features TEXT[],
  accessibility_notes TEXT,
  
  -- Media
  images TEXT[],
  
  -- Metadata
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Playgrounds table
CREATE TABLE IF NOT EXISTS playgrounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES listings(id),
  organizer_id UUID REFERENCES users(id),
  
  -- Basic Info
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  -- Location
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  
  -- Playground Details
  hours TEXT,
  age_range TEXT,
  equipment_types TEXT[],
  
  -- Contact
  email TEXT,
  phone TEXT,
  website TEXT,
  
  -- Sensory Attributes
  noise_level TEXT,
  crowd_level TEXT,
  sensory_features TEXT[],
  accessibility_notes TEXT,
  shade_available BOOLEAN DEFAULT false,
  
  -- Media
  images TEXT[],
  
  -- Metadata
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add approved_entity_id to listings table to track promotion
ALTER TABLE listings ADD COLUMN IF NOT EXISTS approved_entity_id UUID;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_city ON events(city);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_venues_city ON venues(city);
CREATE INDEX IF NOT EXISTS idx_venues_category ON venues(category);
CREATE INDEX IF NOT EXISTS idx_venues_organizer ON venues(organizer_id);
CREATE INDEX IF NOT EXISTS idx_parks_city ON parks(city);
CREATE INDEX IF NOT EXISTS idx_playgrounds_city ON playgrounds(city);

-- RLS Policies for Events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Organizers can update their own events"
  ON events FOR UPDATE
  USING (organizer_id = auth.uid());

-- RLS Policies for Venues
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all venues"
  ON venues FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert venues"
  ON venues FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update venues"
  ON venues FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Organizers can update their own venues"
  ON venues FOR UPDATE
  USING (organizer_id = auth.uid());

-- RLS Policies for Parks
ALTER TABLE parks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all parks"
  ON parks FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert parks"
  ON parks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update parks"
  ON parks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policies for Playgrounds
ALTER TABLE playgrounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all playgrounds"
  ON playgrounds FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert playgrounds"
  ON playgrounds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update playgrounds"
  ON playgrounds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
