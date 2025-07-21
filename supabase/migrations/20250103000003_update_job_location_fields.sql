-- Update jobs table to have separate office_location and work_location fields
-- This provides better clarity between company office location and actual work location

-- First, rename the existing location column to office_location
ALTER TABLE public.jobs RENAME COLUMN location TO office_location;

-- Add the new work_location column
ALTER TABLE public.jobs 
ADD COLUMN work_location TEXT;

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN public.jobs.office_location IS 'Location of the company office/branch';
COMMENT ON COLUMN public.jobs.work_location IS 'Location where the actual work will be performed (e.g., Remote, On-site, Hybrid, etc.)';

-- Update any existing data to maintain consistency
-- Copy office_location to work_location as a starting point (can be updated later)
UPDATE public.jobs 
SET work_location = office_location 
WHERE work_location IS NULL;