-- Fix the sensory_features column type in listings table
-- It's currently ARRAY but should be JSONB to store structured data

ALTER TABLE public.listings 
ALTER COLUMN sensory_features TYPE jsonb USING sensory_features::text::jsonb;

COMMENT ON COLUMN public.listings.sensory_features IS 'JSONB object containing all sensory and accessibility data';
