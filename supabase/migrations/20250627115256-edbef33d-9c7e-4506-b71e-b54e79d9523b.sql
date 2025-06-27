
-- Drop the existing trigger first
DROP TRIGGER IF EXISTS status_change_log_trigger ON public.job_applications;

-- Remove the existing status transition trigger that enforces automatic updates
DROP TRIGGER IF EXISTS status_change_trigger ON public.job_applications;

-- Update the status constraint to include the new statuses
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;

-- Update existing records to map to new statuses
UPDATE public.job_applications 
SET status = CASE 
  WHEN status = 'interview_scheduled' THEN 'interviewed'
  WHEN status = 'decisioning' THEN 'interviewed'
  ELSE status
END;

-- Add the new constraint with the redesigned status flow
ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_status_check 
CHECK (status IN (
  'application_submitted',
  'under_review', 
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
    "application_submitted": ["under_review", "rejected"],
    "under_review": ["shortlisted", "rejected", "waiting_list"],
    "shortlisted": ["interviewed", "rejected", "waiting_list"],
    "interviewed": ["hired", "rejected", "waiting_list"],
    "hired": [],
    "rejected": [],
    "waiting_list": ["under_review", "shortlisted", "interviewed", "hired", "rejected"]
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

-- Create a simpler logging trigger that doesn't enforce transitions (optional logging only)
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Log the status change without validation enforcement
    INSERT INTO public.status_history (
      application_id,
      previous_status,
      new_status,
      changed_by,
      transition_valid
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid(),
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Re-add the logging trigger (without enforcement)
CREATE TRIGGER status_change_log_trigger
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.log_status_change();
