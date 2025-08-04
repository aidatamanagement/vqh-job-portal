-- Debug Edge Function Issues
-- Run this in your Supabase SQL Editor

-- ============================================================================
-- STEP 1: CHECK WHAT THE EDGE FUNCTION IS RECEIVING
-- ============================================================================

-- Check Edge Function logs (this will show in Supabase Dashboard)
-- Go to: Supabase Dashboard → Edge Functions → admin-create-user → Logs

-- ============================================================================
-- STEP 2: TEST THE EXACT SAME DATA THE FRONTEND SENDS
-- ============================================================================

-- Simulate exactly what the frontend sends to the Edge Function
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-branch-manager@example.com';
    test_role TEXT := 'branch_manager';
BEGIN
    -- Test the exact insert that the Edge Function tries to do
    INSERT INTO public.profiles (
        id, 
        email, 
        role, 
        admin_name, 
        display_name, 
        location,
        created_at, 
        updated_at
    ) VALUES (
        test_user_id,
        test_email,
        test_role,
        'Test Branch Manager',
        'Test Branch Manager',
        NULL,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Test insert with branch_manager role successful!';
    RAISE NOTICE 'User ID: %', test_user_id;
    RAISE NOTICE 'Email: %', test_email;
    RAISE NOTICE 'Role: %', test_role;
    
    -- Verify the insert worked
    SELECT 
        id, 
        email, 
        role, 
        admin_name,
        created_at
    FROM public.profiles 
    WHERE id = test_user_id;
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_user_id;
    RAISE NOTICE '✅ Test cleanup successful';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Test failed: %', SQLERRM;
    RAISE NOTICE 'Error code: %', SQLSTATE;
END $$;

-- ============================================================================
-- STEP 3: CHECK IF THERE ARE ANY TRIGGERS BLOCKING INSERTS
-- ============================================================================

-- Check for any triggers on the profiles table
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'profiles'
AND trigger_schema = 'public';

-- ============================================================================
-- STEP 4: CHECK CURRENT RLS POLICIES
-- ============================================================================

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
-- STEP 5: TEST WITH SERVICE ROLE (LIKE EDGE FUNCTION)
-- ============================================================================

-- This simulates the Edge Function using service role
-- Note: This might not work in SQL editor, but shows what should work
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Try to insert as if we're the Edge Function
    -- The Edge Function uses service role, which bypasses RLS
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
        'service-role-test@example.com',
        'branch_manager',
        'Service Role Test',
        'Service Role Test',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE '✅ Service role test successful';
    
    -- Clean up
    DELETE FROM public.profiles WHERE id = test_user_id;
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Service role test failed: %', SQLERRM;
END $$; 