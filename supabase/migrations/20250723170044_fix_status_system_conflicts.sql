-- Migration to fix status system conflicts
-- This fixes the mismatch between frontend expectations and database constraints

-- Drop existing conflicting constraints
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS job_applications_status_check;
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS valid_status_check;

-- Add the correct constraint that matches the frontend HR/Manager flow
ALTER TABLE public.job_applications 
ADD CONSTRAINT job_applications_status_check 
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

-- Update any existing records to map to new statuses
UPDATE public.job_applications 
SET status = CASE 
  WHEN status = 'under_review' THEN 'shortlisted_for_hr'
  WHEN status = 'shortlisted' THEN 'shortlisted_for_hr'
  WHEN status = 'interviewed' THEN 'manager_interviewed'
  WHEN status = 'interview_scheduled' THEN 'manager_interviewed'
  WHEN status = 'decisioning' THEN 'manager_interviewed'
  ELSE status
END
WHERE status IN ('under_review', 'shortlisted', 'interviewed', 'interview_scheduled', 'decisioning');

-- Update the status validation function to match frontend expectations
CREATE OR REPLACE FUNCTION public.validate_status_transition(current_status text, new_status text)
RETURNS boolean
LANGUAGE plpgsql
AS $function$
DECLARE
  valid_transitions JSONB := '{
    "application_submitted": ["shortlisted_for_hr", "rejected", "waiting_list"],
    "shortlisted_for_hr": ["hr_interviewed", "rejected", "waiting_list"],
    "hr_interviewed": ["shortlisted_for_manager", "rejected", "waiting_list"],
    "shortlisted_for_manager": ["manager_interviewed", "rejected", "waiting_list"],
    "manager_interviewed": ["hired", "rejected", "waiting_list"],
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

-- Fix the status change logging trigger to work with notes properly
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Note: We don't insert here because the application code handles this manually
    -- This trigger is kept for backward compatibility but doesn't duplicate entries
    NULL;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Ensure the update function works correctly with the new statuses
CREATE OR REPLACE FUNCTION public.update_application_status_with_notes(
  application_id UUID,
  new_status TEXT,
  notes_text TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  current_application RECORD;
  updated_application RECORD;
  result JSONB;
BEGIN
  -- Validate inputs
  IF application_id IS NULL THEN
    RAISE EXCEPTION 'Application ID is required';
  END IF;
  
  IF new_status IS NULL THEN
    RAISE EXCEPTION 'New status is required';
  END IF;
  
  IF notes_text IS NULL OR LENGTH(TRIM(notes_text)) = 0 THEN
    RAISE EXCEPTION 'Notes are mandatory for status updates';
  END IF;
  
  -- Validate status is allowed
  IF new_status NOT IN ('application_submitted', 'shortlisted_for_hr', 'hr_interviewed', 'shortlisted_for_manager', 'manager_interviewed', 'hired', 'rejected', 'waiting_list') THEN
    RAISE EXCEPTION 'Invalid status: %', new_status;
  END IF;
  
  -- Get current application data
  SELECT * INTO current_application
  FROM public.job_applications
  WHERE id = application_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found with ID: %', application_id;
  END IF;
  
  -- Validate status transition
  IF NOT public.validate_status_transition(current_application.status, new_status) THEN
    RAISE EXCEPTION 'Invalid status transition from % to %', current_application.status, new_status;
  END IF;
  
  -- Update the application status
  UPDATE public.job_applications
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = application_id
  RETURNING * INTO updated_application;
  
  -- Insert the status change history with notes
  INSERT INTO public.status_history (
    application_id,
    previous_status,
    new_status,
    changed_by,
    notes,
    transition_valid
  ) VALUES (
    application_id,
    current_application.status,
    new_status,
    auth.uid(),
    notes_text,
    true
  );
  
  -- Return the updated application data with job info
  SELECT 
    jsonb_build_object(
      'id', ja.id,
      'job_id', ja.job_id,
      'first_name', ja.first_name,
      'last_name', ja.last_name,
      'email', ja.email,
      'phone', ja.phone,
      'applied_position', ja.applied_position,
      'status', ja.status,
      'created_at', ja.created_at,
      'updated_at', ja.updated_at,
      'tracking_token', ja.tracking_token,
      'jobs', jsonb_build_object(
        'office_location', j.office_location,
        'position', j.position
      )
    ) INTO result
  FROM public.job_applications ja
  LEFT JOIN public.jobs j ON ja.job_id = j.id
  WHERE ja.id = application_id;
  
  RETURN result;
END;
$function$;

-- Add comment to document this migration
COMMENT ON CONSTRAINT job_applications_status_check ON public.job_applications IS 
'Fixed status constraint to match frontend HR/Manager interview flow expectations';