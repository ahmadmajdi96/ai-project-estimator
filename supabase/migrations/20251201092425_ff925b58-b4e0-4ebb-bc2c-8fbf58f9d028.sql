-- Create debit pipeline stages table
CREATE TABLE public.debit_pipeline_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create debit collectors table (similar to salesmen)
CREATE TABLE public.debit_collectors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  hire_date DATE,
  target_amount NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active',
  avatar_url TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create debit cases table (similar to opportunities)
CREATE TABLE public.debit_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  collector_id UUID REFERENCES public.debit_collectors(id) ON DELETE SET NULL,
  original_amount NUMERIC DEFAULT 0,
  current_amount NUMERIC DEFAULT 0,
  collected_amount NUMERIC DEFAULT 0,
  stage TEXT DEFAULT 'new',
  priority TEXT DEFAULT 'medium',
  due_date DATE,
  last_contact_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'open',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.debit_pipeline_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debit_cases ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow all access to debit_pipeline_stages" ON public.debit_pipeline_stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to debit_collectors" ON public.debit_collectors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to debit_cases" ON public.debit_cases FOR ALL USING (true) WITH CHECK (true);

-- Seed default debit pipeline stages
INSERT INTO public.debit_pipeline_stages (name, value, color, sort_order) VALUES
  ('New', 'new', '#6b7280', 0),
  ('Contacted', 'contacted', '#3b82f6', 1),
  ('Negotiating', 'negotiating', '#f59e0b', 2),
  ('Payment Plan', 'payment_plan', '#8b5cf6', 3),
  ('Collecting', 'collecting', '#10b981', 4),
  ('Collected', 'collected', '#22c55e', 5),
  ('Written Off', 'written_off', '#ef4444', 6);