
-- Only create the trigger if it doesn't exist (the functions should already exist)
-- First, let's safely create the trigger
DO $$
BEGIN
    -- Check if trigger exists and drop it if it does
    IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'validate_and_log_status_change') THEN
        DROP TRIGGER validate_and_log_status_change ON public.job_applications;
    END IF;
    
    -- Create the trigger
    CREATE TRIGGER validate_and_log_status_change
        BEFORE UPDATE ON public.job_applications
        FOR EACH ROW
        EXECUTE FUNCTION public.log_status_change();
END $$;

-- Try to add the constraint (ignore if it already exists)
DO $$
BEGIN
    -- Try to add the constraint, ignore if it already exists
    BEGIN
        ALTER TABLE public.job_applications 
        ADD CONSTRAINT valid_status_check 
        CHECK (status IN (
          'application_submitted',
          'under_review', 
          'shortlisted',
          'interview_scheduled',
          'decisioning',
          'hired',
          'rejected'
        ));
    EXCEPTION
        WHEN duplicate_object THEN
            -- Constraint already exists, do nothing
            NULL;
    END;
END $$;
