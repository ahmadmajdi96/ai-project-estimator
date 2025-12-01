-- Create company documents table
CREATE TABLE public.company_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  category TEXT DEFAULT 'general',
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  uploaded_by UUID,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view company_documents" ON public.company_documents FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage company_documents" ON public.company_documents FOR ALL USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role));

-- Create storage bucket for company documents
INSERT INTO storage.buckets (id, name, public) VALUES ('company-documents', 'company-documents', true);

-- Storage policies
CREATE POLICY "Company documents are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'company-documents');
CREATE POLICY "Authorized users can upload company documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'company-documents');
CREATE POLICY "Authorized users can update company documents" ON storage.objects FOR UPDATE USING (bucket_id = 'company-documents');
CREATE POLICY "Authorized users can delete company documents" ON storage.objects FOR DELETE USING (bucket_id = 'company-documents');

-- Enable realtime for debit_cases
ALTER PUBLICATION supabase_realtime ADD TABLE public.debit_cases;