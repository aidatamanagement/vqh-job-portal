-- Add resume_url field to job_applications table
-- This allows storing the actual resume file URL with correct extension

ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS resume_url TEXT;

-- Add comment to document the purpose of this field
COMMENT ON COLUMN public.job_applications.resume_url IS 'URL of uploaded resume file with correct file extension'; 