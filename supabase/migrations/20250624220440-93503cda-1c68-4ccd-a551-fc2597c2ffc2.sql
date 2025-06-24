
-- First, remove any existing check constraints on the status column
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Update all existing records to use the new status system
-- Map old statuses to appropriate new ones
UPDATE public.job_applications 
SET status = CASE 
  WHEN status = 'waiting' THEN 'application_submitted'
  WHEN status = 'rejected' THEN 'rejected'
  WHEN status IS NULL THEN 'application_submitted'
  ELSE 'application_submitted'
END;

-- Update the default value for new records
ALTER TABLE public.job_applications 
ALTER COLUMN status SET DEFAULT 'application_submitted';

-- Add the new check constraint with only the 7 new statuses
ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_status_check 
CHECK (status IN (
  'application_submitted',
  'under_review', 
  'shortlisted',
  'interview_scheduled',
  'decisioning',
  'hired',
  'rejected'
));
