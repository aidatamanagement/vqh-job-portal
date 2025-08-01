-- Fix RLS policies for profile image updates
-- Date: 2025-01-03

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Enhanced profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profile delete policy" ON public.profiles;
DROP POLICY IF EXISTS "User can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "User can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Fixed user profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "Fixed user profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Fixed admin profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Fixed admin profile delete policy" ON public.profiles;

-- Create simple helper function to check if user is admin
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

-- 1. SELECT Policy: Users can view their own profile + Admins can view all profiles
CREATE POLICY "Profile view policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.is_user_admin()
);

-- 2. UPDATE Policy: Users can update their own profile (including profile_image_url) + Admins can update any profile
CREATE POLICY "Profile update policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  -- Users can update their own profile (including profile_image_url)
  (auth.uid() = id) OR 
  -- Admins can update any profile
  public.is_user_admin()
);

-- 3. INSERT Policy: Allow new user profile creation + Admin-created profiles
CREATE POLICY "Profile insert policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow users to create their own profile during registration
  (auth.uid() = id) OR 
  -- Allow admins to create profiles for others
  public.is_user_admin()
);

-- 4. DELETE Policy: Only admins can delete profiles (except their own)
CREATE POLICY "Profile delete policy" ON public.profiles
FOR DELETE TO authenticated
USING (
  public.is_user_admin() AND auth.uid() != id
);

-- Add trigger to prevent users from escalating their own privileges
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