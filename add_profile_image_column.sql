-- Simple SQL to add profile_image_url column to profiles table
-- Run this in your Supabase SQL Editor if the column doesn't exist

-- Add profile_image_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Add comment to document the purpose of this field
COMMENT ON COLUMN public.profiles.profile_image_url IS 'URL to user profile image stored in Supabase Storage';

-- Create index for better performance when querying profiles with images
CREATE INDEX IF NOT EXISTS idx_profiles_profile_image_url ON public.profiles(profile_image_url) WHERE profile_image_url IS NOT NULL; 