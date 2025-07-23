-- Remove duplicate trigger that's causing conflicts
-- There are 2 triggers calling the same function, causing it to run twice

-- Drop the duplicate trigger (keep only one)
DROP TRIGGER IF EXISTS validate_and_log_status_change ON public.job_applications;

-- Keep only status_change_log_trigger (the original one)
-- Update the remaining trigger function to work properly with RPC calls

CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- Check if we're being called from the RPC function
    -- The RPC function sets a session variable to indicate it handles logging
    IF current_setting('app.using_rpc_function', true) IS NULL OR current_setting('app.using_rpc_function', true) != 'true' THEN
      -- This is a direct table update, not via RPC function
      -- Log with a default note for backward compatibility
      INSERT INTO public.status_history (
        application_id,
        previous_status,
        new_status,
        changed_by,
        notes,
        transition_valid
      ) VALUES (
        NEW.id,
        OLD.status,
        NEW.status,
        auth.uid(),
        'Status updated via direct database modification',
        true
      );
    END IF;
    -- If called from RPC function, do nothing - the function handles logging
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update the RPC function to set session variable so trigger knows not to interfere
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
  -- Set session variable to indicate we're using RPC function
  PERFORM set_config('app.using_rpc_function', 'true', true);
  
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
  
  -- Get current application data
  SELECT * INTO current_application
  FROM public.job_applications
  WHERE id = application_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found with ID: %', application_id;
  END IF;
  
  -- Validate status transition using existing function (with old_status parameter)
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
  
  -- Insert the status change history with notes (we handle this, not the trigger)
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
  
  -- Clear the session variable
  PERFORM set_config('app.using_rpc_function', NULL, true);
  
  -- Return the updated application data WITH tracking_token for emails
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

-- Add comments to document the fix
COMMENT ON TRIGGER status_change_log_trigger ON public.job_applications IS 
'Single trigger for status changes - duplicate trigger removed to prevent conflicts';

COMMENT ON FUNCTION public.update_application_status_with_notes(UUID, TEXT, TEXT) IS 
'Updates application status with mandatory notes. Uses session variable to coordinate with trigger to prevent conflicts.';