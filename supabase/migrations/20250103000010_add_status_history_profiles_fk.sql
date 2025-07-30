-- Migration to add foreign key relationship between status_history and profiles
-- This allows joining status_history.changed_by with profiles.id to show user names

-- Drop existing constraint if it exists (safe operation)
ALTER TABLE public.status_history 
DROP CONSTRAINT IF EXISTS status_history_changed_by_fkey;

-- Add foreign key constraint to link status_history.changed_by to profiles.id
ALTER TABLE public.status_history 
ADD CONSTRAINT status_history_changed_by_fkey 
FOREIGN KEY (changed_by) 
REFERENCES public.profiles(id) 
ON DELETE SET NULL;

-- Add comment to document the relationship
COMMENT ON CONSTRAINT status_history_changed_by_fkey ON public.status_history IS 
'Links the user who made the status change to their profile information';

-- Drop existing index if it exists (safe operation)
DROP INDEX IF EXISTS idx_status_history_changed_by;

-- Create index for better performance when querying status history by user
CREATE INDEX idx_status_history_changed_by 
ON public.status_history(changed_by) 
WHERE changed_by IS NOT NULL;

-- Add comment to the index
COMMENT ON INDEX public.idx_status_history_changed_by IS 
'Index for efficient querying of status history by the user who made the change'; 