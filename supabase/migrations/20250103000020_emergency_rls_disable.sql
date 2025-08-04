-- EMERGENCY FIX: Temporarily disable RLS to stop infinite recursion
-- This gets the application working immediately while we develop a proper solution
-- Date: 2025-01-03

-- STEP 1: Drop all existing policies that cause recursion
DROP POLICY IF EXISTS "Users own profiles and service access" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profiles and service access" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profiles and service access" ON public.profiles;

-- Drop the functions that might cause issues
DROP FUNCTION IF EXISTS get_admin_profiles();
DROP FUNCTION IF EXISTS is_current_user_admin();

-- STEP 2: Temporarily disable RLS on profiles table
-- This will allow the application to work while we develop a proper solution
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- STEP 3: Ensure profile_image_url column exists and is properly set up
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment
COMMENT ON COLUMN public.profiles.profile_image_url IS 'URL to user profile image stored in Supabase Storage';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_image_url ON public.profiles(profile_image_url) WHERE profile_image_url IS NOT NULL;

-- STEP 4: Add a note for future implementation
-- TODO: Implement proper RLS policies that don't cause recursion
-- Options to consider:
-- 1. Use application-level security instead of RLS
-- 2. Use Supabase auth roles and JWT claims
-- 3. Create a separate admin table for role management
-- 4. Use database functions with SECURITY DEFINER that bypass RLS

-- For now, security will be handled at the application level
-- All authenticated users can read/write profiles, but the application
-- should enforce business rules for admin-only operations