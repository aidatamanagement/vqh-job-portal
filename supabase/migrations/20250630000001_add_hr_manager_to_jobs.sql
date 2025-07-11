-- Add hr_manager_id field to jobs table
-- This allows assigning an HR manager to each job posting

ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS hr_manager_id UUID;

-- Add foreign key constraint to profiles table
ALTER TABLE public.jobs 
ADD CONSTRAINT fk_jobs_hr_manager 
FOREIGN KEY (hr_manager_id) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Add comment to document the purpose of this field
COMMENT ON COLUMN public.jobs.hr_manager_id IS 'HR manager responsible for handling all applicants for this job posting';

-- Create index for better performance when querying jobs by HR manager
CREATE INDEX IF NOT EXISTS idx_jobs_hr_manager_id ON public.jobs(hr_manager_id); 