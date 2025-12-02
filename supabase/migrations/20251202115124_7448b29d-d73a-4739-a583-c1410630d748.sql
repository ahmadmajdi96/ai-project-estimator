-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create workflow_definitions table
CREATE TABLE IF NOT EXISTS public.workflow_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  steps TEXT[] NOT NULL,
  related_pages TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create strategic_goals table
CREATE TABLE IF NOT EXISTS public.strategic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('company', 'department', 'team')),
  organization_id UUID,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  team_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  owner_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create objectives table (for OKRs)
CREATE TABLE IF NOT EXISTS public.objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_goal_id UUID REFERENCES public.strategic_goals(id) ON DELETE SET NULL,
  scope TEXT NOT NULL CHECK (scope IN ('company', 'department', 'team')),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  owner_employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create key_results table (for OKRs)
CREATE TABLE IF NOT EXISTS public.key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective_id UUID NOT NULL REFERENCES public.objectives(id) ON DELETE CASCADE,
  linked_kpi_id UUID,
  title TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  status TEXT NOT NULL DEFAULT 'on_track' CHECK (status IN ('on_track', 'at_risk', 'off_track', 'achieved')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create task_ai_estimations table
CREATE TABLE IF NOT EXISTS public.task_ai_estimations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL,
  estimated_hours NUMERIC NOT NULL,
  difficulty_level TEXT NOT NULL CHECK (difficulty_level IN ('Easy', 'Medium', 'Hard', 'VeryHard')),
  skill_gap TEXT[],
  risk_factors TEXT[],
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_raw_output JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_strategic_goals_department_id ON public.strategic_goals(department_id);
CREATE INDEX IF NOT EXISTS idx_objectives_strategic_goal_id ON public.objectives(strategic_goal_id);
CREATE INDEX IF NOT EXISTS idx_key_results_objective_id ON public.key_results(objective_id);

-- Add RLS policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_ai_estimations ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Workflow definitions policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view workflow definitions"
  ON public.workflow_definitions FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Strategic goals policies
CREATE POLICY "Anyone can view strategic goals"
  ON public.strategic_goals FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage strategic goals"
  ON public.strategic_goals FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Objectives policies
CREATE POLICY "Anyone can view objectives"
  ON public.objectives FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage objectives"
  ON public.objectives FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Key results policies
CREATE POLICY "Anyone can view key results"
  ON public.key_results FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Managers can manage key results"
  ON public.key_results FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Task AI estimations policies
CREATE POLICY "Anyone can view task AI estimations"
  ON public.task_ai_estimations FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can create task AI estimations"
  ON public.task_ai_estimations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Add triggers for updated_at
CREATE TRIGGER update_workflow_definitions_updated_at
  BEFORE UPDATE ON public.workflow_definitions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_strategic_goals_updated_at
  BEFORE UPDATE ON public.strategic_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_objectives_updated_at
  BEFORE UPDATE ON public.objectives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_key_results_updated_at
  BEFORE UPDATE ON public.key_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();