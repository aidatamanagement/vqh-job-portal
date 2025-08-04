-- Populate resume_url field for existing applications
-- This migration sets a placeholder value for existing applications
-- The application will handle fallback to getResumeUrl() when resume_url is NULL

-- Update existing applications with a placeholder value
-- This ensures the field exists but lets the application handle the actual URL resolution
UPDATE public.job_applications 
SET resume_url = 'legacy-application'
WHERE resume_url IS NULL 
AND id IS NOT NULL;

-- Add a comment to document this migration
COMMENT ON COLUMN public.job_applications.resume_url IS 'URL of uploaded resume file with correct file extension (legacy-application for old records)'; 