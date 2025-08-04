-- Fix role constraint to use branch_manager instead of recruiter
-- Run this in your Supabase SQL editor

-- First, update any existing users with 'recruiter' role to 'branch_manager'
UPDATE public.profiles 
SET role = 'branch_manager' 
WHERE role = 'recruiter';

-- Drop the existing constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add the new constraint with branch_manager
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'branch_manager', 'hr', 'trainer', 'content_manager'));

-- Verify the constraint is working
SELECT role, COUNT(*) as count 
FROM public.profiles 
GROUP BY role 
ORDER BY role; 