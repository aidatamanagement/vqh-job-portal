-- Update RLS policies for profiles table with better role-based access control
-- Date: 2025-01-03

-- Drop existing policies to recreate them with improvements
DROP POLICY IF EXISTS "Fixed user profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "Fixed user profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Fixed admin profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Fixed admin profile delete policy" ON public.profiles;

-- Create improved helper functions for role checking
CREATE OR REPLACE FUNCTION public.is_admin_or_hr(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.can_manage_users(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_or_hr(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_users(UUID) TO authenticated;

-- 1. SELECT Policy: Users can view their own profile + Admins/HR can view all profiles
CREATE POLICY "Enhanced profile view policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.is_admin_or_hr()
);

-- 2. UPDATE Policy: Users can update their own basic info + Admins can update all
CREATE POLICY "Enhanced profile update policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  -- Users can update their own profile (except role)
  (auth.uid() = id) OR 
  -- Admins can update any profile
  public.can_manage_users()
)
WITH CHECK (
  -- Prevent users from changing their own role
  CASE 
    WHEN auth.uid() = id THEN 
      (OLD.role = NEW.role OR NEW.role IS NULL)
    ELSE true
  END
);

-- 3. INSERT Policy: Allow new user profile creation + Admin-created profiles
CREATE POLICY "Enhanced profile insert policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  -- Allow users to create their own profile during registration
  (auth.uid() = id) OR 
  -- Allow admins to create profiles for others (user creation feature)
  public.can_manage_users()
);

-- 4. DELETE Policy: Only admins can delete profiles (except their own)
CREATE POLICY "Enhanced profile delete policy" ON public.profiles
FOR DELETE TO authenticated
USING (
  public.can_manage_users() AND auth.uid() != id
);

-- 5. Special policy for service role (edge functions)
-- Allow service role to bypass RLS for edge function operations
-- This is handled by using the SUPABASE_SERVICE_ROLE_KEY in edge functions

-- Add trigger to prevent users from escalating their own privileges
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger AS $$
BEGIN
  -- If a non-admin user is trying to change their role, prevent it
  IF OLD.id = auth.uid() AND OLD.role != NEW.role AND NOT public.can_manage_users() THEN
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