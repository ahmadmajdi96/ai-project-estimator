-- Client Documents table
CREATE TABLE public.client_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.client_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view client documents" ON public.client_documents FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client documents" ON public.client_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete client documents" ON public.client_documents FOR DELETE USING (true);

-- Create storage bucket for client documents
INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', true);

CREATE POLICY "Public read client docs" ON storage.objects FOR SELECT USING (bucket_id = 'client-documents');
CREATE POLICY "Anyone can upload client docs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'client-documents');
CREATE POLICY "Anyone can delete client docs" ON storage.objects FOR DELETE USING (bucket_id = 'client-documents');

-- Pipeline Stages table (dynamic)
CREATE TABLE public.pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pipeline_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pipeline stages" ON public.pipeline_stages FOR SELECT USING (true);
CREATE POLICY "Anyone can manage pipeline stages" ON public.pipeline_stages FOR ALL USING (true);

-- Insert default pipeline stages
INSERT INTO public.pipeline_stages (name, value, color, sort_order) VALUES 
  ('Pre-Sales', 'pre_sales', '#3b82f6', 0),
  ('Negotiation', 'negotiation', '#f59e0b', 1),
  ('Closing', 'closing', '#8b5cf6', 2),
  ('Post-Sales', 'post_sales', '#10b981', 3),
  ('Support', 'support', '#06b6d4', 4);

-- Client Status Configs table (dynamic)
CREATE TABLE public.client_status_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.client_status_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view status configs" ON public.client_status_configs FOR SELECT USING (true);
CREATE POLICY "Anyone can manage status configs" ON public.client_status_configs FOR ALL USING (true);

-- Insert default statuses
INSERT INTO public.client_status_configs (name, value, color, sort_order) VALUES 
  ('Prospect', 'prospect', '#3b82f6', 0),
  ('Active', 'active', '#10b981', 1),
  ('Inactive', 'inactive', '#6b7280', 2),
  ('Former', 'former', '#ef4444', 3);

-- Page Permissions table
CREATE TABLE public.page_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  can_access BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, page_path)
);

ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own permissions" ON public.page_permissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "CEO can manage permissions" ON public.page_permissions FOR ALL USING (has_role(auth.uid(), 'ceo'::app_role));

-- User invitations for user management
CREATE TABLE public.user_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role app_role NOT NULL DEFAULT 'employee',
  invited_by UUID REFERENCES auth.users(id),
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days')
);

ALTER TABLE public.user_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "CEO can manage invitations" ON public.user_invitations FOR ALL USING (has_role(auth.uid(), 'ceo'::app_role));
CREATE POLICY "Anyone can view invitations" ON public.user_invitations FOR SELECT USING (true);