-- Fix admin role for helloskalamin@gmail.com
-- First, let's see what users exist in auth.users
SELECT id, email, created_at FROM auth.users WHERE email = 'helloskalamin@gmail.com';

-- Check existing profile
SELECT id, email, role, admin_name, display_name FROM public.profiles;

-- Update existing profile to admin (this will work if profile exists with matching user ID)
UPDATE public.profiles 
SET role = 'admin', 
    admin_name = 'Admin User',
    display_name = 'Admin User',
    email = 'helloskalamin@gmail.com'
WHERE id = (SELECT id FROM auth.users WHERE email = 'helloskalamin@gmail.com');

-- If no profile exists, create one using the auth user ID
INSERT INTO public.profiles (id, email, role, admin_name, display_name)
SELECT 
  u.id,
  u.email,
  'admin',
  'Admin User',
  'Admin User'
FROM auth.users u
WHERE u.email = 'helloskalamin@gmail.com' 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  admin_name = 'Admin User',
  display_name = 'Admin User',
  email = EXCLUDED.email;

-- Final check
SELECT 'Auth Users:' as table_name, id, email, created_at FROM auth.users WHERE email = 'helloskalamin@gmail.com'
UNION ALL
SELECT 'Profiles:' as table_name, id::text, email, created_at::timestamp FROM public.profiles WHERE email = 'helloskalamin@gmail.com' OR id = (SELECT id FROM auth.users WHERE email = 'helloskalamin@gmail.com'); 