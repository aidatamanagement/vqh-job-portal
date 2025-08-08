-- Simple SQL policies to give Branch Managers email access
-- Run these individually in Supabase SQL Editor

-- 1. Update the helper function to include branch_manager
CREATE OR REPLACE FUNCTION public.is_admin_or_hr_manager(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'hr', 'branch_manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_or_hr_manager(UUID) TO authenticated;

-- 3. Drop existing email settings policies
DROP POLICY IF EXISTS "email_settings_select_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_insert_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_update_policy" ON public.email_settings;
DROP POLICY IF EXISTS "email_settings_delete_policy" ON public.email_settings;

-- 4. Create new email settings policies
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

-- 5. Drop existing email templates policies
DROP POLICY IF EXISTS "email_templates_select_policy" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_insert_policy" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_update_policy" ON public.email_templates;
DROP POLICY IF EXISTS "email_templates_delete_policy" ON public.email_templates;

-- 6. Create new email templates policies
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

-- 7. Drop existing email logs policies
DROP POLICY IF EXISTS "email_logs_select_policy" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_insert_policy" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_update_policy" ON public.email_logs;
DROP POLICY IF EXISTS "email_logs_delete_policy" ON public.email_logs;

-- 8. Create new email logs policies
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