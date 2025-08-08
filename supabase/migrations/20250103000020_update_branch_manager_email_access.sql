-- Migration to give Branch Managers access to email settings and templates
-- Date: 2025-01-03

-- Update helper function to include branch_manager
CREATE OR REPLACE FUNCTION public.is_admin_or_hr_manager(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'hr', 'branch_manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_or_hr_manager(UUID) TO authenticated;

-- Update email settings policies to allow branch managers
DROP POLICY IF EXISTS "email_settings_select_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_insert_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_update_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_delete_policy" ON public.email_settings;

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

-- Update email templates policies to allow branch managers
DROP POLICY IF EXISTS "email_templates_select_policy" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_insert_policy" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_update_policy" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_delete_policy" ON public.email_templates;

CREATE POLICY "email_templates_select_policy" ON public.email_templates
FOR SELECT TO authenticated
USING (public.is_admin_or_hr_manager());

CREATE POLICY "email_templates_insert_policy" ON public.email_templates
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr_manager());

CREATE POLICY "email_templates_update_policy" ON public.email_templates
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr_manager());

CREATE POLICY "email_templates_delete_policy" ON public.email_templates
FOR DELETE TO authenticated
USING (public.is_admin_or_hr_manager());

-- Update email logs policies to allow branch managers
DROP POLICY IF EXISTS "email_logs_select_policy" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_insert_policy" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_update_policy" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_delete_policy" ON public.email_logs;

CREATE POLICY "email_logs_select_policy" ON public.email_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_hr_manager());

CREATE POLICY "email_logs_insert_policy" ON public.email_logs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr_manager());

CREATE POLICY "email_logs_update_policy" ON public.email_logs
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr_manager());

CREATE POLICY "email_logs_delete_policy" ON public.email_logs
FOR DELETE TO authenticated
USING (public.is_admin_or_hr_manager());

-- Add comments for documentation
COMMENT ON FUNCTION public.is_admin_or_hr_manager(UUID) IS 
'Helper function to check if user has admin, HR manager, or Branch Manager role for email management access';

COMMENT ON POLICY "email_settings_select_policy" ON public.email_settings IS 
'Allows admins, HR managers, and Branch Managers to view email settings';

COMMENT ON POLICY "email_settings_insert_policy" ON public.email_settings IS 
'Allows admins, HR managers, and Branch Managers to create email settings';

COMMENT ON POLICY "email_settings_update_policy" ON public.email_settings IS 
'Allows admins, HR managers, and Branch Managers to update email settings';

COMMENT ON POLICY "email_settings_delete_policy" ON public.email_settings IS 
'Allows admins, HR managers, and Branch Managers to delete email settings';

COMMENT ON POLICY "email_templates_select_policy" ON public.email_templates IS 
'Allows admins, HR managers, and Branch Managers to view email templates';

COMMENT ON POLICY "email_templates_insert_policy" ON public.email_templates IS 
'Allows admins, HR managers, and Branch Managers to create email templates';

COMMENT ON POLICY "email_templates_update_policy" ON public.email_templates IS 
'Allows admins, HR managers, and Branch Managers to update email templates';

COMMENT ON POLICY "email_templates_delete_policy" ON public.email_templates IS 
'Allows admins, HR managers, and Branch Managers to delete email templates';

COMMENT ON POLICY "email_logs_select_policy" ON public.email_logs IS 
'Allows admins, HR managers, and Branch Managers to view email logs';

COMMENT ON POLICY "email_logs_insert_policy" ON public.email_logs IS 
'Allows admins, HR managers, and Branch Managers to create email logs';

COMMENT ON POLICY "email_logs_update_policy" ON public.email_logs IS 
'Allows admins, HR managers, and Branch Managers to update email logs';

COMMENT ON POLICY "email_logs_delete_policy" ON public.email_logs IS 
'Allows admins, HR managers, and Branch Managers to delete email logs'; 