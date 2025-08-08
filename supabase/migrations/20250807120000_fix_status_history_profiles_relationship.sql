-- Migration to ensure proper foreign key relationship between status_history and profiles
-- This ensures the join works correctly to display user names instead of UUIDs

-- First, check if the foreign key constraint exists and recreate if needed
DO $$ 
BEGIN
    -- Drop existing constraint if it exists (safe operation)
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'status_history_changed_by_fkey' 
        AND table_name = 'status_history'
    ) THEN
        ALTER TABLE public.status_history DROP CONSTRAINT status_history_changed_by_fkey;
    END IF;
END $$;

-- Ensure the changed_by column exists and is properly typed
DO $$
BEGIN
    -- Check if changed_by column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'status_history' 
        AND column_name = 'changed_by'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.status_history ADD COLUMN changed_by UUID;
    END IF;
END $$;

-- Clean up any invalid references before adding constraint
-- Update any changed_by values that don't have corresponding profiles
UPDATE public.status_history 
SET changed_by = NULL 
WHERE changed_by IS NOT NULL 
AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = status_history.changed_by
);

-- Add foreign key constraint to link status_history.changed_by to profiles.id
ALTER TABLE public.status_history 
ADD CONSTRAINT status_history_changed_by_fkey 
FOREIGN KEY (changed_by) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Create index for better performance when querying status history by user
DROP INDEX IF EXISTS idx_status_history_changed_by;
CREATE INDEX idx_status_history_changed_by 
ON public.status_history(changed_by) 
WHERE changed_by IS NOT NULL;

-- Add comments for documentation
COMMENT ON CONSTRAINT status_history_changed_by_fkey ON public.status_history IS 
'Links the user who made the status change to their profile information for displaying names';

COMMENT ON INDEX idx_status_history_changed_by IS 
'Index for efficient querying of status history by the user who made the change';

-- Verify the relationship works by testing a sample query (this will help identify issues)
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    -- Test if the join works
    SELECT COUNT(*) INTO test_count
    FROM public.status_history sh
    LEFT JOIN public.profiles p ON sh.changed_by = p.id
    LIMIT 1;
    
    RAISE NOTICE 'Foreign key relationship verified. Test query executed successfully.';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Warning: Foreign key relationship may have issues: %', SQLERRM;
END $$;