-- Fix profile upload RLS policy violations
-- This migration consolidates and fixes all profile image related RLS policies
-- Date: 2025-01-03 (Final Fix)

-- PART 1: FIX PROFILES TABLE RLS POLICIES
-- =====================================

-- Drop all existing conflicting policies
DROP POLICY IF EXISTS "Profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile delete policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Ensure the helper function exists
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;

-- Create comprehensive profiles table RLS policies
CREATE POLICY "Profiles SELECT policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.is_user_admin()
);

CREATE POLICY "Profiles UPDATE policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.is_user_admin()
) WITH CHECK (
  auth.uid() = id OR 
  public.is_user_admin()
);

CREATE POLICY "Profiles INSERT policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id OR 
  public.is_user_admin()
);

CREATE POLICY "Profiles DELETE policy" ON public.profiles
FOR DELETE TO authenticated
USING (
  public.is_user_admin() AND auth.uid() != id
);

-- PART 2: FIX STORAGE BUCKET RLS POLICIES
-- =======================================

-- Ensure the profile-images bucket exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'profile-images') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES ('profile-images', 'profile-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    END IF;
END $$;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop all existing conflicting storage policies
DROP POLICY IF EXISTS "Users can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view profile images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all profile images" ON storage.objects;

-- Create consistent storage policies using the foldername approach
-- Policy 1: Allow public viewing of profile images
CREATE POLICY "Profile images public view" ON storage.objects
FOR SELECT USING (
    bucket_id = 'profile-images'
);

-- Policy 2: Allow authenticated users to upload their own profile images
CREATE POLICY "Profile images user upload" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 3: Allow authenticated users to update their own profile images
CREATE POLICY "Profile images user update" ON storage.objects
FOR UPDATE TO authenticated
USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
) WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 4: Allow authenticated users to delete their own profile images
CREATE POLICY "Profile images user delete" ON storage.objects
FOR DELETE TO authenticated
USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy 5: Allow admins to manage all profile images
CREATE POLICY "Profile images admin manage" ON storage.objects
FOR ALL TO authenticated
USING (
    bucket_id = 'profile-images' AND 
    public.is_user_admin()
) WITH CHECK (
    bucket_id = 'profile-images' AND 
    public.is_user_admin()
);

-- PART 3: ENSURE PROPER TABLE SETUP
-- =================================

-- Ensure RLS is enabled on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Ensure profile_image_url column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.profile_image_url IS 'URL to user profile image stored in Supabase Storage';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_image_url ON public.profiles(profile_image_url) WHERE profile_image_url IS NOT NULL;

-- PART 4: ROLE ESCALATION PROTECTION
-- ==================================

-- Ensure role escalation prevention trigger exists
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger AS $$
BEGIN
  -- If a non-admin user is trying to change their role, prevent it
  IF OLD.id = auth.uid() AND OLD.role != NEW.role AND NOT public.is_user_admin() THEN
    RAISE EXCEPTION 'Users cannot change their own role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;

-- Create the trigger
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.prevent_role_escalation() TO authenticated;

-- PART 5: VERIFICATION QUERIES (FOR TESTING)
-- ==========================================

-- These are commented out but can be run manually to verify the fix
-- SELECT policy_name, policy_definition FROM pg_policies WHERE tablename = 'profiles';
-- SELECT policy_name, policy_definition FROM pg_policies WHERE tablename = 'objects' AND policy_definition LIKE '%profile-images%';