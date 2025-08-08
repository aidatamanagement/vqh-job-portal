-- RLS policies for user location access
-- Users can view their own profile location, admins can view all

-- 1. Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_location_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_location_policy" ON public.profiles;

-- 2. Create policy for users to view their own profile location
CREATE POLICY "profiles_select_location_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  -- Users can view their own profile
  auth.uid() = id
  OR
  -- Admins can view all profiles
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
  OR
  -- HR managers can view all profiles (for management purposes)
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'hr'
  )
);

-- 3. Create policy for users to update their own profile location
CREATE POLICY "profiles_update_location_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  -- Users can update their own profile
  auth.uid() = id
  OR
  -- Admins can update any profile
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  -- Prevent users from changing their own role
  CASE 
    WHEN auth.uid() = id THEN 
      (OLD.role = NEW.role OR NEW.role IS NULL)
    ELSE true
  END
);

-- 4. Create policy for profile insertion (for new users)
CREATE POLICY "profiles_insert_location_policy" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (
  -- Users can create their own profile
  auth.uid() = id
  OR
  -- Admins can create profiles for others
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Create policy for profile deletion (admin only)
CREATE POLICY "profiles_delete_location_policy" ON public.profiles
FOR DELETE TO authenticated
USING (
  -- Only admins can delete profiles (except their own)
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) AND auth.uid() != id
);

-- 6. Ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Add comments for documentation
COMMENT ON POLICY "profiles_select_location_policy" ON public.profiles IS 
'Allows users to view their own profile location, admins and HR to view all profiles';

COMMENT ON POLICY "profiles_update_location_policy" ON public.profiles IS 
'Allows users to update their own profile location, admins to update any profile';

COMMENT ON POLICY "profiles_insert_location_policy" ON public.profiles IS 
'Allows users to create their own profile, admins to create profiles for others';

COMMENT ON POLICY "profiles_delete_location_policy" ON public.profiles IS 
'Allows only admins to delete profiles (except their own)'; 