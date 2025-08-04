-- Fix profile table RLS policies (Dashboard Safe Version)
-- This migration only handles profiles table - storage policies must be set via Dashboard UI
-- Date: 2025-01-03

-- PART 1: FIX PROFILES TABLE RLS POLICIES ONLY
-- ============================================

-- Drop all existing conflicting policies on profiles table
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

-- PART 2: ENSURE PROPER TABLE SETUP
-- =================================

-- Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Ensure profile_image_url column exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.profiles.profile_image_url IS 'URL to user profile image stored in Supabase Storage';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_image_url ON public.profiles(profile_image_url) WHERE profile_image_url IS NOT NULL;

-- PART 3: ROLE ESCALATION PROTECTION
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

-- VERIFICATION: Check if policies were created successfully
-- You can run this to verify:
-- SELECT policy_name, policy_definition FROM pg_policies WHERE tablename = 'profiles';