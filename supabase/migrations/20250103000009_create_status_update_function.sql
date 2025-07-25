-- Create function to update application status with notes
-- This function will handle both the status update and notes logging

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
  
  -- Manually insert into status_history with notes
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
  
  -- Return the updated application data
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

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_application_status_with_notes(UUID, TEXT, TEXT) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.update_application_status_with_notes(UUID, TEXT, TEXT) IS 
'Updates application status with mandatory notes and logs the change in status_history'; 