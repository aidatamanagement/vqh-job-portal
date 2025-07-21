-- Migration to remove 'under_review' status and update existing records
-- This migration updates the application status flow to go directly from 'application_submitted' to 'shortlisted'

-- First, update existing 'under_review' records to 'shortlisted'
UPDATE public.job_applications 
SET status = 'shortlisted' 
WHERE status = 'under_review';

-- Update the status constraint to remove 'under_review'
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS valid_status_check;
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Add the updated constraint without 'under_review'
ALTER TABLE public.job_applications 
ADD CONSTRAINT valid_status_check 
CHECK (status IN (
  'application_submitted',
  'shortlisted',
  'interviewed',
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
    "application_submitted": ["shortlisted", "rejected"],
    "shortlisted": ["interviewed", "rejected", "waiting_list"],
    "interviewed": ["hired", "rejected", "waiting_list"],
    "hired": [],
    "rejected": [],
    "waiting_list": ["shortlisted", "interviewed", "hired", "rejected"]
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
  '20250103000005_remove_under_review_status',
  NOW(),
  'Removed under_review status from application flow. Updated existing under_review records to shortlisted. Application flow now goes directly from submitted to shortlisted.'
); 