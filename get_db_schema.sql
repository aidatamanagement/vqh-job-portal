-- Get complete database schema for analysis
-- Run this in your Supabase SQL editor or via psql

-- 1. Get all constraints on job_applications table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.job_applications'::regclass
ORDER BY conname;

-- 2. Get all functions related to status
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname LIKE '%status%'
ORDER BY p.proname;

-- 3. Get all triggers on job_applications table
SELECT 
    t.tgname as trigger_name,
    pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
WHERE n.nspname = 'public' 
AND c.relname = 'job_applications'
AND NOT t.tgisinternal
ORDER BY t.tgname;

-- 4. Get current status values in job_applications
SELECT DISTINCT status, COUNT(*) as count
FROM public.job_applications 
GROUP BY status 
ORDER BY status;

-- 5. Get status_history table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'status_history'
ORDER BY ordinal_position;

-- 6. Get constraints on status_history table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.status_history'::regclass
ORDER BY conname;

-- 7. Get sample records from status_history to see current structure
SELECT 
    application_id,
    previous_status,
    new_status,
    notes,
    changed_at,
    changed_by,
    transition_valid
FROM public.status_history 
ORDER BY changed_at DESC 
LIMIT 5;

-- 8. Check if there are any enum types for status
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
WHERE t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;