-- Allow anonymous users to view master data tables for job filtering
-- This enables filter dropdowns to work for unauthenticated job seekers
-- Date: 2025-01-03

-- Drop existing restrictive policies for master data tables
DROP POLICY IF EXISTS "Anyone can view locations" ON public.job_locations;
DROP POLICY IF EXISTS "Anyone can view positions" ON public.job_positions;
DROP POLICY IF EXISTS "Anyone can view facilities" ON public.job_facilities;

-- Create new policies that allow everyone (authenticated and anonymous) to view master data
-- Locations
CREATE POLICY "Public can view locations" ON public.job_locations
FOR SELECT 
USING (true);

-- Positions  
CREATE POLICY "Public can view positions" ON public.job_positions
FOR SELECT 
USING (true);

-- Facilities
CREATE POLICY "Public can view facilities" ON public.job_facilities
FOR SELECT 
USING (true);

-- Keep admin-only modification policies unchanged
-- (These should already exist from previous migrations) 