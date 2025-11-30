-- AI Agent Configuration table
CREATE TABLE public.ai_agent_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Default Agent',
  system_prompt text,
  personality text,
  rules jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.ai_agent_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view AI config" ON public.ai_agent_config FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage AI config" ON public.ai_agent_config FOR ALL USING (
  has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role)
);

-- Company Rules and Policies table
CREATE TABLE public.company_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  content text NOT NULL,
  is_active boolean DEFAULT true,
  effective_date date DEFAULT CURRENT_DATE,
  created_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.company_policies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view policies" ON public.company_policies FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage policies" ON public.company_policies FOR ALL USING (
  has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role)
);

-- Audit/Traceability enhancement - add more columns if needed
ALTER TABLE public.audit_logs ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Trigger for updated_at
CREATE TRIGGER update_ai_agent_config_updated_at
  BEFORE UPDATE ON public.ai_agent_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_company_policies_updated_at
  BEFORE UPDATE ON public.company_policies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();