-- Comprehensive RLS Policies for All Tables and Storage Buckets
-- Date: 2025-01-03

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(required_role TEXT, user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = required_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user can manage jobs
CREATE OR REPLACE FUNCTION public.can_manage_jobs(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'branch_manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user can view applications
CREATE OR REPLACE FUNCTION public.can_view_applications(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'branch_manager', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user can manage salespeople
CREATE OR REPLACE FUNCTION public.can_manage_salespeople(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'hr')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user can view training videos
CREATE OR REPLACE FUNCTION public.can_view_training_videos(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'trainer', 'content_manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user can manage content
CREATE OR REPLACE FUNCTION public.can_manage_content(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role IN ('admin', 'content_manager')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_jobs(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_applications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_salespeople(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_training_videos(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_content(UUID) TO authenticated;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salespeople ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendly_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_positions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES TABLE POLICIES
-- ============================================================================

-- Users can view their own profile + Admins can view all profiles
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.is_user_admin()
);

-- Users can update their own profile + Admins can update any profile
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.is_user_admin()
);

-- Allow new user profile creation + Admin-created profiles
CREATE POLICY "profiles_insert_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id OR 
  public.is_user_admin()
);

-- Only admins can delete profiles (except their own)
CREATE POLICY "profiles_delete_policy" ON public.profiles
FOR DELETE TO authenticated
USING (
  public.is_user_admin() AND auth.uid() != id
);

-- ============================================================================
-- JOBS TABLE POLICIES
-- ============================================================================

-- Public can view active jobs, authenticated users can view all jobs
CREATE POLICY "jobs_select_policy" ON public.jobs
FOR SELECT TO public
USING (is_active = true);

CREATE POLICY "jobs_select_authenticated_policy" ON public.jobs
FOR SELECT TO authenticated
USING (true);

-- Only job managers and admins can create/update/delete jobs
CREATE POLICY "jobs_insert_policy" ON public.jobs
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_jobs()
);

CREATE POLICY "jobs_update_policy" ON public.jobs
FOR UPDATE TO authenticated
USING (
  public.can_manage_jobs()
);

CREATE POLICY "jobs_delete_policy" ON public.jobs
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- JOB_APPLICATIONS TABLE POLICIES
-- ============================================================================

-- Public can insert applications (for job applications)
CREATE POLICY "job_applications_insert_policy" ON public.job_applications
FOR INSERT TO public
WITH CHECK (true);

-- Users can view their own applications, managers can view all
CREATE POLICY "job_applications_select_policy" ON public.job_applications
FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR 
  public.can_view_applications()
);

-- Only managers can update applications
CREATE POLICY "job_applications_update_policy" ON public.job_applications
FOR UPDATE TO authenticated
USING (
  public.can_view_applications()
);

-- Only admins can delete applications
CREATE POLICY "job_applications_delete_policy" ON public.job_applications
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- INTERVIEWS TABLE POLICIES
-- ============================================================================

-- Only managers can view interviews
CREATE POLICY "interviews_select_policy" ON public.interviews
FOR SELECT TO authenticated
USING (
  public.can_view_applications()
);

-- Only managers can create/update interviews
CREATE POLICY "interviews_insert_policy" ON public.interviews
FOR INSERT TO authenticated
WITH CHECK (
  public.can_view_applications()
);

CREATE POLICY "interviews_update_policy" ON public.interviews
FOR UPDATE TO authenticated
USING (
  public.can_view_applications()
);

-- Only admins can delete interviews
CREATE POLICY "interviews_delete_policy" ON public.interviews
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- STATUS_HISTORY TABLE POLICIES
-- ============================================================================

-- Only managers can view status history
CREATE POLICY "status_history_select_policy" ON public.status_history
FOR SELECT TO authenticated
USING (
  public.can_view_applications()
);

-- Only managers can create status history entries
CREATE POLICY "status_history_insert_policy" ON public.status_history
FOR INSERT TO authenticated
WITH CHECK (
  public.can_view_applications()
);

-- Only admins can update/delete status history
CREATE POLICY "status_history_update_policy" ON public.status_history
FOR UPDATE TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "status_history_delete_policy" ON public.status_history
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- SALESPEOPLE TABLE POLICIES
-- ============================================================================

-- Only managers can view salespeople
CREATE POLICY "salespeople_select_policy" ON public.salespeople
FOR SELECT TO authenticated
USING (
  public.can_manage_salespeople()
);

-- Only managers can create/update salespeople
CREATE POLICY "salespeople_insert_policy" ON public.salespeople
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_salespeople()
);

CREATE POLICY "salespeople_update_policy" ON public.salespeople
FOR UPDATE TO authenticated
USING (
  public.can_manage_salespeople()
);

-- Only admins can delete salespeople
CREATE POLICY "salespeople_delete_policy" ON public.salespeople
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- VISIT_LOGS TABLE POLICIES
-- ============================================================================

-- Only managers can view visit logs
CREATE POLICY "visit_logs_select_policy" ON public.visit_logs
FOR SELECT TO authenticated
USING (
  public.can_manage_salespeople()
);

-- Only managers can create/update visit logs
CREATE POLICY "visit_logs_insert_policy" ON public.visit_logs
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_salespeople()
);

CREATE POLICY "visit_logs_update_policy" ON public.visit_logs
FOR UPDATE TO authenticated
USING (
  public.can_manage_salespeople()
);

-- Only admins can delete visit logs
CREATE POLICY "visit_logs_delete_policy" ON public.visit_logs
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- TRAINING_VIDEOS TABLE POLICIES
-- ============================================================================

-- Only authorized users can view training videos
CREATE POLICY "training_videos_select_policy" ON public.training_videos
FOR SELECT TO authenticated
USING (
  public.can_view_training_videos()
);

-- Only content managers can create/update training videos
CREATE POLICY "training_videos_insert_policy" ON public.training_videos
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_content()
);

