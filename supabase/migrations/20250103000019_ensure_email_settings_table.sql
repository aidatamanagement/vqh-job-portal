-- Ensure email_settings table exists and has proper structure
-- This migration ensures we have the email_settings table with correct RLS policies

-- Create email_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.email_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    admin_emails TEXT[] DEFAULT ARRAY['careers@viaquesthospice.com'],
    staff_emails TEXT[] DEFAULT ARRAY[]::TEXT[],
    enable_notifications BOOLEAN DEFAULT true,
    enable_auto_responses BOOLEAN DEFAULT true,
    enable_staff_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "email_settings_select_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_insert_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_update_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_delete_policy" ON public.email_settings;

-- Ensure helper functions exist
CREATE OR REPLACE FUNCTION public.is_admin_or_hr_manager(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_or_hr_manager(UUID) TO authenticated;

-- Create new policies that allow both admin and HR managers
CREATE POLICY "email_settings_select_policy" ON public.email_settings
FOR SELECT TO authenticated
USING (public.is_admin_or_hr_manager());

CREATE POLICY "email_settings_insert_policy" ON public.email_settings
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr_manager());

CREATE POLICY "email_settings_update_policy" ON public.email_settings
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr_manager());

CREATE POLICY "email_settings_delete_policy" ON public.email_settings
FOR DELETE TO authenticated
USING (public.is_admin_or_hr_manager());

-- Insert default settings if table is empty
INSERT INTO public.email_settings (
    admin_emails,
    staff_emails,
    enable_notifications,
    enable_auto_responses,
    enable_staff_notifications
)
SELECT 
    ARRAY['careers@viaquesthospice.com'],
    ARRAY[]::TEXT[],
    true,
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM public.email_settings);

-- Add comments for documentation
COMMENT ON TABLE public.email_settings IS 'Email notification settings and configuration';
COMMENT ON COLUMN public.email_settings.admin_emails IS 'Array of admin email addresses for notifications';
COMMENT ON COLUMN public.email_settings.staff_emails IS 'Array of staff email addresses for notifications';
COMMENT ON COLUMN public.email_settings.enable_notifications IS 'Global toggle for email notifications';
COMMENT ON COLUMN public.email_settings.enable_auto_responses IS 'Toggle for automatic response emails';
COMMENT ON COLUMN public.email_settings.enable_staff_notifications IS 'Toggle for staff notifications';
 
 