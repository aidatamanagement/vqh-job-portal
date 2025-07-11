-- Remove salary fields from job_applications table
-- This removes the salary expectations feature as requested

-- Drop salary columns from job_applications table
ALTER TABLE public.job_applications 
DROP COLUMN IF EXISTS salary_type,
DROP COLUMN IF EXISTS salary_min,
DROP COLUMN IF EXISTS salary_max,
DROP COLUMN IF EXISTS salary_amount,
DROP COLUMN IF EXISTS salary_currency;

-- Drop the salary_type enum (this will only work if no other tables use it)
DROP TYPE IF EXISTS salary_type;

-- Add comment to document this change
COMMENT ON TABLE public.job_applications IS 'Job applications table - salary expectations feature removed as of 2024-12-30'; 