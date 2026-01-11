-- Add standardized sensory and accessibility fields to all final tables
-- This migration adds consistent fields across events, venues, parks, playgrounds, and places_of_worship

-- ======================
-- EVENTS TABLE
-- ======================
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS lighting_level TEXT CHECK (lighting_level IN ('dim_soft', 'moderate', 'bright')),
ADD COLUMN IF NOT EXISTS density_level TEXT CHECK (density_level IN ('spacious', 'moderate', 'tight_crowded')),
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_parking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_restroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly_hours BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS headphones_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS staff_trained BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS amplified_sound BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flashing_lights BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS indoor_event BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS outdoor_event BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS expected_crowd_size TEXT CHECK (expected_crowd_size IN ('small', 'medium', 'large')),
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS photo_urls TEXT[];

-- Update noise_level and crowd_level to use standardized enum values
ALTER TABLE events
DROP CONSTRAINT IF EXISTS events_noise_level_check,
DROP CONSTRAINT IF EXISTS events_crowd_level_check;

ALTER TABLE events
ADD CONSTRAINT events_noise_level_check CHECK (noise_level IN ('quiet', 'moderate', 'loud_at_times')),
ADD CONSTRAINT events_crowd_level_check CHECK (crowd_level IN ('low', 'moderate', 'busy'));

-- ======================
-- VENUES TABLE
-- ======================
ALTER TABLE venues
ADD COLUMN IF NOT EXISTS lighting_level TEXT CHECK (lighting_level IN ('dim_soft', 'moderate', 'bright')),
ADD COLUMN IF NOT EXISTS density_level TEXT CHECK (density_level IN ('spacious', 'moderate', 'tight_crowded')),
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_parking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_restroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly_hours BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS headphones_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS staff_trained BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS photo_urls TEXT[];

-- Update noise_level and crowd_level to use standardized enum values
ALTER TABLE venues
DROP CONSTRAINT IF EXISTS venues_noise_level_check,
DROP CONSTRAINT IF EXISTS venues_crowd_level_check;

ALTER TABLE venues
ADD CONSTRAINT venues_noise_level_check CHECK (noise_level IN ('quiet', 'moderate', 'loud_at_times')),
ADD CONSTRAINT venues_crowd_level_check CHECK (crowd_level IN ('low', 'moderate', 'busy'));

-- ======================
-- PARKS TABLE
-- ======================
ALTER TABLE parks
ADD COLUMN IF NOT EXISTS lighting_level TEXT CHECK (lighting_level IN ('dim_soft', 'moderate', 'bright')),
ADD COLUMN IF NOT EXISTS density_level TEXT CHECK (density_level IN ('spacious', 'moderate', 'tight_crowded')),
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_parking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_restroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly_hours BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS headphones_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS staff_trained BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fencing_type TEXT CHECK (fencing_type IN ('fully_fenced', 'partially_fenced', 'not_fenced')),
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dogs_on_leash BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS no_pets BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shaded_areas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS benches_seating BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS soft_ground BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS photo_urls TEXT[];

-- Update noise_level and crowd_level to use standardized enum values
ALTER TABLE parks
DROP CONSTRAINT IF EXISTS parks_noise_level_check,
DROP CONSTRAINT IF EXISTS parks_crowd_level_check;

ALTER TABLE parks
ADD CONSTRAINT parks_noise_level_check CHECK (noise_level IN ('quiet', 'moderate', 'loud_at_times')),
ADD CONSTRAINT parks_crowd_level_check CHECK (crowd_level IN ('low', 'moderate', 'busy'));

-- ======================
-- PLAYGROUNDS TABLE
-- ======================
ALTER TABLE playgrounds
ADD COLUMN IF NOT EXISTS lighting_level TEXT CHECK (lighting_level IN ('dim_soft', 'moderate', 'bright')),
ADD COLUMN IF NOT EXISTS density_level TEXT CHECK (density_level IN ('spacious', 'moderate', 'tight_crowded')),
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_parking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_restroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly_hours BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS headphones_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS staff_trained BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS fencing_type TEXT CHECK (fencing_type IN ('fully_fenced', 'partially_fenced', 'not_fenced')),
ADD COLUMN IF NOT EXISTS pets_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS dogs_on_leash BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS no_pets BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS shaded_areas BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS benches_seating BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS soft_ground BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS photo_urls TEXT[];

