
-- Enable RLS on all target tables (safe to run even if already enabled)
ALTER TABLE IF EXISTS public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.job_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies safely if they exist
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view active jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;

DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users can create applications" ON public.job_applications;
DROP POLICY IF EXISTS "Admins can update applications" ON public.job_applications;

DROP POLICY IF EXISTS "Anyone can view positions" ON public.job_positions;
DROP POLICY IF EXISTS "Admins can modify positions" ON public.job_positions;

DROP POLICY IF EXISTS "Anyone can view locations" ON public.job_locations;
DROP POLICY IF EXISTS "Admins can modify locations" ON public.job_locations;

DROP POLICY IF EXISTS "Anyone can view facilities" ON public.job_facilities;
DROP POLICY IF EXISTS "Admins can modify facilities" ON public.job_facilities;

-- Create new policies for `profiles` table
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id);

-- Create policies for `jobs` table
CREATE POLICY "Anyone can view active jobs" ON public.jobs
FOR SELECT 
USING (
  is_active = true OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can insert jobs" ON public.jobs
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update jobs" ON public.jobs
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete jobs" ON public.jobs
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for `job_applications` table
CREATE POLICY "Users can view own applications" ON public.job_applications
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can create applications" ON public.job_applications
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can update applications" ON public.job_applications
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policies for master data tables

-- Positions
CREATE POLICY "Anyone can view positions" ON public.job_positions
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can modify positions" ON public.job_positions
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Locations
CREATE POLICY "Anyone can view locations" ON public.job_locations
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can modify locations" ON public.job_locations
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Facilities
CREATE POLICY "Anyone can view facilities" ON public.job_facilities
FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins can modify facilities" ON public.job_facilities
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
