-- Test script to check current role constraints and data
-- Run this in your Supabase SQL editor

-- Check what roles currently exist in the database
SELECT role, COUNT(*) as count 
FROM public.profiles 
GROUP BY role 
ORDER BY role;

-- Check the current constraint on the profiles table
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';

-- Try to insert a test profile with branch_manager role
-- This will help us see if the constraint is working
INSERT INTO public.profiles (id, email, role, admin_name, display_name, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    'test@example.com',
    'branch_manager',
    'Test User',
    'Test User',
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- Check if the insert worked
SELECT role, COUNT(*) as count 
FROM public.profiles 
WHERE email = 'test@example.com'
GROUP BY role;

-- Clean up test data
DELETE FROM public.profiles WHERE email = 'test@example.com'; 