-- Check what columns exist in the jobs table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Also check if there are any location-related columns
SELECT 
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND table_schema = 'public'
AND column_name ILIKE '%location%'
ORDER BY column_name;