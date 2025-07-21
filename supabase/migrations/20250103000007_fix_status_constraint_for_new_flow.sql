-- Fix status constraint to include new interview flow statuses
-- This migration updates the valid_status_check constraint to allow the new multi-round interview statuses

-- First, update any existing records that might have old statuses
UPDATE public.job_applications
SET status = CASE
  WHEN status = 'shortlisted' THEN 'shortlisted_for_hr'
  WHEN status = 'interviewed' THEN 'manager_interviewed'
  WHEN status = 'under_review' THEN 'shortlisted_for_hr'
  ELSE status
END
WHERE status IN ('shortlisted', 'interviewed', 'under_review');

-- Drop the old constraint
ALTER TABLE public.job_applications DROP CONSTRAINT IF EXISTS valid_status_check;

-- Add the new constraint with all the new statuses
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

-- Drop the existing function first, then recreate it
DROP FUNCTION IF EXISTS public.validate_status_transition(text, text);

-- Update the validate_status_transition function to handle the new flow
CREATE OR REPLACE FUNCTION public.validate_status_transition(
  old_status text,
  new_status text
) RETURNS boolean AS $$
BEGIN
  -- Define valid transitions for the new multi-round interview flow
  CASE old_status
    WHEN 'application_submitted' THEN
      RETURN new_status IN ('shortlisted_for_hr', 'rejected', 'waiting_list');
    WHEN 'shortlisted_for_hr' THEN
      RETURN new_status IN ('hr_interviewed', 'rejected', 'waiting_list');
    WHEN 'hr_interviewed' THEN
      RETURN new_status IN ('shortlisted_for_manager', 'rejected', 'waiting_list');
    WHEN 'shortlisted_for_manager' THEN
      RETURN new_status IN ('manager_interviewed', 'rejected', 'waiting_list');
    WHEN 'manager_interviewed' THEN
      RETURN new_status IN ('hired', 'rejected', 'waiting_list');
    WHEN 'hired' THEN
      RETURN false; -- Can't transition from hired
    WHEN 'rejected' THEN
      RETURN false; -- Can't transition from rejected
    WHEN 'waiting_list' THEN
      RETURN new_status IN ('shortlisted_for_hr', 'shortlisted_for_manager', 'hired', 'rejected');
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql; 