-- This script documents that mock data has been removed from the app
-- All pages now fetch from the listings table in Supabase

-- Verify the listings table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'listings';

-- Show current listings status
SELECT status, type, COUNT(*) as count
FROM listings
GROUP BY status, type
ORDER BY status, type;
