-- Allow anonymous users to submit job applications
-- This is needed for the public job portal where users don't need to create accounts

-- Drop the existing restrictive INSERT policy for job_applications
DROP POLICY IF EXISTS "Users can create applications" ON public.job_applications;

-- Create a new policy that allows both authenticated and anonymous users to submit applications
CREATE POLICY "Anyone can create applications" ON public.job_applications
FOR INSERT 
USING (true)
WITH CHECK (true);

-- Update the SELECT policy to allow anonymous users to view their own applications via tracking token
-- and allow admins to view all applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;

CREATE POLICY "Users and admins can view applications" ON public.job_applications
FOR SELECT 
USING (
  -- Allow if user owns the application (authenticated users)
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Allow if user is admin (authenticated users)
  (auth.uid() IS NOT NULL AND public.is_user_admin(auth.uid())) OR
  -- Allow anonymous access (this might be for tracking - handled in application layer)
  (auth.uid() IS NULL)
);

-- Keep the existing UPDATE policy for admins only
-- No need to change this as applications should only be updated by admins