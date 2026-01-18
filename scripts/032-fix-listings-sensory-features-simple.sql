-- Fix the sensory_features column type to be JSONB instead of ARRAY
-- This allows storing structured JSON objects with all sensory/accessibility fields

-- Drop the column and recreate it as JSONB
ALTER TABLE listings 
DROP COLUMN IF EXISTS sensory_features;

ALTER TABLE listings 
ADD COLUMN sensory_features JSONB DEFAULT '{}'::jsonb;

-- Add a comment explaining the structure
COMMENT ON COLUMN listings.sensory_features IS 'Structured JSON object containing all sensory and accessibility information including noise level, lighting, crowd level, density level, wheelchair accessibility, parking, restrooms, quiet spaces, sensory-friendly hours, headphones allowed, staff trained, and type-specific fields';
