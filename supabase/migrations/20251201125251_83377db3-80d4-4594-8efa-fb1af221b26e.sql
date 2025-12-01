-- Management Portal: Additional tables (avoiding conflicts)

-- Organization table for company settings
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  vision TEXT,
  mission TEXT,
  primary_color TEXT DEFAULT '#3b82f6',
  secondary_color TEXT DEFAULT '#1e40af',
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Teams table (under departments)
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  lead_id UUID REFERENCES public.employees(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Strategic Goals
CREATE TABLE IF NOT EXISTS public.strategic_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL CHECK (scope IN ('company', 'department', 'team')),
  department_id UUID REFERENCES public.departments(id),
  team_id UUID REFERENCES public.teams(id),
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  owner_employee_id UUID REFERENCES public.employees(id),
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'at_risk', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- KPI Updates history
CREATE TABLE IF NOT EXISTS public.kpi_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES public.kpi_definitions(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  value NUMERIC NOT NULL,
  notes TEXT,
  updated_by_employee_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Page permissions for role-based access
CREATE TABLE IF NOT EXISTS public.page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  page_path TEXT NOT NULL,
  can_view BOOLEAN DEFAULT true,
  can_edit BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, page_path)
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategic_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop if exists then create)
DROP POLICY IF EXISTS "Anyone can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authorized users can manage organizations" ON public.organizations;
CREATE POLICY "Anyone can view organizations" ON public.organizations FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage organizations" ON public.organizations FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Anyone can view teams" ON public.teams;
DROP POLICY IF EXISTS "Authorized users can manage teams" ON public.teams;
CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage teams" ON public.teams FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

DROP POLICY IF EXISTS "Anyone can view strategic_goals" ON public.strategic_goals;
DROP POLICY IF EXISTS "Authorized users can manage strategic_goals" ON public.strategic_goals;
CREATE POLICY "Anyone can view strategic_goals" ON public.strategic_goals FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage strategic_goals" ON public.strategic_goals FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

DROP POLICY IF EXISTS "Anyone can view kpi_updates" ON public.kpi_updates;
DROP POLICY IF EXISTS "Anyone can insert kpi_updates" ON public.kpi_updates;
CREATE POLICY "Anyone can view kpi_updates" ON public.kpi_updates FOR SELECT USING (true);
CREATE POLICY "Anyone can insert kpi_updates" ON public.kpi_updates FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Anyone can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Authorized users can view page_permissions" ON public.page_permissions;
DROP POLICY IF EXISTS "Super admins can manage page_permissions" ON public.page_permissions;
CREATE POLICY "Authorized users can view page_permissions" ON public.page_permissions FOR SELECT USING (user_id = auth.uid() OR has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'ceo'));
CREATE POLICY "Super admins can manage page_permissions" ON public.page_permissions FOR ALL USING (has_role(auth.uid(), 'super_admin'));