-- Update noise_level and crowd_level to use standardized enum values
ALTER TABLE playgrounds
DROP CONSTRAINT IF EXISTS playgrounds_noise_level_check,
DROP CONSTRAINT IF EXISTS playgrounds_crowd_level_check;

ALTER TABLE playgrounds
ADD CONSTRAINT playgrounds_noise_level_check CHECK (noise_level IN ('quiet', 'moderate', 'loud_at_times')),
ADD CONSTRAINT playgrounds_crowd_level_check CHECK (crowd_level IN ('low', 'moderate', 'busy'));

-- ======================
-- PLACES_OF_WORSHIP TABLE
-- ======================
ALTER TABLE places_of_worship
ADD COLUMN IF NOT EXISTS lighting_level TEXT CHECK (lighting_level IN ('dim_soft', 'moderate', 'bright')),
ADD COLUMN IF NOT EXISTS density_level TEXT CHECK (density_level IN ('spacious', 'moderate', 'tight_crowded')),
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_parking BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS accessible_restroom BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_space_available BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly_hours BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS headphones_allowed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS staff_trained BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_friendly_service BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS quiet_cry_room BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS flexible_seating BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sensory_kits BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS photo_urls TEXT[];

-- Update noise_level and crowd_level to use standardized enum values
ALTER TABLE places_of_worship
DROP CONSTRAINT IF EXISTS places_of_worship_noise_level_check,
DROP CONSTRAINT IF EXISTS places_of_worship_crowd_level_check;

ALTER TABLE places_of_worship
ADD CONSTRAINT places_of_worship_noise_level_check CHECK (noise_level IN ('quiet', 'moderate', 'loud_at_times')),
ADD CONSTRAINT places_of_worship_crowd_level_check CHECK (crowd_level IN ('low', 'moderate', 'busy'));

-- Add comments for documentation
COMMENT ON COLUMN events.lighting_level IS 'Standardized lighting level: dim_soft, moderate, or bright';
COMMENT ON COLUMN events.density_level IS 'Space to move: spacious, moderate, or tight_crowded';
COMMENT ON COLUMN events.wheelchair_accessible IS 'Whether venue/event is wheelchair accessible';
COMMENT ON COLUMN events.hero_image_url IS 'Primary image shown in listings (first uploaded photo)';
COMMENT ON COLUMN events.photo_urls IS 'Additional photos for gallery';

COMMENT ON COLUMN venues.lighting_level IS 'Standardized lighting level: dim_soft, moderate, or bright';
COMMENT ON COLUMN venues.density_level IS 'Space to move: spacious, moderate, or tight_crowded';
COMMENT ON COLUMN venues.wheelchair_accessible IS 'Whether venue is wheelchair accessible';
COMMENT ON COLUMN venues.hero_image_url IS 'Primary image shown in listings (first uploaded photo)';
COMMENT ON COLUMN venues.photo_urls IS 'Additional photos for gallery';

COMMENT ON COLUMN parks.fencing_type IS 'Park fencing: fully_fenced, partially_fenced, or not_fenced';
COMMENT ON COLUMN parks.hero_image_url IS 'Primary image shown in listings (first uploaded photo)';
COMMENT ON COLUMN parks.photo_urls IS 'Additional photos for gallery';

COMMENT ON COLUMN playgrounds.fencing_type IS 'Playground fencing: fully_fenced, partially_fenced, or not_fenced';
COMMENT ON COLUMN playgrounds.hero_image_url IS 'Primary image shown in listings (first uploaded photo)';
COMMENT ON COLUMN playgrounds.photo_urls IS 'Additional photos for gallery';

COMMENT ON COLUMN places_of_worship.sensory_friendly_service IS 'Whether sensory-friendly services are available';
COMMENT ON COLUMN places_of_worship.quiet_cry_room IS 'Whether a quiet room or cry room is available';
COMMENT ON COLUMN places_of_worship.hero_image_url IS 'Primary image shown in listings (first uploaded photo)';
COMMENT ON COLUMN places_of_worship.photo_urls IS 'Additional photos for gallery';
