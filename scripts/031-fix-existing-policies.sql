-- Drop and recreate storage policies to avoid conflicts
-- This fixes the "syntax error at or near 'not'" issue

-- Drop existing storage policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
  DROP POLICY IF EXISTS "Public read access" ON storage.objects;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate storage policies
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-uploads');

CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-uploads');

-- Drop and recreate listings policies
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Public can view approved listings" ON listings;
  DROP POLICY IF EXISTS "Authenticated users can submit listings" ON listings;
  DROP POLICY IF EXISTS "Users can view own submissions" ON listings;
  DROP POLICY IF EXISTS "Admins can update listings" ON listings;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Recreate listings policies
CREATE POLICY "Public can view approved listings"
ON listings FOR SELECT
TO public
USING (status = 'approved');

CREATE POLICY "Authenticated users can submit listings"
ON listings FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can view own submissions"
ON listings FOR SELECT
TO authenticated
USING (organizer_id = auth.uid());

CREATE POLICY "Admins can update listings"
ON listings FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);
