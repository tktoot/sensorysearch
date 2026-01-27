-- Fix RLS policies for admin access to listings table
-- This ensures admins can see ALL pending submissions in the moderation queue

-- First, drop existing admin policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all listings" ON listings;
DROP POLICY IF EXISTS "Admins can update all listings" ON listings;
DROP POLICY IF EXISTS "Admins can delete listings" ON listings;

-- Create comprehensive admin policies
-- Admin can SELECT all listings (including pending)
CREATE POLICY "Admins can view all listings"
ON listings FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Admin can UPDATE any listing (for approve/reject)
CREATE POLICY "Admins can update all listings"
ON listings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Admin can DELETE any listing if needed
CREATE POLICY "Admins can delete listings"
ON listings FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Also ensure admin policies exist for all live tables
-- Venues
DROP POLICY IF EXISTS "Admins can view all venues" ON venues;
CREATE POLICY "Admins can view all venues"
ON venues FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Events
DROP POLICY IF EXISTS "Admins can view all events" ON events;
CREATE POLICY "Admins can view all events"
ON events FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Parks
DROP POLICY IF EXISTS "Admins can view all parks" ON parks;
CREATE POLICY "Admins can view all parks"
ON parks FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Playgrounds
DROP POLICY IF EXISTS "Admins can view all playgrounds" ON playgrounds;
CREATE POLICY "Admins can view all playgrounds"
ON playgrounds FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Places of worship
DROP POLICY IF EXISTS "Admins can view all places_of_worship" ON places_of_worship;
CREATE POLICY "Admins can view all places_of_worship"
ON places_of_worship FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Grant execute permission on approve_submission function to authenticated users
GRANT EXECUTE ON FUNCTION approve_submission TO authenticated;

-- Verify: Check if your admin user has the correct role
-- Run this query manually to check: SELECT id, email, role FROM profiles WHERE email = 'your-admin-email@example.com';
-- If role is not 'admin', update it: UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';

COMMENT ON POLICY "Admins can view all listings" ON listings IS 'Allows admins to see all submissions including pending ones for moderation';
