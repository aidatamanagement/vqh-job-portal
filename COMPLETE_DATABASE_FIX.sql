-- COMPLETE DATABASE FIX
-- This SQL fixes both the missing job_applications columns and optionally adds the location fields to jobs table

-- ========================================
-- PART 1: FIX job_applications TABLE (REQUIRED)
-- ========================================

-- Add missing columns to job_applications table
DO $$ 
BEGIN
    -- Add applied_position column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_applications' 
        AND column_name = 'applied_position'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.job_applications 
        ADD COLUMN applied_position TEXT NOT NULL DEFAULT 'Unknown Position';
        
        -- Update existing records to have the position from the related job
        UPDATE public.job_applications 
        SET applied_position = jobs.position
        FROM public.jobs 
        WHERE job_applications.job_id = jobs.id;
        
        -- Remove the default after updating existing records
        ALTER TABLE public.job_applications 
        ALTER COLUMN applied_position DROP DEFAULT;
        
        RAISE NOTICE 'Added applied_position column to job_applications table';
    ELSE
        RAISE NOTICE 'applied_position column already exists in job_applications table';
    END IF;

    -- Add user_id column if it doesn't exist (for anonymous applications)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'job_applications' 
        AND column_name = 'user_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.job_applications 
        ADD COLUMN user_id UUID NULL;
        
        -- Add comment to document this field
        COMMENT ON COLUMN public.job_applications.user_id IS 'User ID for authenticated applications, NULL for anonymous applications';
        
        RAISE NOTICE 'Added user_id column to job_applications table';
    ELSE
        RAISE NOTICE 'user_id column already exists in job_applications table';
    END IF;
END $$;

-- ========================================
-- PART 2: CREATE ADMIN CHECK FUNCTION (REQUIRED)
-- ========================================

-- Create the is_user_admin function if it doesn't exist
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  -- This function runs with SECURITY DEFINER to bypass RLS
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO anon;

-- ========================================
-- PART 3: FIX RLS POLICIES FOR ANONYMOUS APPLICATIONS (REQUIRED)
-- ========================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can create applications" ON public.job_applications;
DROP POLICY IF EXISTS "Anyone can create applications" ON public.job_applications;
DROP POLICY IF EXISTS "Allow anonymous applications" ON public.job_applications;

-- Create policy that allows anonymous applications
CREATE POLICY "Allow anonymous applications" ON public.job_applications
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Users and admins can view applications" ON public.job_applications;
DROP POLICY IF EXISTS "View applications policy" ON public.job_applications;

CREATE POLICY "View applications policy" ON public.job_applications
FOR SELECT 
USING (
    -- Allow anonymous access (for tracking functionality)
    auth.uid() IS NULL OR
    -- Allow if user owns the application (authenticated users)
    user_id = auth.uid() OR
    -- Allow if user is admin
    public.is_user_admin(auth.uid())
);

-- Create/update admin UPDATE policy
DROP POLICY IF EXISTS "Admins can update applications" ON public.job_applications;

CREATE POLICY "Admins can update applications" ON public.job_applications
FOR UPDATE 
USING (public.is_user_admin(auth.uid()));

-- Create/update admin DELETE policy
DROP POLICY IF EXISTS "Admins can delete applications" ON public.job_applications;

CREATE POLICY "Admins can delete applications" ON public.job_applications
FOR DELETE 
USING (public.is_user_admin(auth.uid()));

-- ========================================
-- PART 4: JOBS TABLE LOCATION FIELDS (OPTIONAL)
-- Only run this if you want separate office_location and work_location fields
-- ========================================

-- UNCOMMENT THE SECTION BELOW IF YOU WANT TO ADD SEPARATE LOCATION FIELDS TO JOBS TABLE

/*
DO $$ 
BEGIN
    -- Check if office_location column exists, if not, rename location to office_location
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'office_location'
        AND table_schema = 'public'
    ) THEN
        -- Rename existing location column to office_location
        ALTER TABLE public.jobs RENAME COLUMN location TO office_location;
        
        -- Add new work_location column
        ALTER TABLE public.jobs 
        ADD COLUMN work_location TEXT;
        
        -- Update existing records to have work_location same as office_location initially
        UPDATE public.jobs 
        SET work_location = office_location 
        WHERE work_location IS NULL;
        
        -- Add comments
        COMMENT ON COLUMN public.jobs.office_location IS 'Location of the company office/branch';
        COMMENT ON COLUMN public.jobs.work_location IS 'Location where the actual work will be performed (e.g., Remote, On-site, Hybrid, etc.)';
        
        RAISE NOTICE 'Updated jobs table with separate office_location and work_location fields';
    ELSE
        RAISE NOTICE 'Jobs table already has office_location field';
    END IF;
END $$;
*/

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Check if all required columns exist
SELECT 
    'job_applications' as table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'job_applications' 
AND table_schema = 'public'
AND column_name IN ('applied_position', 'user_id')
ORDER BY column_name;

-- Show current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'job_applications'
ORDER BY policyname;