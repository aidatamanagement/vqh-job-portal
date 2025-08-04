-- RLS Policies for User Profile Access
-- Users can view their own profile data
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: CLEAN UP EXISTING POLICIES
-- ============================================================================

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
DROP POLICY IF EXISTS "Profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile delete policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- ============================================================================
-- STEP 2: CREATE HELPER FUNCTIONS
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

-- Function to check if user can manage users (admin only)
CREATE OR REPLACE FUNCTION public.can_manage_users(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.is_user_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_users(UUID) TO authenticated;

-- ============================================================================
-- STEP 3: CREATE RLS POLICIES
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Users can view their own profile + Admins can view all
CREATE POLICY "user_profile_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  -- Users can view their own profile
  auth.uid() = id OR 
  -- Admins can view all profiles
  public.is_user_admin()
);

-- Policy 2: UPDATE - Users can update their own profile + Admins can update any
CREATE POLICY "user_profile_update" ON public.profiles
FOR UPDATE TO authenticated
USING (
  -- Users can update their own profile
  auth.uid() = id OR 
  -- Admins can update any profile
  public.can_manage_users()
)
WITH CHECK (
  -- Prevent users from changing their own role (security measure)
  CASE 
    WHEN auth.uid() = id THEN 
      -- Users can update their own profile but not change their role
      (OLD.role = NEW.role OR NEW.role IS NULL)
    ELSE 
      -- Admins can change any profile including roles
      true
  END
);

-- Policy 3: INSERT - Allow profile creation for registration and admin creation
CREATE POLICY "user_profile_insert" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  -- Users can create their own profile during registration
  auth.uid() = id OR 
  -- Admins can create profiles for others
  public.can_manage_users()
);

-- Policy 4: DELETE - Only admins can delete profiles (except their own)
CREATE POLICY "user_profile_delete" ON public.profiles
FOR DELETE TO authenticated
USING (
  -- Only admins can delete profiles
  public.can_manage_users() AND 
  -- Admins cannot delete their own profile (safety measure)
  auth.uid() != id
);

-- ============================================================================
-- STEP 4: VERIFY POLICIES
-- ============================================================================

-- Check that all policies were created successfully
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- STEP 5: TEST THE POLICIES
-- ============================================================================

-- Test 1: Check if current user can see their own profile
SELECT 
    COUNT(*) as own_profile_count,
    'Current user can see own profile' as test_result
FROM public.profiles 
WHERE id = auth.uid();

-- Test 2: Check if admin can see all profiles
SELECT 
    COUNT(*) as total_profiles,
    'Admin can see all profiles' as test_result
FROM public.profiles
WHERE EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
);

-- Test 3: Test profile creation (simulates registration)
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        role, 
        admin_name, 
        display_name, 
        created_at, 
        updated_at
    ) VALUES (
        test_user_id,
        'test-user-profile@example.com',
        'branch_manager',
        'Test User Profile',
        'Test User Profile',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Profile creation test successful!';
    RAISE NOTICE 'User ID: %', test_user_id;
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE '✅ Test cleanup successful';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Profile creation test failed: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 6: FINAL STATUS CHECK
-- ============================================================================

-- Show final RLS status
SELECT 
    'RLS Status' as check_type,
    CASE 
        WHEN rowsecurity THEN 'ENABLED' 
        ELSE 'DISABLED' 
    END as status
FROM pg_tables 
WHERE tablename = 'profiles'

UNION ALL

SELECT 
    'Policy Count' as check_type,
    COUNT(*)::text as status
FROM pg_policies 
WHERE tablename = 'profiles'

UNION ALL

SELECT 
    'Helper Functions' as check_type,
    COUNT(*)::text as status
FROM pg_proc 
WHERE proname IN ('is_user_admin', 'can_manage_users')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public'); 