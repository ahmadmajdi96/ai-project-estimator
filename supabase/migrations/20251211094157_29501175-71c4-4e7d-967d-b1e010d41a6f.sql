
-- HR Leave Types
CREATE TABLE public.hr_leave_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  days_allowed INTEGER DEFAULT 0,
  is_paid BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Attendance Records
CREATE TABLE public.hr_attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half_day', 'on_leave')),
  overtime_hours NUMERIC(5,2) DEFAULT 0,
  notes TEXT,
  location_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Leave Requests
CREATE TABLE public.hr_leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES public.hr_leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Leave Balances
CREATE TABLE public.hr_leave_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  leave_type_id UUID REFERENCES public.hr_leave_types(id),
  year INTEGER NOT NULL,
  total_days NUMERIC(5,2) DEFAULT 0,
  used_days NUMERIC(5,2) DEFAULT 0,
  pending_days NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(employee_id, leave_type_id, year)
);

-- HR Job Postings
CREATE TABLE public.hr_job_postings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  description TEXT,
  requirements TEXT,
  salary_range JSONB DEFAULT '{}',
  location TEXT,
  employment_type TEXT DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contract', 'internship')),
  status TEXT DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'on_hold')),
  posted_date DATE,
  closing_date DATE,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Candidates
CREATE TABLE public.hr_candidates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_posting_id UUID REFERENCES public.hr_job_postings(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  cover_letter TEXT,
  stage TEXT DEFAULT 'applied' CHECK (stage IN ('applied', 'screening', 'interview', 'assessment', 'offer', 'hired', 'rejected')),
  source TEXT,
  skills JSONB DEFAULT '[]',
  experience_years INTEGER,
  notes TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  interview_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Payroll Periods
CREATE TABLE public.hr_payroll_periods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid')),
  total_gross NUMERIC(15,2) DEFAULT 0,
  total_deductions NUMERIC(15,2) DEFAULT 0,
  total_net NUMERIC(15,2) DEFAULT 0,
  created_by UUID,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Payroll Entries
CREATE TABLE public.hr_payroll_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_period_id UUID REFERENCES public.hr_payroll_periods(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  base_salary NUMERIC(15,2) DEFAULT 0,
  allowances JSONB DEFAULT '[]',
  deductions JSONB DEFAULT '[]',
  bonuses NUMERIC(15,2) DEFAULT 0,
  overtime_pay NUMERIC(15,2) DEFAULT 0,
  gross_pay NUMERIC(15,2) DEFAULT 0,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  net_pay NUMERIC(15,2) DEFAULT 0,
  bank_account JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Onboarding Tasks
CREATE TABLE public.hr_onboarding_tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  task_name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('documents', 'it_setup', 'training', 'equipment', 'orientation', 'general')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Performance Reviews
CREATE TABLE public.hr_performance_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.employees(id),
  review_period TEXT,
  review_type TEXT DEFAULT 'annual' CHECK (review_type IN ('annual', 'quarterly', 'probation', '360')),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  strengths TEXT,
  improvements TEXT,
  goals TEXT,
  comments TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  submitted_at TIMESTAMP WITH TIME ZONE,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR OKRs
CREATE TABLE public.hr_okrs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  objective TEXT NOT NULL,
  key_results JSONB DEFAULT '[]',
  period TEXT,
  weight NUMERIC(5,2) DEFAULT 1,
  progress NUMERIC(5,2) DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Training Courses
CREATE TABLE public.hr_training_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_hours NUMERIC(5,2),
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  is_mandatory BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Employee Training
CREATE TABLE public.hr_employee_training (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.hr_training_courses(id) ON DELETE CASCADE,
  assigned_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  completed_date DATE,
  progress NUMERIC(5,2) DEFAULT 0,
  score NUMERIC(5,2),
  certificate_url TEXT,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Benefits
CREATE TABLE public.hr_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'health' CHECK (type IN ('health', 'retirement', 'insurance', 'allowance', 'other')),
  value NUMERIC(15,2),
  is_active BOOLEAN DEFAULT true,
  eligibility_rules JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Employee Benefits
CREATE TABLE public.hr_employee_benefits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  benefit_id UUID REFERENCES public.hr_benefits(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Documents
CREATE TABLE public.hr_employee_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  document_url TEXT,
  expiry_date DATE,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- HR Settings
CREATE TABLE public.hr_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hr_leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payroll_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payroll_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_training_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for authenticated users
CREATE POLICY "Authenticated users can view leave types" ON public.hr_leave_types FOR SELECT USING (true);
CREATE POLICY "HR can manage leave types" ON public.hr_leave_types FOR ALL USING (true);

CREATE POLICY "Authenticated users can view attendance" ON public.hr_attendance FOR SELECT USING (true);
CREATE POLICY "HR can manage attendance" ON public.hr_attendance FOR ALL USING (true);

CREATE POLICY "Authenticated users can view leave requests" ON public.hr_leave_requests FOR SELECT USING (true);
CREATE POLICY "Users can manage leave requests" ON public.hr_leave_requests FOR ALL USING (true);

CREATE POLICY "Authenticated users can view leave balances" ON public.hr_leave_balances FOR SELECT USING (true);
CREATE POLICY "HR can manage leave balances" ON public.hr_leave_balances FOR ALL USING (true);

CREATE POLICY "Authenticated users can view job postings" ON public.hr_job_postings FOR SELECT USING (true);
CREATE POLICY "HR can manage job postings" ON public.hr_job_postings FOR ALL USING (true);

CREATE POLICY "Authenticated users can view candidates" ON public.hr_candidates FOR SELECT USING (true);
CREATE POLICY "HR can manage candidates" ON public.hr_candidates FOR ALL USING (true);

CREATE POLICY "Authenticated users can view payroll periods" ON public.hr_payroll_periods FOR SELECT USING (true);
CREATE POLICY "HR can manage payroll periods" ON public.hr_payroll_periods FOR ALL USING (true);

CREATE POLICY "Authenticated users can view payroll entries" ON public.hr_payroll_entries FOR SELECT USING (true);
CREATE POLICY "HR can manage payroll entries" ON public.hr_payroll_entries FOR ALL USING (true);

CREATE POLICY "Authenticated users can view onboarding tasks" ON public.hr_onboarding_tasks FOR SELECT USING (true);
CREATE POLICY "HR can manage onboarding tasks" ON public.hr_onboarding_tasks FOR ALL USING (true);

CREATE POLICY "Authenticated users can view performance reviews" ON public.hr_performance_reviews FOR SELECT USING (true);
CREATE POLICY "HR can manage performance reviews" ON public.hr_performance_reviews FOR ALL USING (true);

CREATE POLICY "Authenticated users can view OKRs" ON public.hr_okrs FOR SELECT USING (true);
CREATE POLICY "HR can manage OKRs" ON public.hr_okrs FOR ALL USING (true);

CREATE POLICY "Authenticated users can view training courses" ON public.hr_training_courses FOR SELECT USING (true);
CREATE POLICY "HR can manage training courses" ON public.hr_training_courses FOR ALL USING (true);

CREATE POLICY "Authenticated users can view employee training" ON public.hr_employee_training FOR SELECT USING (true);
CREATE POLICY "HR can manage employee training" ON public.hr_employee_training FOR ALL USING (true);

CREATE POLICY "Authenticated users can view benefits" ON public.hr_benefits FOR SELECT USING (true);
CREATE POLICY "HR can manage benefits" ON public.hr_benefits FOR ALL USING (true);

CREATE POLICY "Authenticated users can view employee benefits" ON public.hr_employee_benefits FOR SELECT USING (true);
CREATE POLICY "HR can manage employee benefits" ON public.hr_employee_benefits FOR ALL USING (true);

CREATE POLICY "Authenticated users can view employee documents" ON public.hr_employee_documents FOR SELECT USING (true);
CREATE POLICY "HR can manage employee documents" ON public.hr_employee_documents FOR ALL USING (true);

CREATE POLICY "Authenticated users can view HR settings" ON public.hr_settings FOR SELECT USING (true);
CREATE POLICY "HR can manage HR settings" ON public.hr_settings FOR ALL USING (true);

-- Insert default leave types
INSERT INTO public.hr_leave_types (name, description, days_allowed, is_paid) VALUES
('Annual Leave', 'Paid vacation leave', 21, true),
('Sick Leave', 'Medical leave', 14, true),
('Unpaid Leave', 'Leave without pay', 30, false),
('Maternity Leave', 'Maternity/paternity leave', 90, true),
('Bereavement', 'Compassionate leave', 5, true);

-- Insert default HR settings
INSERT INTO public.hr_settings (setting_key, setting_value, description) VALUES
('work_week', '{"days": ["monday", "tuesday", "wednesday", "thursday", "friday"], "hours_per_day": 8}', 'Standard work week configuration'),
('overtime_rules', '{"rate": 1.5, "max_hours_per_week": 10}', 'Overtime calculation rules'),
('probation_period', '{"months": 3}', 'Default probation period'),
('leave_year_start', '{"month": 1, "day": 1}', 'Leave year start date');
