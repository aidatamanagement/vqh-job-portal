-- Update the status constraint to include the new interview statuses
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS valid_status_check;

-- Add the updated constraint with the new interview statuses
ALTER TABLE public.job_applications 
ADD CONSTRAINT valid_status_check 
CHECK (status IN (
  'application_submitted',
  'under_review', 
  'shortlisted',
  'manager_interview',
  'second_interview',
  'hired',
  'rejected',
  'waiting_list'
));

-- Also update any existing 'interviewed' status to 'manager_interview' for backward compatibility
UPDATE public.job_applications 
SET status = 'manager_interview' 
WHERE status = 'interviewed'; 