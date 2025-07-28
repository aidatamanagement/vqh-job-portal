-- Add referral fields to job_applications table
-- Migration: 20250105000001_add_referral_fields_to_applications.sql

-- Add referral fields to job_applications table
ALTER TABLE public.job_applications
ADD COLUMN is_referred_by_employee BOOLEAN DEFAULT FALSE,
ADD COLUMN referred_by_employee_name VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN public.job_applications.is_referred_by_employee IS 'Whether the applicant was referred by a current ViaQuest Hospice employee';
COMMENT ON COLUMN public.job_applications.referred_by_employee_name IS 'Full name of the current employee who referred the applicant (if applicable)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_job_applications_referral ON public.job_applications(is_referred_by_employee); 