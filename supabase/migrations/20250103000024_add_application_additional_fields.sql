-- Add additional fields to job_applications table
-- Migration: 20250103000024_add_application_additional_fields.sql

-- Add new columns for additional application information
ALTER TABLE job_applications 
ADD COLUMN IF NOT EXISTS has_previously_worked_at_viaquest BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_day_of_employment DATE,
ADD COLUMN IF NOT EXISTS certification_signature TEXT,
ADD COLUMN IF NOT EXISTS opt_in_to_sms BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS privacy_policy_accepted BOOLEAN DEFAULT FALSE;

-- Add comments for documentation
COMMENT ON COLUMN job_applications.has_previously_worked_at_viaquest IS 'Whether the candidate has previously worked at ViaQuest Hospice';
COMMENT ON COLUMN job_applications.last_day_of_employment IS 'Last day of employment with ViaQuest (if previously worked)';
COMMENT ON COLUMN job_applications.certification_signature IS 'Digital signature for application certification';
COMMENT ON COLUMN job_applications.opt_in_to_sms IS 'Whether candidate opted in to receive SMS messages';
COMMENT ON COLUMN job_applications.privacy_policy_accepted IS 'Whether candidate accepted the privacy policy';

-- Create index for efficient querying of previous employees
CREATE INDEX IF NOT EXISTS idx_job_applications_previous_viaquest_employees 
ON job_applications(has_previously_worked_at_viaquest) 
WHERE has_previously_worked_at_viaquest = TRUE;

-- Create index for SMS opt-in status
CREATE INDEX IF NOT EXISTS idx_job_applications_sms_opt_in 
ON job_applications(opt_in_to_sms) 
WHERE opt_in_to_sms = TRUE;

-- Update RLS policies to include new columns
-- Note: Existing RLS policies should automatically apply to new columns
-- but we'll ensure they're explicitly mentioned for clarity

-- For admin users (existing policy should work)
-- For anonymous applications (existing policy should work)
-- For authenticated users (existing policy should work)

-- Add validation constraint for certification signature
ALTER TABLE job_applications 
ADD CONSTRAINT chk_certification_signature_not_empty 
CHECK (certification_signature IS NULL OR LENGTH(TRIM(certification_signature)) > 0);

-- Add validation constraint for last day of employment
ALTER TABLE job_applications 
ADD CONSTRAINT chk_last_day_employment_valid 
CHECK (
  (has_previously_worked_at_viaquest = FALSE AND last_day_of_employment IS NULL) OR
  (has_previously_worked_at_viaquest = TRUE AND last_day_of_employment IS NOT NULL)
);
