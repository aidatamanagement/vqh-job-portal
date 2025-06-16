
-- Remove the foreign key constraint on user_id since we want to allow anonymous applications
ALTER TABLE public.job_applications 
DROP CONSTRAINT IF EXISTS job_applications_user_id_fkey;

-- Make user_id nullable since anonymous applications don't need a real user ID
ALTER TABLE public.job_applications 
ALTER COLUMN user_id DROP NOT NULL;
