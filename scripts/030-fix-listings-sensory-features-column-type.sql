-- Fix the sensory_features column type to accept JSONB instead of ARRAY
-- This allows us to store structured sensory data properly

ALTER TABLE listings 
  ALTER COLUMN sensory_features TYPE jsonb USING sensory_features::text::jsonb;

COMMENT ON COLUMN listings.sensory_features IS 'Structured sensory and accessibility data as JSONB object';
