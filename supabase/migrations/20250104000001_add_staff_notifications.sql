-- Add staff notification support to email_settings table
ALTER TABLE public.email_settings 
ADD COLUMN IF NOT EXISTS staff_emails TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS enable_staff_notifications BOOLEAN DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN public.email_settings.staff_emails IS 'Array of staff email addresses to receive new application notifications';
COMMENT ON COLUMN public.email_settings.enable_staff_notifications IS 'Whether to send notifications to staff when new applications are received'; 