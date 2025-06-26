
-- Enable real-time for the interviews table
ALTER TABLE public.interviews REPLICA IDENTITY FULL;

-- Add the interviews table to the supabase_realtime publication
-- This allows real-time subscriptions to work
DO $$
BEGIN
  -- Check if the publication exists, if not create it
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
  
  -- Add the interviews table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.interviews;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table is already in the publication, which is fine
    NULL;
END $$;
