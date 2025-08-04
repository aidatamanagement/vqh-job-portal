-- Fix Common RLS Issues for Profile Creation
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: CLEAN UP CONFLICTING POLICIES
-- ============================================================================

-- Drop all existing policies on profiles table to start fresh
DROP POLICY IF EXISTS "Profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profile delete policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profile view policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profile update policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profile insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Enhanced profile delete policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles SELECT policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles UPDATE policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles INSERT policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles DELETE policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can delete profiles" ON public.profiles;

-- ============================================================================
-- STEP 2: UPDATE ROLE CONSTRAINT
-- ============================================================================

-- Update any existing users with 'recruiter' role
UPDATE public.profiles 
SET role = 'branch_manager' 
WHERE role = 'recruiter';

-- Drop and recreate the role constraint
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'branch_manager', 'hr', 'trainer', 'content_manager'));

-- ============================================================================
-- STEP 3: CREATE HELPER FUNCTIONS
-- ============================================================================

-- Create or update the helper function
CREATE OR REPLACE FUNCTION public.is_user_admin(user_id UUID DEFAULT auth.uid())
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

-- ============================================================================
-- STEP 4: CREATE SIMPLE, CLEAN RLS POLICIES
-- ============================================================================

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile + Admins can view all
CREATE POLICY "profiles_select" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  public.is_user_admin()
);

-- Policy 2: Users can update their own profile + Admins can update any
CREATE POLICY "profiles_update" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.is_user_admin()
);

-- Policy 3: Allow profile creation (for registration and admin creation)
CREATE POLICY "profiles_insert" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  auth.uid() = id OR 
  public.is_user_admin()
);

-- Policy 4: Only admins can delete profiles (except their own)
CREATE POLICY "profiles_delete" ON public.profiles
FOR DELETE TO authenticated
USING (
  public.is_user_admin() AND auth.uid() != id
);

-- ============================================================================
-- STEP 5: VERIFY THE FIX
-- ============================================================================

-- Check current policies
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Check role constraint
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass 
AND contype = 'c';

-- Test insert (this should work now)
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
    
    RAISE NOTICE '✅ Test insert successful - RLS is working!';
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test insert failed: %', SQLERRM;
END $$; 