CREATE POLICY "training_videos_update_policy" ON public.training_videos
FOR UPDATE TO authenticated
USING (
  public.can_manage_content()
);

-- Only admins can delete training videos
CREATE POLICY "training_videos_delete_policy" ON public.training_videos
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- CALENDLY_SETTINGS TABLE POLICIES
-- ============================================================================

-- Only admins can manage Calendly settings
CREATE POLICY "calendly_settings_select_policy" ON public.calendly_settings
FOR SELECT TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "calendly_settings_insert_policy" ON public.calendly_settings
FOR INSERT TO authenticated
WITH CHECK (
  public.is_user_admin()
);

CREATE POLICY "calendly_settings_update_policy" ON public.calendly_settings
FOR UPDATE TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "calendly_settings_delete_policy" ON public.calendly_settings
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- EMAIL_SETTINGS TABLE POLICIES
-- ============================================================================

-- Only admins can manage email settings
CREATE POLICY "email_settings_select_policy" ON public.email_settings
FOR SELECT TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "email_settings_insert_policy" ON public.email_settings
FOR INSERT TO authenticated
WITH CHECK (
  public.is_user_admin()
);

CREATE POLICY "email_settings_update_policy" ON public.email_settings
FOR UPDATE TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "email_settings_delete_policy" ON public.email_settings
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- EMAIL_TEMPLATES TABLE POLICIES
-- ============================================================================

-- Only content managers can manage email templates
CREATE POLICY "email_templates_select_policy" ON public.email_templates
FOR SELECT TO authenticated
USING (
  public.can_manage_content()
);

CREATE POLICY "email_templates_insert_policy" ON public.email_templates
FOR INSERT TO authenticated
WITH CHECK (
  public.can_manage_content()
);

CREATE POLICY "email_templates_update_policy" ON public.email_templates
FOR UPDATE TO authenticated
USING (
  public.can_manage_content()
);

CREATE POLICY "email_templates_delete_policy" ON public.email_templates
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- EMAIL_LOGS TABLE POLICIES
-- ============================================================================

-- Only admins can view email logs
CREATE POLICY "email_logs_select_policy" ON public.email_logs
FOR SELECT TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "email_logs_insert_policy" ON public.email_logs
FOR INSERT TO authenticated
WITH CHECK (
  public.is_user_admin()
);

CREATE POLICY "email_logs_update_policy" ON public.email_logs
FOR UPDATE TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "email_logs_delete_policy" ON public.email_logs
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- MASTER DATA TABLES POLICIES (Public read, Admin write)
-- ============================================================================

-- Job Facilities
CREATE POLICY "job_facilities_select_policy" ON public.job_facilities
FOR SELECT TO public
USING (true);

CREATE POLICY "job_facilities_insert_policy" ON public.job_facilities
FOR INSERT TO authenticated
WITH CHECK (
  public.is_user_admin()
);

CREATE POLICY "job_facilities_update_policy" ON public.job_facilities
FOR UPDATE TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "job_facilities_delete_policy" ON public.job_facilities
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- Job Locations
CREATE POLICY "job_locations_select_policy" ON public.job_locations
FOR SELECT TO public
USING (true);

CREATE POLICY "job_locations_insert_policy" ON public.job_locations
FOR INSERT TO authenticated
WITH CHECK (
  public.is_user_admin()
);

CREATE POLICY "job_locations_update_policy" ON public.job_locations
FOR UPDATE TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "job_locations_delete_policy" ON public.job_locations
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- Job Positions
CREATE POLICY "job_positions_select_policy" ON public.job_positions
FOR SELECT TO public
USING (true);

CREATE POLICY "job_positions_insert_policy" ON public.job_positions
FOR INSERT TO authenticated
WITH CHECK (
  public.is_user_admin()
);

CREATE POLICY "job_positions_update_policy" ON public.job_positions
FOR UPDATE TO authenticated
USING (
  public.is_user_admin()
);

CREATE POLICY "job_positions_delete_policy" ON public.job_positions
FOR DELETE TO authenticated
USING (
  public.is_user_admin()
);

-- ============================================================================
-- STORAGE BUCKETS AND POLICIES
-- ============================================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create profile-images bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO NOTHING;

-- Profile Images Storage Policies
CREATE POLICY "profile_images_select_policy" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'profile-images');

CREATE POLICY "profile_images_insert_policy" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "profile_images_update_policy" ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
)
WITH CHECK (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
);

CREATE POLICY "profile_images_delete_policy" ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-images' AND 
  name LIKE auth.uid()::text || '/%'
);

-- ============================================================================
-- TRIGGERS FOR ROLE ESCALATION PREVENTION
-- ============================================================================

-- Prevent users from escalating their own privileges
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger AS $$
BEGIN
  -- If a non-admin user is trying to change their role, prevent it
  IF OLD.id = auth.uid() AND OLD.role != NEW.role AND NOT public.is_user_admin() THEN
    RAISE EXCEPTION 'Users cannot change their own role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.profiles;

-- Create the trigger
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.prevent_role_escalation() TO authenticated; 