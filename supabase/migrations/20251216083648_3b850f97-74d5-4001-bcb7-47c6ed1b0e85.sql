-- Drop existing restrictive policy and create a more permissive one for employee management
DROP POLICY IF EXISTS "Employees can be managed by authorized users" ON public.employees;

-- Allow all authenticated users to manage employees (for management portal)
CREATE POLICY "Authenticated users can manage employees"
ON public.employees
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);