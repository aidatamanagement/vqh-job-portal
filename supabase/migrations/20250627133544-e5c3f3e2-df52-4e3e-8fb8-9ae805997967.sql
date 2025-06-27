
-- First, let's check what constraint exists and update it
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS valid_status_check;

-- Add the correct constraint that matches our new status flow
ALTER TABLE public.job_applications 
ADD CONSTRAINT valid_status_check 
CHECK (status IN (
  'application_submitted',
  'under_review', 
  'shortlisted',
  'interviewed',
  'hired',
  'rejected',
  'waiting_list'
));

-- Also make sure we don't have any conflicting constraints
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;
