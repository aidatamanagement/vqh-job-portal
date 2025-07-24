-- Migration to update HR manager permissions
-- This gives HR managers (role 'hr') access to job portal features, training, and email settings
-- Date: 2025-07-23

-- Create helper function to check if user is admin or HR manager
CREATE OR REPLACE FUNCTION public.is_admin_or_hr_manager(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create helper function to check if user is admin only (for user management)
CREATE OR REPLACE FUNCTION public.is_admin_only(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_admin_or_hr_manager(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_only(UUID) TO authenticated;

-- Update job management policies to allow HR managers
DROP POLICY IF EXISTS "Admins can insert jobs" ON public.jobs;
CREATE POLICY "Admin and HR can insert jobs" ON public.jobs
FOR INSERT TO authenticated
WITH CHECK (public.is_admin_or_hr_manager());

DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
CREATE POLICY "Admin and HR can update jobs" ON public.jobs
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr_manager());

DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admin and HR can delete jobs" ON public.jobs
FOR DELETE TO authenticated
USING (public.is_admin_or_hr_manager());

-- Update application management policies to allow HR managers
DROP POLICY IF EXISTS "Admins can update applications" ON public.job_applications;
CREATE POLICY "Admin and HR can update applications" ON public.job_applications
FOR UPDATE TO authenticated
USING (public.is_admin_or_hr_manager());

-- Update master data management policies to allow HR managers
DROP POLICY IF EXISTS "Admins can modify positions" ON public.job_positions;
CREATE POLICY "Admin and HR can modify positions" ON public.job_positions
FOR ALL TO authenticated
USING (public.is_admin_or_hr_manager());

DROP POLICY IF EXISTS "Admins can modify locations" ON public.job_locations;
CREATE POLICY "Admin and HR can modify locations" ON public.job_locations
FOR ALL TO authenticated
USING (public.is_admin_or_hr_manager());

DROP POLICY IF EXISTS "Admins can modify facilities" ON public.job_facilities;
CREATE POLICY "Admin and HR can modify facilities" ON public.job_facilities
FOR ALL TO authenticated
USING (public.is_admin_or_hr_manager());

-- Update training videos policies to allow HR managers
DROP POLICY IF EXISTS "Trainers can manage training videos" ON public.training_videos;
CREATE POLICY "Admin, HR, and Trainers can manage training videos" ON public.training_videos
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hr', 'trainer')
  )
);

-- Update email settings policies to allow HR managers
DROP POLICY IF EXISTS "Admins can manage email settings" ON public.email_settings;
CREATE POLICY "Admin and HR can manage email settings" ON public.email_settings
FOR ALL TO authenticated
USING (public.is_admin_or_hr_manager());

DROP POLICY IF EXISTS "Admins can manage email templates" ON public.email_templates;
CREATE POLICY "Admin and HR can manage email templates" ON public.email_templates
FOR ALL TO authenticated
USING (public.is_admin_or_hr_manager());

DROP POLICY IF EXISTS "Admins can view email logs" ON public.email_logs;
CREATE POLICY "Admin and HR can view email logs" ON public.email_logs
FOR SELECT TO authenticated
USING (public.is_admin_or_hr_manager());

-- Keep CRM and content management restricted to their respective roles
-- Salespeople and visit logs remain admin-only or role-specific
-- Content management remains content_manager role only

-- Keep user management restricted to admins only
-- Profile management policies should remain admin-only for security

-- Add comments for documentation
COMMENT ON FUNCTION public.is_admin_or_hr_manager(UUID) IS 
'Helper function to check if user has admin or HR manager role for job portal access';

COMMENT ON FUNCTION public.is_admin_only(UUID) IS 
'Helper function to check if user has admin role only for user management access';

COMMENT ON POLICY "Admin and HR can insert jobs" ON public.jobs IS 
'Allows both admins and HR managers to create new job postings';

COMMENT ON POLICY "Admin and HR can update jobs" ON public.jobs IS 
'Allows both admins and HR managers to modify existing job postings';

COMMENT ON POLICY "Admin and HR can delete jobs" ON public.jobs IS 
'Allows both admins and HR managers to delete job postings';

COMMENT ON POLICY "Admin and HR can update applications" ON public.job_applications IS 
'Allows both admins and HR managers to update job application statuses';

COMMENT ON POLICY "Admin and HR can manage email settings" ON public.email_settings IS 
'Allows both admins and HR managers to configure email automation settings';

COMMENT ON POLICY "Admin and HR can manage email templates" ON public.email_templates IS 
'Allows both admins and HR managers to create and edit email templates';

COMMENT ON POLICY "Admin and HR can view email logs" ON public.email_logs IS 
'Allows both admins and HR managers to view email sending history'; 