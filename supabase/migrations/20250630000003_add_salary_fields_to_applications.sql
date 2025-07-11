-- Add salary fields to job_applications table
-- This allows applicants to specify their salary expectations with different types

-- Add salary type enum
CREATE TYPE salary_type AS ENUM ('hourly_rate', 'full_package_range', 'fixed_package', 'fixed_hourly_rate');

-- Add salary columns to job_applications table
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS salary_type salary_type,
ADD COLUMN IF NOT EXISTS salary_min DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS salary_max DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS salary_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS salary_currency VARCHAR(3) DEFAULT 'USD';

-- Add comments to document the purpose of these fields
COMMENT ON COLUMN public.job_applications.salary_type IS 'Type of salary expectation: hourly_rate, full_package_range, fixed_package, or fixed_hourly_rate';
COMMENT ON COLUMN public.job_applications.salary_min IS 'Minimum salary for range types (hourly rate or annual package)';
COMMENT ON COLUMN public.job_applications.salary_max IS 'Maximum salary for range types (hourly rate or annual package)';
COMMENT ON COLUMN public.job_applications.salary_amount IS 'Fixed salary amount for fixed package or fixed hourly rate types';
COMMENT ON COLUMN public.job_applications.salary_currency IS 'Currency code (USD, EUR, etc.)';

-- Create index for better performance when querying by salary type
CREATE INDEX IF NOT EXISTS idx_job_applications_salary_type ON public.job_applications(salary_type); 