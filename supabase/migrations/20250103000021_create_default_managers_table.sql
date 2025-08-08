-- Create table for default branch manager assignments
-- This allows admins to set which branch manager handles which location

CREATE TABLE IF NOT EXISTS public.default_branch_managers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location_name TEXT NOT NULL,
  manager_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one manager per location
  UNIQUE(location_name)
);

-- Add comments
COMMENT ON TABLE public.default_branch_managers IS 'Maps locations to their default branch managers for automatic assignment';
COMMENT ON COLUMN public.default_branch_managers.location_name IS 'Location name (e.g., Dublin, OH)';
COMMENT ON COLUMN public.default_branch_managers.manager_id IS 'Branch manager profile ID';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_default_branch_managers_location ON public.default_branch_managers(location_name);
CREATE INDEX IF NOT EXISTS idx_default_branch_managers_manager ON public.default_branch_managers(manager_id);

-- Enable RLS
ALTER TABLE public.default_branch_managers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admins, HR managers, and Branch managers can manage default branch managers
CREATE POLICY "Admins and managers can manage default branch managers" ON public.default_branch_managers
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'hr', 'branch_manager')
  )
);

-- Anyone can view default branch managers (for job posting)
CREATE POLICY "Anyone can view default branch managers" ON public.default_branch_managers
FOR SELECT TO public
USING (true); 