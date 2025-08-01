-- Create comprehensive RLS policies for profile image storage
-- Users can update, view, delete, upload their own images
-- Others can view images
-- Admins can delete, update, upload, view all images

-- First, ensure the profile-images bucket exists
DO $$
BEGIN
    -- Check if profile-images bucket exists
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-images') THEN
        -- Create the bucket if it doesn't exist
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('profile-images', 'profile-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    END IF;
END $$;

-- Enable RLS on storage.objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all profile images" ON storage.objects;

-- Policy 1: Users can view all profile images (for public access)
CREATE POLICY "Users can view profile images" ON storage.objects
FOR SELECT USING (
    bucket_id = 'profile-images'
);

-- Policy 2: Users can upload their own profile images
CREATE POLICY "Users can upload their own profile images" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Users can update their own profile images
CREATE POLICY "Users can update their own profile images" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Users can delete their own profile images
CREATE POLICY "Users can delete their own profile images" ON storage.objects
FOR DELETE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 5: Admins can manage all profile images (full access)
CREATE POLICY "Admins can manage all profile images" ON storage.objects
FOR ALL USING (
    bucket_id = 'profile-images' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
) WITH CHECK (
    bucket_id = 'profile-images' AND 
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Also ensure profiles table has proper RLS policies for avatar_url updates
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;

-- Policy for users to update their own profile (including avatar_url)
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Policy for users to view all profiles
CREATE POLICY "Users can view all profiles" ON profiles
FOR SELECT USING (true);

-- Policy for admins to manage all profiles
CREATE POLICY "Admins can manage all profiles" ON profiles
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
) WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Ensure RLS is enabled on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY; 