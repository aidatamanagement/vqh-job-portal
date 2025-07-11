-- Auto-deactivate job when application is marked as hired
-- This ensures the job posting is closed once someone is hired

-- Create function to handle job deactivation when application status changes to 'hired'
CREATE OR REPLACE FUNCTION public.auto_deactivate_job_on_hire()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only proceed if status changed to 'hired' from a different status
  IF NEW.status = 'hired' AND (OLD.status IS NULL OR OLD.status != 'hired') THEN
    -- Deactivate the corresponding job posting
    UPDATE public.jobs 
    SET 
      is_active = false,
      updated_at = NOW()
    WHERE id = NEW.job_id;
    
    -- Log the action for debugging
    RAISE NOTICE 'Job % automatically deactivated due to hire for application %', NEW.job_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to execute the function after application status updates
CREATE TRIGGER auto_deactivate_job_on_hire_trigger
  AFTER UPDATE ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_deactivate_job_on_hire();

-- Add comment explaining the trigger
COMMENT ON TRIGGER auto_deactivate_job_on_hire_trigger ON public.job_applications IS 
'Automatically deactivates a job posting when any application for that job is marked as hired';

COMMENT ON FUNCTION public.auto_deactivate_job_on_hire() IS 
'Function to automatically set job is_active=false when an application status changes to hired'; 