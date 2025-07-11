-- Allow anonymous users to view active jobs since job applicants don't need authentication
-- Drop the existing restrictive SELECT policy
DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;

-- Create a simple policy that allows EVERYONE to view ALL jobs 
-- (Admin filtering can be handled in the application layer)
CREATE POLICY "Public can view all jobs" ON public.jobs
FOR SELECT 
USING (true);

-- Create a function to check if user is admin (bypasses RLS recursion)
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- This function runs with SECURITY DEFINER to bypass RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;

-- Create proper admin-only policies using the safe function
DROP POLICY IF EXISTS "Admins can insert jobs" ON public.jobs;
CREATE POLICY "Admins can insert jobs" ON public.jobs
FOR INSERT TO authenticated
WITH CHECK (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
CREATE POLICY "Admins can update jobs" ON public.jobs
FOR UPDATE TO authenticated
USING (public.is_user_admin());

DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admins can delete jobs" ON public.jobs
FOR DELETE TO authenticated
USING (public.is_user_admin()); 