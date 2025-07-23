-- Migration to make status history notes MANDATORY
-- This enforces that notes are required for every status change at the database level

-- First, update any existing records that have NULL notes to have a default note
UPDATE public.status_history 
SET notes = 'Status updated (no notes provided)' 
WHERE notes IS NULL;

-- Make the notes field MANDATORY (NOT NULL)
ALTER TABLE public.status_history 
ALTER COLUMN notes SET NOT NULL;

-- Add a CHECK constraint to ensure notes are not empty strings
ALTER TABLE public.status_history 
ADD CONSTRAINT status_history_notes_not_empty 
CHECK (notes IS NOT NULL AND LENGTH(TRIM(notes)) > 0);

-- Update the trigger function to ENFORCE mandatory notes
CREATE OR REPLACE FUNCTION public.log_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    -- ENFORCE: Notes must be provided via TG_ARGV[0]
    IF TG_ARGV[0] IS NULL OR LENGTH(TRIM(TG_ARGV[0])) = 0 THEN
      RAISE EXCEPTION 'Notes are MANDATORY for status changes. Please provide notes when updating application status.';
    END IF;
    
    -- Insert the status change with MANDATORY notes
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
      TG_ARGV[0], -- MANDATORY notes from application
      true
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Add comment to document the MANDATORY requirement
COMMENT ON COLUMN public.status_history.notes IS 'MANDATORY notes explaining the status change - cannot be NULL or empty';

-- Add comment to the table
COMMENT ON TABLE public.status_history IS 'Complete audit trail of all application status changes with MANDATORY notes for each change';

-- Add comment to the constraint
COMMENT ON CONSTRAINT status_history_notes_not_empty ON public.status_history IS 'Enforces that notes cannot be empty strings - notes are MANDATORY'; 