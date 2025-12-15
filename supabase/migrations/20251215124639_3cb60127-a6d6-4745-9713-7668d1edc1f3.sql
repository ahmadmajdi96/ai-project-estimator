-- Drop existing restrictive policy on user_roles
DROP POLICY IF EXISTS "Only admins can manage roles" ON public.user_roles;

-- Create separate policies for user_roles management
-- Allow super_admin to manage all roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Allow CEO to manage roles
CREATE POLICY "CEO can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'ceo'))
WITH CHECK (public.has_role(auth.uid(), 'ceo'));

-- Allow service role to insert (for triggers)
-- This is handled by the trigger being SECURITY DEFINER

-- Update the handle_new_user function to be SECURITY DEFINER with proper search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'employee');
  
  RETURN new;
END;
$$;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Now for page permissions - add more granular page paths
-- First, let's ensure the page_permissions table exists with proper structure
-- (it should already exist, but let's add any missing indexes)
CREATE INDEX IF NOT EXISTS idx_page_permissions_user_id ON public.page_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_page_permissions_page_path ON public.page_permissions(page_path);