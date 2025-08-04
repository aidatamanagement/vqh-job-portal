-- Comprehensive RLS Policy Check Script
-- Run this in your Supabase SQL Editor to diagnose RLS issues

-- ============================================================================
-- 1. CHECK CURRENT RLS POLICIES ON PROFILES TABLE
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================================================
-- 2. CHECK IF RLS IS ENABLED ON PROFILES TABLE
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- ============================================================================
-- 3. CHECK ROLE CONSTRAINT ON PROFILES TABLE
-- ============================================================================

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';

-- ============================================================================
-- 4. CHECK CURRENT ROLES IN PROFILES TABLE
-- ============================================================================

SELECT role, COUNT(*) as count 
FROM public.profiles 
GROUP BY role 
ORDER BY role;

-- ============================================================================
-- 5. TEST PROFILE INSERT WITH SERVICE ROLE (SIMULATE EDGE FUNCTION)
-- ============================================================================

-- This simulates what the Edge Function is trying to do
-- Note: This will only work if you have service role access
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-edge-function@example.com';
BEGIN
    -- Try to insert a test profile
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
        test_email,
        'branch_manager',
        'Test Edge Function User',
        'Test Edge Function User',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Test profile insert successful for user: %', test_user_id;
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE 'Test profile cleaned up';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test profile insert failed: %', SQLERRM;
END $$;

-- ============================================================================
-- 6. CHECK HELPER FUNCTIONS USED IN RLS POLICIES
-- ============================================================================

-- Check if helper functions exist
SELECT 
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname IN ('is_user_admin', 'can_manage_jobs', 'can_view_applications')
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ============================================================================
-- 7. CHECK FOR CONFLICTING POLICIES
-- ============================================================================

-- Look for duplicate policy names
SELECT policyname, COUNT(*) as count
FROM pg_policies 
WHERE tablename = 'profiles'
GROUP BY policyname
HAVING COUNT(*) > 1;

-- ============================================================================
-- 8. CHECK POLICY PERMISSIONS
-- ============================================================================

-- Check which roles can access profiles table
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles'
AND table_schema = 'public';

-- ============================================================================
-- 9. SIMPLE TEST: CAN CURRENT USER READ PROFILES?
-- ============================================================================

-- Test if current user can read profiles (this will show RLS in action)
SELECT 
    COUNT(*) as accessible_profiles,
    'Current user can read profiles' as test_result
FROM public.profiles
LIMIT 1;

-- ============================================================================
-- 10. CHECK FOR ANY DISABLED POLICIES
-- ============================================================================

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles'
AND permissive = false; 