-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task_attachments table
CREATE TABLE IF NOT EXISTS public.task_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create employee_requests table for general employee requests
CREATE TABLE IF NOT EXISTS public.employee_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id),
  request_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salary_slips table
CREATE TABLE IF NOT EXISTS public.salary_slips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  basic_salary NUMERIC(12,2) DEFAULT 0,
  allowances NUMERIC(12,2) DEFAULT 0,
  bonuses NUMERIC(12,2) DEFAULT 0,
  gross_salary NUMERIC(12,2) DEFAULT 0,
  tax_deduction NUMERIC(12,2) DEFAULT 0,
  insurance_deduction NUMERIC(12,2) DEFAULT 0,
  pension_deduction NUMERIC(12,2) DEFAULT 0,
  other_deductions NUMERIC(12,2) DEFAULT 0,
  total_deductions NUMERIC(12,2) DEFAULT 0,
  net_salary NUMERIC(12,2) DEFAULT 0,
  payment_date DATE,
  payment_status TEXT DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_slips ENABLE ROW LEVEL SECURITY;

-- RLS policies for task_comments
CREATE POLICY "Anyone can view task comments" ON public.task_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.task_comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update their own comments" ON public.task_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments" ON public.task_comments FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for task_attachments
CREATE POLICY "Anyone can view task attachments" ON public.task_attachments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upload attachments" ON public.task_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete their own attachments" ON public.task_attachments FOR DELETE USING (auth.uid() = uploaded_by);

-- RLS policies for employee_requests
CREATE POLICY "Anyone can view requests" ON public.employee_requests FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create requests" ON public.employee_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update requests" ON public.employee_requests FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS policies for salary_slips
CREATE POLICY "Anyone can view salary slips" ON public.salary_slips FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage salary slips" ON public.salary_slips FOR ALL USING (auth.uid() IS NOT NULL);

-- Add stage_id to tasks if not exists (for custom pipeline stages)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'stage_id') THEN
    ALTER TABLE public.tasks ADD COLUMN stage_id UUID REFERENCES public.task_stages(id);
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_attachments_task_id ON public.task_attachments(task_id);
CREATE INDEX IF NOT EXISTS idx_employee_requests_employee_id ON public.employee_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_salary_slips_employee_id ON public.salary_slips(employee_id);