-- Fix search_path for get_role_level function
CREATE OR REPLACE FUNCTION public.get_role_level(_role app_role)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _role
    WHEN 'super_admin' THEN 4
    WHEN 'ceo' THEN 3
    WHEN 'department_head' THEN 2
    WHEN 'team_lead' THEN 1
    WHEN 'employee' THEN 0
  END
$$;