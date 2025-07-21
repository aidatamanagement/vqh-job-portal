-- Migration to update interview flow with HR and Manager rounds
-- This migration implements the new flow: application_submitted -> shortlisted_for_hr -> hr_interviewed -> shortlisted_for_manager -> manager_interviewed -> hired/rejected

-- First, update existing records to map to new statuses
UPDATE public.job_applications 
SET status = CASE 
  WHEN status = 'shortlisted' THEN 'shortlisted_for_hr'
  WHEN status = 'interviewed' THEN 'manager_interviewed'
  WHEN status = 'under_review' THEN 'shortlisted_for_hr'
  ELSE status
END;

-- Update the status constraint to include the new interview flow
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS valid_status_check;
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Add the updated constraint with the new interview flow
ALTER TABLE public.job_applications 
ADD CONSTRAINT valid_status_check 
CHECK (status IN (
  'application_submitted',
  'shortlisted_for_hr',
  'hr_interviewed',
  'shortlisted_for_manager',
  'manager_interviewed',
  'hired',
  'rejected',
  'waiting_list'
));

-- Update the status validation function for the new flow
CREATE OR REPLACE FUNCTION public.validate_status_transition(current_status text, new_status text)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
  valid_transitions JSONB := '{
    "application_submitted": ["shortlisted_for_hr", "rejected"],
    "shortlisted_for_hr": ["hr_interviewed", "rejected"],
    "hr_interviewed": ["shortlisted_for_manager", "rejected"],
    "shortlisted_for_manager": ["manager_interviewed", "rejected"],
    "manager_interviewed": ["hired", "rejected"],
    "hired": [],
    "rejected": [],
    "waiting_list": ["shortlisted_for_hr", "shortlisted_for_manager", "hired", "rejected"]
  }';
BEGIN
  -- If trying to set the same status, it's invalid
  IF current_status = new_status THEN
    RETURN FALSE;
  END IF;
  
  -- Check if the transition is in the allowed list
  RETURN (valid_transitions->current_status) ? new_status;
END;
$function$;

-- Log the migration
INSERT INTO public.migration_log (migration_name, applied_at, description)
VALUES (
  '20250103000006_update_interview_flow_with_hr_manager_rounds',
  NOW(),
  'Updated interview flow to include HR and Manager rounds: application_submitted -> shortlisted_for_hr -> hr_interviewed -> shortlisted_for_manager -> manager_interviewed -> hired/rejected'
); 