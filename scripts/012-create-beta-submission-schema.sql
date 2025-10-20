-- Create listings table for events, venues, and parks
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('event', 'venue', 'park')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'draft')),
  
  -- Common fields
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  social_link TEXT,
  
  -- Location
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Event-specific
  event_date DATE,
  event_start_time TIME,
  event_end_time TIME,
  venue_name TEXT,
  
  -- Sensory attributes
  sensory_features TEXT[], -- Array of feature IDs
  crowd_level TEXT CHECK (crowd_level IN ('small', 'normal', 'large')),
  accessibility_notes TEXT,
  
  -- Images
  images TEXT[], -- Array of Blob URLs
  
  -- Organizer
  organizer_id UUID REFERENCES public.users(id),
  organizer_email TEXT NOT NULL,
  
  -- Moderation
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES public.users(id),
  rejection_reason TEXT,
  moderator_notes TEXT,
  
  -- Metadata
  source TEXT DEFAULT 'beta',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create organizer_profiles table for trial tracking
CREATE TABLE IF NOT EXISTS public.organizer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) UNIQUE,
  email TEXT NOT NULL UNIQUE,
  business_name TEXT,
  
  -- Trial tracking
  trial_started_at TIMESTAMP WITH TIME ZONE,
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  is_trial_active BOOLEAN DEFAULT FALSE,
  
  -- Subscription (for post-beta)
  subscription_status TEXT CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'past_due')),
  subscription_tier TEXT CHECK (subscription_tier IN ('basic', 'featured', 'premium')),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON public.listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON public.listings(type);
CREATE INDEX IF NOT EXISTS idx_listings_organizer ON public.listings(organizer_id);
CREATE INDEX IF NOT EXISTS idx_listings_submitted_at ON public.listings(submitted_at);
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_user_id ON public.organizer_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organizer_profiles_email ON public.organizer_profiles(email);

-- Enable Row Level Security
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizer_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for listings
CREATE POLICY "Anyone can view approved listings"
  ON public.listings FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Organizers can view their own listings"
  ON public.listings FOR SELECT
  USING (organizer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Organizers can insert their own listings"
  ON public.listings FOR INSERT
  WITH CHECK (organizer_email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Organizers can update their own pending listings"
  ON public.listings FOR UPDATE
  USING (organizer_email = current_setting('request.jwt.claims', true)::json->>'email' AND status = 'pending');

-- RLS Policies for organizer_profiles
CREATE POLICY "Users can view their own organizer profile"
  ON public.organizer_profiles FOR SELECT
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can insert their own organizer profile"
  ON public.organizer_profiles FOR INSERT
  WITH CHECK (email = current_setting('request.jwt.claims', true)::json->>'email');

CREATE POLICY "Users can update their own organizer profile"
  ON public.organizer_profiles FOR UPDATE
  USING (email = current_setting('request.jwt.claims', true)::json->>'email');
