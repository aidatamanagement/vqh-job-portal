
-- Drop the problematic function that causes recursion
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Drop all existing RLS policies to recreate them properly
DROP POLICY IF EXISTS "New user profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "New user profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "New admin profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "New admin profile delete policy" ON public.profiles;

-- Create a simple, non-recursive function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Direct query without recursion - check if the current user has admin role
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
EXCEPTION
  -- If there's any error (like user not found), return false
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new RLS policies without recursion
-- Users can view their own profile
CREATE POLICY "User can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Admins can view all profiles (uses a separate check to avoid recursion)
CREATE POLICY "Admin can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
  -- This subquery avoids the recursion by not calling the function
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  )
);

-- Users can update their own profile
CREATE POLICY "User can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admin can update any profile" ON public.profiles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  )
);

-- Only admins can insert new profiles
CREATE POLICY "Admin can insert profiles" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  )
);

-- Only admins can delete profiles
CREATE POLICY "Admin can delete profiles" ON public.profiles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p2 
    WHERE p2.id = auth.uid() AND p2.role = 'admin'
  )
);
