-- Create opportunity_stages table
CREATE TABLE IF NOT EXISTS public.opportunity_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create task_stages table
CREATE TABLE IF NOT EXISTS public.task_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create support_stages table
CREATE TABLE IF NOT EXISTS public.support_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  value TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create support_agents table
CREATE TABLE IF NOT EXISTS public.support_agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active',
  specialization TEXT,
  max_tickets INTEGER DEFAULT 10,
  current_tickets INTEGER DEFAULT 0,
  performance_score NUMERIC(5,2) DEFAULT 0,
  total_resolved INTEGER DEFAULT 0,
  avg_resolution_time NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add support_agent_id to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS support_agent_id UUID REFERENCES public.support_agents(id);

-- Add support_stage to support_tickets
ALTER TABLE public.support_tickets 
ADD COLUMN IF NOT EXISTS support_stage TEXT DEFAULT 'new';

-- Enable RLS
ALTER TABLE public.opportunity_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_agents ENABLE ROW LEVEL SECURITY;

-- Create policies for all tables
CREATE POLICY "Allow all access to opportunity_stages" ON public.opportunity_stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to task_stages" ON public.task_stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to support_stages" ON public.support_stages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to support_agents" ON public.support_agents FOR ALL USING (true) WITH CHECK (true);

-- Seed default opportunity stages
INSERT INTO public.opportunity_stages (name, value, color, sort_order) VALUES
  ('Lead', 'lead', '#64748b', 0),
  ('Qualified', 'qualified', '#3b82f6', 1),
  ('Proposal', 'proposal', '#8b5cf6', 2),
  ('Negotiation', 'negotiation', '#f59e0b', 3),
  ('Closed Won', 'closed_won', '#22c55e', 4),
  ('Closed Lost', 'closed_lost', '#ef4444', 5)
ON CONFLICT (value) DO NOTHING;

-- Seed default task stages
INSERT INTO public.task_stages (name, value, color, sort_order) VALUES
  ('To Do', 'todo', '#64748b', 0),
  ('In Progress', 'in_progress', '#3b82f6', 1),
  ('Review', 'review', '#f59e0b', 2),
  ('Done', 'done', '#22c55e', 3)
ON CONFLICT (value) DO NOTHING;

-- Seed default support stages
INSERT INTO public.support_stages (name, value, color, sort_order) VALUES
  ('New', 'new', '#64748b', 0),
  ('Assigned', 'assigned', '#3b82f6', 1),
  ('In Progress', 'in_progress', '#8b5cf6', 2),
  ('Pending Customer', 'pending_customer', '#f59e0b', 3),
  ('Resolved', 'resolved', '#22c55e', 4),
  ('Closed', 'closed', '#6b7280', 5)
ON CONFLICT (value) DO NOTHING;