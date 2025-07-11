-- Add cover_letter_url field to job_applications table
-- This allows users to upload cover letters as files in addition to the text version

ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS cover_letter_url TEXT;
 
-- Add comment to document the purpose of this field
COMMENT ON COLUMN public.job_applications.cover_letter_url IS 'URL of uploaded cover letter file (optional, in addition to text cover letter)'; 