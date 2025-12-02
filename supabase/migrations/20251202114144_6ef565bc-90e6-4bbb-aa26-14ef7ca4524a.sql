-- Create positions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  description TEXT,
  responsibilities TEXT[],
  required_skills UUID[],
  seniority_level TEXT CHECK (seniority_level IN ('Junior', 'Mid', 'Senior', 'Lead', 'Director')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create skills catalog table
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create employee_skills junction table
CREATE TABLE IF NOT EXISTS public.employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('Basic', 'Intermediate', 'Advanced', 'Expert')),
  last_evaluated_at TIMESTAMPTZ,
  validated_by_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(employee_id, skill_id)
);

-- Create job_descriptions table
CREATE TABLE IF NOT EXISTS public.job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID NOT NULL REFERENCES public.positions(id) ON DELETE CASCADE,
  summary TEXT,
  responsibilities TEXT[],
  required_skills UUID[],
  ideal_profile TEXT,
  additional_requirements TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create task_ai_estimations table
CREATE TABLE IF NOT EXISTS public.task_ai_estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  estimated_hours NUMERIC NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard', 'VeryHard')),
  skill_gap TEXT[],
  risk_factors TEXT[],
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_raw_output JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to employees table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='team_id') THEN
    ALTER TABLE public.employees ADD COLUMN team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='position_id') THEN
    ALTER TABLE public.employees ADD COLUMN position_id UUID REFERENCES public.positions(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='start_date') THEN
    ALTER TABLE public.employees ADD COLUMN start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='avatar_url') THEN
    ALTER TABLE public.employees ADD COLUMN avatar_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='responsibilities') THEN
    ALTER TABLE public.employees ADD COLUMN responsibilities TEXT[];
  END IF;
END $$;

-- Add missing columns to tasks table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='milestone_id') THEN
    ALTER TABLE public.tasks ADD COLUMN milestone_id UUID REFERENCES public.milestones(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='assigned_team_id') THEN
    ALTER TABLE public.tasks ADD COLUMN assigned_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='start_date') THEN
    ALTER TABLE public.tasks ADD COLUMN start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='estimated_hours') THEN
    ALTER TABLE public.tasks ADD COLUMN estimated_hours NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='actual_hours') THEN
    ALTER TABLE public.tasks ADD COLUMN actual_hours NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='estimated_hours_ai') THEN
    ALTER TABLE public.tasks ADD COLUMN estimated_hours_ai NUMERIC;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='difficulty_ai') THEN
    ALTER TABLE public.tasks ADD COLUMN difficulty_ai TEXT CHECK (difficulty_ai IN ('Easy', 'Medium', 'Hard', 'VeryHard'));
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='tasks' AND column_name='ai_estimation_id') THEN
    ALTER TABLE public.tasks ADD COLUMN ai_estimation_id UUID REFERENCES public.task_ai_estimations(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE public.positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_ai_estimations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Anyone can view positions" ON public.positions;
DROP POLICY IF EXISTS "Authorized users can manage positions" ON public.positions;
DROP POLICY IF EXISTS "Anyone can view skills" ON public.skills;
DROP POLICY IF EXISTS "Authorized users can manage skills" ON public.skills;
DROP POLICY IF EXISTS "Anyone can view employee_skills" ON public.employee_skills;
DROP POLICY IF EXISTS "Anyone can manage employee_skills" ON public.employee_skills;
DROP POLICY IF EXISTS "Anyone can view job_descriptions" ON public.job_descriptions;
DROP POLICY IF EXISTS "Authorized users can manage job_descriptions" ON public.job_descriptions;
DROP POLICY IF EXISTS "Anyone can view task_ai_estimations" ON public.task_ai_estimations;
DROP POLICY IF EXISTS "Anyone can create task_ai_estimations" ON public.task_ai_estimations;

-- Create RLS policies
CREATE POLICY "Anyone can view positions" ON public.positions FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage positions" ON public.positions FOR ALL USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role));

CREATE POLICY "Anyone can view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage skills" ON public.skills FOR ALL USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role));

CREATE POLICY "Anyone can view employee_skills" ON public.employee_skills FOR SELECT USING (true);
CREATE POLICY "Anyone can manage employee_skills" ON public.employee_skills FOR ALL USING (true);

CREATE POLICY "Anyone can view job_descriptions" ON public.job_descriptions FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage job_descriptions" ON public.job_descriptions FOR ALL USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role));

CREATE POLICY "Anyone can view task_ai_estimations" ON public.task_ai_estimations FOR SELECT USING (true);
CREATE POLICY "Anyone can create task_ai_estimations" ON public.task_ai_estimations FOR INSERT WITH CHECK (true);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_positions_updated_at ON public.positions;
DROP TRIGGER IF EXISTS update_job_descriptions_updated_at ON public.job_descriptions;

CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON public.positions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_job_descriptions_updated_at BEFORE UPDATE ON public.job_descriptions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();