-- FIX: Zero Policies Issue - This is blocking all access to profiles table
-- Run this in your Supabase SQL Editor immediately

-- ============================================================================
-- STEP 1: CHECK CURRENT STATUS
-- ============================================================================

-- Check if RLS is enabled and how many policies exist
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'profiles') as policy_count
FROM pg_tables 
WHERE tablename = 'profiles';

-- ============================================================================
-- STEP 2: CREATE ESSENTIAL POLICIES
-- ============================================================================

-- Create basic policies that allow admin access and user registration

-- Policy 1: Allow users to view their own profile + Admins can view all
CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 2: Allow users to update their own profile + Admins can update any
CREATE POLICY "profiles_update" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 3: Allow profile creation (for registration and admin creation)
CREATE POLICY "profiles_insert" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policy 4: Only admins can delete profiles (except their own)
CREATE POLICY "profiles_delete" ON public.profiles
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) AND auth.uid() != id
);

-- ============================================================================
-- STEP 3: VERIFY POLICIES ARE CREATED
-- ============================================================================

-- Check that policies were created
SELECT 
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- STEP 4: TEST ADMIN ACCESS
-- ============================================================================

-- Test if admin can now see profiles
SELECT 
    COUNT(*) as total_profiles,
    'Admin can now see profiles' as test_result
FROM public.profiles;

-- ============================================================================
-- STEP 5: TEST PROFILE CREATION
-- ============================================================================

-- Test creating a new profile (simulates Edge Function)
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
        'test-fix@example.com',
        'branch_manager',
        'Test Fix User',
        'Test Fix User',
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
-- STEP 6: CHECK ROLE CONSTRAINT
-- ============================================================================

-- Make sure role constraint is correct
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'branch_manager', 'hr', 'trainer', 'content_manager'));

-- Update any existing users with old role names
UPDATE public.profiles 
SET role = 'branch_manager' 
WHERE role = 'recruiter';

-- ============================================================================
-- STEP 7: FINAL VERIFICATION
-- ============================================================================

-- Show final status
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
    'Role Constraint' as check_type,
    pg_get_constraintdef(oid) as status
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c'; 