-- Ensure public-uploads bucket exists with correct permissions
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-uploads', 'public-uploads', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated users can upload to public-uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-uploads');

-- Allow anyone to view files
CREATE POLICY IF NOT EXISTS "Anyone can view public-uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-uploads');

-- Allow users to delete their own files
CREATE POLICY IF NOT EXISTS "Users can delete their own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
