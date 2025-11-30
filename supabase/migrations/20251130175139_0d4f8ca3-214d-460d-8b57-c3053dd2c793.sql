-- Fix RLS policies for management section to allow public read access

-- Drop and recreate employees SELECT policy to allow anyone
DROP POLICY IF EXISTS "Employees are viewable by authenticated users" ON public.employees;
CREATE POLICY "Anyone can view employees" 
ON public.employees 
FOR SELECT 
USING (true);

-- Drop and recreate departments SELECT policy to allow anyone  
DROP POLICY IF EXISTS "Departments are viewable by authenticated users" ON public.departments;
CREATE POLICY "Anyone can view departments" 
ON public.departments 
FOR SELECT 
USING (true);

-- Drop and recreate tasks SELECT policy to allow anyone
DROP POLICY IF EXISTS "Tasks are viewable by authenticated users" ON public.tasks;
CREATE POLICY "Anyone can view tasks" 
ON public.tasks 
FOR SELECT 
USING (true);

-- Drop and recreate kpi_definitions SELECT policy to allow anyone
DROP POLICY IF EXISTS "KPI definitions are viewable by authenticated users" ON public.kpi_definitions;
CREATE POLICY "Anyone can view kpi_definitions" 
ON public.kpi_definitions 
FOR SELECT 
USING (true);

-- Drop and recreate kpi_records SELECT policy to allow anyone
DROP POLICY IF EXISTS "KPI records are viewable by authenticated users" ON public.kpi_records;
CREATE POLICY "Anyone can view kpi_records" 
ON public.kpi_records 
FOR SELECT 
USING (true);

-- Drop and recreate roadmaps SELECT policy to allow anyone
DROP POLICY IF EXISTS "Roadmaps are viewable by authenticated users" ON public.roadmaps;
CREATE POLICY "Anyone can view roadmaps" 
ON public.roadmaps 
FOR SELECT 
USING (true);

-- Drop and recreate milestones SELECT policy to allow anyone
DROP POLICY IF EXISTS "Milestones are viewable by authenticated users" ON public.milestones;
CREATE POLICY "Anyone can view milestones" 
ON public.milestones 
FOR SELECT 
USING (true);