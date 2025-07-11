-- Add location field to profiles table
-- This allows tracking the location/region of each user/admin

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

-- Add comment to document the purpose of this field
COMMENT ON COLUMN public.profiles.location IS 'Location/region where the user is based (e.g. city, state, region)';

-- Create index for better performance when querying profiles by location
CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(location);

-- Update existing profiles with a default location if needed (optional)
-- This can be customized based on your needs
-- UPDATE public.profiles SET location = 'Not Specified' WHERE location IS NULL; 