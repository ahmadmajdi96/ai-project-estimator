-- Add new fields to salesmen table
ALTER TABLE public.salesmen 
ADD COLUMN IF NOT EXISTS social_number TEXT,
ADD COLUMN IF NOT EXISTS contract_type TEXT DEFAULT 'fulltime' CHECK (contract_type IN ('fulltime', 'parttime', 'contractor')),
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create salesman documents table
CREATE TABLE IF NOT EXISTS public.salesman_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesman_id UUID NOT NULL REFERENCES public.salesmen(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  uploaded_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.salesman_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for salesman_documents
CREATE POLICY "Anyone can view salesman documents" ON public.salesman_documents FOR SELECT USING (true);
CREATE POLICY "Anyone can insert salesman documents" ON public.salesman_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete salesman documents" ON public.salesman_documents FOR DELETE USING (true);

-- Create storage bucket for salesman documents
INSERT INTO storage.buckets (id, name, public) VALUES ('salesman-documents', 'salesman-documents', true) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Public read access for salesman-documents" ON storage.objects FOR SELECT USING (bucket_id = 'salesman-documents');
CREATE POLICY "Anyone can upload to salesman-documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'salesman-documents');
CREATE POLICY "Anyone can delete from salesman-documents" ON storage.objects FOR DELETE USING (bucket_id = 'salesman-documents');

-- Create component categories table for dynamic categories
CREATE TABLE IF NOT EXISTS public.component_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'Sparkles',
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.component_categories ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view categories" ON public.component_categories FOR SELECT USING (true);
CREATE POLICY "Anyone can insert categories" ON public.component_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update categories" ON public.component_categories FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete categories" ON public.component_categories FOR DELETE USING (true);

-- Insert default categories
INSERT INTO public.component_categories (name, description, icon, sort_order) VALUES
  ('Website', 'Website development components', 'Globe', 1),
  ('AI Services', 'AI and machine learning services', 'Bot', 2),
  ('Features', 'Application features and modules', 'Sparkles', 3),
  ('Backend', 'Backend development services', 'Code', 4),
  ('Design', 'Design and UI/UX services', 'Image', 5),
  ('Integrations', 'Third-party integrations', 'Shield', 6)
ON CONFLICT (name) DO NOTHING;