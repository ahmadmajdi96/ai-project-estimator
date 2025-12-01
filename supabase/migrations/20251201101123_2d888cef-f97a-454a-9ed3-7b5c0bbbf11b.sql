-- Create a function to check hierarchical role access
CREATE OR REPLACE FUNCTION public.get_role_level(_role app_role)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE _role
    WHEN 'super_admin' THEN 4
    WHEN 'ceo' THEN 3
    WHEN 'department_head' THEN 2
    WHEN 'team_lead' THEN 1
    WHEN 'employee' THEN 0
  END
$$;

-- Function to check if user has at least a certain role level
CREATE OR REPLACE FUNCTION public.has_role_level(_user_id uuid, _min_role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
      AND public.get_role_level(ur.role) >= public.get_role_level(_min_role)
  )
$$;

-- Create dashboard_access table to control which roles can access which dashboards
CREATE TABLE IF NOT EXISTS public.dashboard_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_name text NOT NULL UNIQUE,
  min_role app_role NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.dashboard_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view dashboard_access"
  ON public.dashboard_access FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage dashboard_access"
  ON public.dashboard_access FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Insert default dashboard access rules
INSERT INTO public.dashboard_access (dashboard_name, min_role) VALUES
  ('crm', 'employee'),
  ('management', 'department_head')
ON CONFLICT (dashboard_name) DO NOTHING;