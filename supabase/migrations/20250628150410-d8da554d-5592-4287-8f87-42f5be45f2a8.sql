
-- First, let's see what roles currently exist and update them properly
-- Update existing profiles to use new role names
UPDATE public.profiles 
SET role = CASE 
  WHEN role = 'user' OR role IS NULL THEN 'branch_manager'
  WHEN role = 'admin' THEN 'admin'
  WHEN role = 'branch_manager' THEN 'branch_manager'
  WHEN role = 'hr' THEN 'hr'
  WHEN role = 'trainer' THEN 'trainer'
  WHEN role = 'content_manager' THEN 'content_manager'
  ELSE 'branch_manager'  -- Default for any other values
END;

-- Add check constraint to ensure only valid roles are used
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'branch_manager', 'hr', 'trainer', 'content_manager'));

-- Drop ALL existing RLS policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profile view access" ON public.profiles;
DROP POLICY IF EXISTS "Profile update access" ON public.profiles;
DROP POLICY IF EXISTS "Profile insert access" ON public.profiles;
DROP POLICY IF EXISTS "Profile delete access" ON public.profiles;
DROP POLICY IF EXISTS "User profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "User profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Admin profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Admin profile delete policy" ON public.profiles;

-- Create a security definer function to get current user role (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create new RLS policies with completely new names
-- Users can view their own profile OR admins can view all profiles
CREATE POLICY "New user profile view policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'admin'
);

-- Users can update their own profile OR admins can update any profile
CREATE POLICY "New user profile update policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.get_current_user_role() = 'admin'
);

-- Only admins can insert new profiles (for user creation)
CREATE POLICY "New admin profile insert policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (public.get_current_user_role() = 'admin');

-- Only admins can delete profiles
CREATE POLICY "New admin profile delete policy" ON public.profiles
FOR DELETE TO authenticated
USING (public.get_current_user_role() = 'admin');
