-- Fix RLS policies for submissions to listings table
-- This ensures authenticated organizers can INSERT submissions

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Organizers can insert their own listings" ON public.listings;
DROP POLICY IF EXISTS "Authenticated users can submit listings" ON public.listings;

-- Create a single comprehensive INSERT policy
CREATE POLICY "Authenticated users can submit their own listings"
ON public.listings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = organizer_id
);

-- Ensure organizers can view their own submissions
CREATE POLICY "Users can view their own pending listings" 
ON public.listings
FOR SELECT
TO authenticated
USING (
  organizer_id = auth.uid()
);

-- Grant necessary permissions
GRANT INSERT ON public.listings TO authenticated;
GRANT SELECT ON public.listings TO authenticated;

-- Add helpful comment
COMMENT ON POLICY "Authenticated users can submit their own listings" ON public.listings IS 
'Allows any authenticated user to submit a listing with their user ID as organizer_id';
