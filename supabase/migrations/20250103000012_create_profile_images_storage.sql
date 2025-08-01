-- Create profile-images storage bucket and RLS policies
-- Date: 2025-01-03

-- Note: The profile-images bucket should be created manually in the Supabase dashboard
-- Go to Storage → Create bucket → Name: profile-images → Public bucket
-- This migration only sets up the RLS policies

-- Check if the bucket exists before creating policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'profile-images') THEN
    RAISE EXCEPTION 'profile-images bucket does not exist. Please create it manually in the Supabase dashboard.';
  END IF;
END $$;

-- Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
);

-- Policy to allow users to view their own profile images
CREATE POLICY "Users can view their own profile images" ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
);

-- Policy to allow users to update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
)
WITH CHECK (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
);

-- Policy to allow users to delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
);

-- Policy to allow public access to view profile images (for displaying in UI)
CREATE POLICY "Public can view profile images" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

-- Note: Storage permissions are managed by Supabase automatically
-- The RLS policies above will handle access control 