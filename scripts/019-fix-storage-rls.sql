-- Comprehensive storage bucket RLS setup to fix "violates row level security policy" error

-- Ensure public-uploads bucket exists and is public
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'public-uploads', 
  'public-uploads', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE 
SET public = true,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can upload to public-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view public-uploads" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload to public-uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public-uploads');

-- Allow anyone to view files (public bucket)
CREATE POLICY "Anyone can view public-uploads"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'public-uploads');

-- Allow users to delete their own files based on folder structure
CREATE POLICY "Users can delete their own files in public-uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'public-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own files in public-uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'public-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'public-uploads' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);
