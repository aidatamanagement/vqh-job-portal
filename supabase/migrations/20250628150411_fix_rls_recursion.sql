-- Fix RLS recursion issue by properly implementing security definer function
-- Drop the problematic function
DROP FUNCTION IF EXISTS public.get_current_user_role();

-- Create a proper security definer function that bypasses RLS
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Temporarily disable RLS for this function execution
  SET row_security = off;
  
  -- Get the role directly without RLS interference
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Re-enable RLS
  SET row_security = on;
  
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Alternative approach: Use a simpler function that doesn't rely on RLS at all
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Use a direct query that bypasses RLS due to SECURITY DEFINER
  SELECT role INTO user_role 
  FROM public.profiles 
  WHERE id = user_id;
  
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Drop all existing policies to recreate them
DROP POLICY IF EXISTS "New user profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "New user profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "New admin profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "New admin profile delete policy" ON public.profiles;

-- Create simplified RLS policies that avoid recursion
-- Users can view their own profile OR if they are admin (using the new function)
CREATE POLICY "Fixed user profile view policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.is_admin()
);

-- Users can update their own profile OR if they are admin
CREATE POLICY "Fixed user profile update policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.is_admin()
);

-- Only admins can insert new profiles
CREATE POLICY "Fixed admin profile insert policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

-- Only admins can delete profiles
CREATE POLICY "Fixed admin profile delete policy" ON public.profiles
FOR DELETE TO authenticated
USING (public.is_admin());

-- Grant execute permissions on the function
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(UUID) TO authenticated; 