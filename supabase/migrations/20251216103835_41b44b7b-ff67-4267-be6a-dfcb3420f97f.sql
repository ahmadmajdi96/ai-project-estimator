-- Add new columns to employees table
ALTER TABLE public.employees 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS national_id TEXT,
ADD COLUMN IF NOT EXISTS level TEXT DEFAULT 'junior',
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false;

-- Create employee_documents table for dynamic file uploads
CREATE TABLE IF NOT EXISTS public.employee_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on employee_documents
ALTER TABLE public.employee_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for employee_documents
CREATE POLICY "Authenticated users can manage employee documents"
ON public.employee_documents
FOR ALL
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee_id ON public.employee_documents(employee_id);

-- Add manager column to employee_requests for approval workflow
ALTER TABLE public.employee_requests 
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES public.employees(id),
ADD COLUMN IF NOT EXISTS manager_notes TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;