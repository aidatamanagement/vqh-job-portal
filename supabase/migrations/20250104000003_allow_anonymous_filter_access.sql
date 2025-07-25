-- Allow anonymous users to view all available types, jobs, and locations for filtering
-- This enables the job portal filters to work properly for anonymous users

-- Allow anonymous access to job_positions for filtering
DROP POLICY IF EXISTS "Allow anonymous read job_positions" ON public.job_positions;
CREATE POLICY "Allow anonymous read job_positions" ON public.job_positions
    FOR SELECT
    TO anon
    USING (true);

-- Allow anonymous access to job_locations for filtering
DROP POLICY IF EXISTS "Allow anonymous read job_locations" ON public.job_locations;
CREATE POLICY "Allow anonymous read job_locations" ON public.job_locations
    FOR SELECT
    TO anon
    USING (true);

-- Allow anonymous access to job_facilities for filtering
DROP POLICY IF EXISTS "Allow anonymous read job_facilities" ON public.job_facilities;
CREATE POLICY "Allow anonymous read job_facilities" ON public.job_facilities
    FOR SELECT
    TO anon
    USING (true);

-- Allow anonymous access to jobs for filtering (only active jobs)
DROP POLICY IF EXISTS "Allow anonymous read active jobs for filtering" ON public.jobs;
CREATE POLICY "Allow anonymous read active jobs for filtering" ON public.jobs
    FOR SELECT
    TO anon
    USING (is_active = true);

-- Enable RLS on all tables if not already enabled
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY; 