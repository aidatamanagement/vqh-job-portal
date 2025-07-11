-- RLS Policies for Profile Images Storage Bucket
-- Run these in your Supabase SQL Editor to fix the "RLS policy violation" error

-- Policy 1: Allow authenticated users to INSERT their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT 
TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 2: Allow public SELECT access to view profile images  
CREATE POLICY "Anyone can view profile images" ON storage.objects
FOR SELECT 
TO public
USING (bucket_id = 'profile-images');

-- Policy 3: Allow authenticated users to UPDATE their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE 
TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow authenticated users to DELETE their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE 
TO authenticated
USING (
  bucket_id = 'profile-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Enable RLS on storage.objects table (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY; 