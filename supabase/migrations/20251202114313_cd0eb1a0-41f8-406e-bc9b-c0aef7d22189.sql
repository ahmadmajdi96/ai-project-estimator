-- Add roadmap_id and other missing columns to existing milestones table
ALTER TABLE public.milestones
ADD COLUMN IF NOT EXISTS roadmap_id UUID REFERENCES public.roadmaps(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS strategic_goal_id UUID REFERENCES public.strategic_goals(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS owner_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS owner_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL;

-- Update due_date from target_date for existing records
UPDATE public.milestones SET due_date = target_date WHERE due_date IS NULL AND target_date IS NOT NULL;