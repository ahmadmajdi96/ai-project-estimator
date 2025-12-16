-- Drop existing restrictive policy and create a more permissive one for department management
DROP POLICY IF EXISTS "Departments can be managed by ceo/heads" ON public.departments;

-- Allow all authenticated users to manage departments (for management portal)
CREATE POLICY "Authenticated users can manage departments"
ON public.departments
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);