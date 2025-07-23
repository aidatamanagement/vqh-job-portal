-- Get specific function details that are causing the conflict
-- Run this after the main schema query

-- Get exact function signature and parameters for validate_status_transition
SELECT 
    p.proname as function_name,
    p.pronargs as num_args,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'validate_status_transition';

-- Get the exact parameter names and types
SELECT 
    p.proname as function_name,
    unnest(p.proargnames) as parameter_name,
    unnest(string_to_array(pg_get_function_arguments(p.oid), ', ')) as parameter_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'validate_status_transition';

-- Also check for update_application_status_with_notes function
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    CASE WHEN p.oid IS NOT NULL THEN 'EXISTS' ELSE 'NOT EXISTS' END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'update_application_status_with_notes';

-- Check what migration files have been applied
SELECT version, applied_at 
FROM supabase_migrations.schema_migrations 
WHERE version LIKE '%status%' OR version LIKE '%note%'
ORDER BY applied_at DESC;