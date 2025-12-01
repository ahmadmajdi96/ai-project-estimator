
-- =============================================
-- PHASE 1: Sales Process & Pipeline Enhancement
-- =============================================

-- Lead sources enum
CREATE TYPE public.lead_source AS ENUM (
  'marketing_campaign', 'referral', 'inbound', 'outbound', 'trade_show', 
  'website', 'social_media', 'partner', 'other'
);

-- Win/Loss reasons table
CREATE TABLE public.win_loss_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason_type TEXT NOT NULL CHECK (reason_type IN ('win', 'loss')),
  reason TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunities table (enhanced sales pipeline)
CREATE TABLE public.opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  value NUMERIC DEFAULT 0,
  deal_probability INTEGER DEFAULT 0 CHECK (deal_probability >= 0 AND deal_probability <= 100),
  lead_source lead_source DEFAULT 'other',
  sales_stage TEXT DEFAULT 'lead',
  salesman_id UUID REFERENCES public.salesmen(id),
  expected_close_date DATE,
  actual_close_date DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'on_hold')),
  win_loss_reason_id UUID REFERENCES public.win_loss_reasons(id),
  win_loss_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Opportunity stages history (track time in each stage) - duration calculated in app
CREATE TABLE public.opportunity_stages_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE NOT NULL,
  stage TEXT NOT NULL,
  entered_at TIMESTAMPTZ DEFAULT now(),
  exited_at TIMESTAMPTZ,
  duration_hours NUMERIC
);

-- =============================================
-- PHASE 2: Client Engagement & Communication
-- =============================================

-- Communication type enum
CREATE TYPE public.communication_type AS ENUM (
  'call', 'email', 'meeting', 'video_call', 'sms', 'chat', 'letter'
);

-- Enhanced client communications
CREATE TABLE public.client_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  communication_type communication_type NOT NULL,
  subject TEXT,
  content TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  direction TEXT CHECK (direction IN ('inbound', 'outbound')),
  contact_person TEXT,
  salesman_id UUID REFERENCES public.salesmen(id),
  duration_minutes INTEGER,
  attachments JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  communication_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_customer', 'resolved', 'closed')),
  category TEXT,
  assigned_to UUID REFERENCES public.employees(id),
  resolution TEXT,
  resolution_time_hours NUMERIC,
  satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
  satisfaction_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Client segmentation tags
CREATE TABLE public.client_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3b82f6',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Client-tag junction
CREATE TABLE public.client_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES public.client_tags(id) ON DELETE CASCADE NOT NULL,
  assigned_by UUID,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, tag_id)
);

-- =============================================
-- PHASE 3: Products & Contract Management
-- =============================================

-- Products/Services catalog
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT CHECK (type IN ('product', 'service', 'subscription')),
  base_price NUMERIC DEFAULT 0,
  cost NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  features JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Client products (what each client purchased)
CREATE TABLE public.client_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC NOT NULL,
  total_price NUMERIC NOT NULL,
  discount_percent NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Feature usage tracking
CREATE TABLE public.feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_product_id UUID REFERENCES public.client_products(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  usage_data JSONB DEFAULT '{}',
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contract amendments
CREATE TABLE public.contract_amendments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  amendment_type TEXT CHECK (amendment_type IN ('scope_change', 'value_change', 'term_extension', 'term_reduction', 'cancellation', 'other')),
  description TEXT NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC,
  previous_end_date DATE,
  new_end_date DATE,
  effective_date DATE,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SLA tracking
CREATE TABLE public.sla_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  metric_type TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  unit TEXT,
  measurement_period TEXT CHECK (measurement_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SLA performance records
CREATE TABLE public.sla_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sla_id UUID REFERENCES public.sla_agreements(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  actual_value NUMERIC NOT NULL,
  target_met BOOLEAN,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 4: Competitive Intelligence
-- =============================================

-- Competitors
CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  website TEXT,
  description TEXT,
  strengths TEXT[],
  weaknesses TEXT[],
  market_position TEXT,
  pricing_info TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Competitor analysis per opportunity
CREATE TABLE public.competitor_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES public.competitors(id) NOT NULL,
  threat_level TEXT CHECK (threat_level IN ('low', 'medium', 'high')),
  competitor_price NUMERIC,
  competitor_strengths TEXT,
  competitor_weaknesses TEXT,
  our_advantages TEXT,
  strategy_notes TEXT,
  outcome TEXT CHECK (outcome IN ('won', 'lost', 'pending')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 5: Financial Integration
-- =============================================

-- Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id),
  amount NUMERIC NOT NULL,
  tax_amount NUMERIC DEFAULT 0,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded')),
  issue_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  notes TEXT,
  line_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Payments
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.invoices(id),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL,
  payment_method TEXT,
  payment_date DATE DEFAULT CURRENT_DATE,
  reference_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Project costs
CREATE TABLE public.project_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  opportunity_id UUID REFERENCES public.opportunities(id),
  cost_type TEXT CHECK (cost_type IN ('labor', 'materials', 'software', 'travel', 'subcontractor', 'overhead', 'other')),
  description TEXT NOT NULL,
  estimated_cost NUMERIC DEFAULT 0,
  actual_cost NUMERIC DEFAULT 0,
  incurred_date DATE,
  employee_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Revenue recognition schedule
CREATE TABLE public.revenue_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  client_product_id UUID REFERENCES public.client_products(id),
  recognition_date DATE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'recognized', 'deferred')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 6: Employee Performance & Capacity
-- =============================================

-- Employee certifications
CREATE TABLE public.employee_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  certification_name TEXT NOT NULL,
  issuing_organization TEXT,
  issue_date DATE,
  expiry_date DATE,
  credential_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Project assignments
CREATE TABLE public.project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES public.clients(id),
  opportunity_id UUID REFERENCES public.opportunities(id),
  role TEXT,
  allocation_percent INTEGER DEFAULT 100 CHECK (allocation_percent > 0 AND allocation_percent <= 100),
  start_date DATE,
  end_date DATE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policy compliance tracking
CREATE TABLE public.policy_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE NOT NULL,
  policy_id UUID REFERENCES public.company_policies(id) ON DELETE CASCADE NOT NULL,
  compliance_status TEXT DEFAULT 'compliant' CHECK (compliance_status IN ('compliant', 'non_compliant', 'pending_review', 'exempt')),
  last_review_date DATE,
  next_review_date DATE,
  notes TEXT,
  reviewed_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- PHASE 7: Marketing & Campaigns
-- =============================================

-- Marketing campaigns
CREATE TABLE public.marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'social_media', 'webinar', 'trade_show', 'content', 'paid_ads', 'other')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'active', 'paused', 'completed')),
  start_date DATE,
  end_date DATE,
  budget NUMERIC DEFAULT 0,
  actual_spend NUMERIC DEFAULT 0,
  target_audience TEXT,
  goals JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Marketing interactions
CREATE TABLE public.marketing_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  campaign_id UUID REFERENCES public.marketing_campaigns(id),
  interaction_type TEXT CHECK (interaction_type IN ('email_open', 'email_click', 'website_visit', 'content_download', 'webinar_registration', 'webinar_attendance', 'form_submission', 'ad_click')),
  content_name TEXT,
  content_url TEXT,
  interaction_data JSONB DEFAULT '{}',
  interaction_date TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ENHANCE EXISTING TABLES
-- =============================================

-- Add columns to clients table
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS lead_source lead_source,
ADD COLUMN IF NOT EXISTS deal_probability INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS loss_reason TEXT,
ADD COLUMN IF NOT EXISTS last_communication_type communication_type,
ADD COLUMN IF NOT EXISTS lifetime_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS acquisition_cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100);

-- Add columns to tasks for dependencies
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS blocked_by UUID[],
ADD COLUMN IF NOT EXISTS blocks UUID[];

-- =============================================
-- ENABLE RLS ON ALL NEW TABLES
-- =============================================

ALTER TABLE public.win_loss_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.opportunity_stages_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_communications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sla_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_costs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policy_compliance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.marketing_interactions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES
-- =============================================

-- Win/Loss Reasons
CREATE POLICY "Anyone can view win_loss_reasons" ON public.win_loss_reasons FOR SELECT USING (true);
CREATE POLICY "Authorized can manage win_loss_reasons" ON public.win_loss_reasons FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Opportunities
CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Anyone can insert opportunities" ON public.opportunities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update opportunities" ON public.opportunities FOR UPDATE USING (true);
CREATE POLICY "Authorized can delete opportunities" ON public.opportunities FOR DELETE USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Opportunity Stages History
CREATE POLICY "Anyone can view opp_stages_history" ON public.opportunity_stages_history FOR SELECT USING (true);
CREATE POLICY "Anyone can insert opp_stages_history" ON public.opportunity_stages_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update opp_stages_history" ON public.opportunity_stages_history FOR UPDATE USING (true);

-- Client Communications
CREATE POLICY "Anyone can view client_communications" ON public.client_communications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client_communications" ON public.client_communications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update client_communications" ON public.client_communications FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete client_communications" ON public.client_communications FOR DELETE USING (true);

-- Support Tickets
CREATE POLICY "Anyone can view support_tickets" ON public.support_tickets FOR SELECT USING (true);
CREATE POLICY "Anyone can insert support_tickets" ON public.support_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update support_tickets" ON public.support_tickets FOR UPDATE USING (true);
CREATE POLICY "Authorized can delete support_tickets" ON public.support_tickets FOR DELETE USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Client Tags
CREATE POLICY "Anyone can view client_tags" ON public.client_tags FOR SELECT USING (true);
CREATE POLICY "Anyone can manage client_tags" ON public.client_tags FOR ALL USING (true);

-- Client Tag Assignments
CREATE POLICY "Anyone can view client_tag_assignments" ON public.client_tag_assignments FOR SELECT USING (true);
CREATE POLICY "Anyone can manage client_tag_assignments" ON public.client_tag_assignments FOR ALL USING (true);

-- Products
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Authorized can manage products" ON public.products FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Client Products
CREATE POLICY "Anyone can view client_products" ON public.client_products FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client_products" ON public.client_products FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update client_products" ON public.client_products FOR UPDATE USING (true);

-- Feature Usage
CREATE POLICY "Anyone can view feature_usage" ON public.feature_usage FOR SELECT USING (true);
CREATE POLICY "Anyone can manage feature_usage" ON public.feature_usage FOR ALL USING (true);

-- Contract Amendments
CREATE POLICY "Anyone can view contract_amendments" ON public.contract_amendments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert contract_amendments" ON public.contract_amendments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized can manage contract_amendments" ON public.contract_amendments FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- SLA Agreements
CREATE POLICY "Anyone can view sla_agreements" ON public.sla_agreements FOR SELECT USING (true);
CREATE POLICY "Authorized can manage sla_agreements" ON public.sla_agreements FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- SLA Performance
CREATE POLICY "Anyone can view sla_performance" ON public.sla_performance FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sla_performance" ON public.sla_performance FOR INSERT WITH CHECK (true);

-- Competitors
CREATE POLICY "Anyone can view competitors" ON public.competitors FOR SELECT USING (true);
CREATE POLICY "Authorized can manage competitors" ON public.competitors FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Competitor Analysis
CREATE POLICY "Anyone can view competitor_analysis" ON public.competitor_analysis FOR SELECT USING (true);
CREATE POLICY "Anyone can manage competitor_analysis" ON public.competitor_analysis FOR ALL USING (true);

-- Invoices
CREATE POLICY "Anyone can view invoices" ON public.invoices FOR SELECT USING (true);
CREATE POLICY "Anyone can insert invoices" ON public.invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update invoices" ON public.invoices FOR UPDATE USING (true);
CREATE POLICY "Authorized can delete invoices" ON public.invoices FOR DELETE USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Payments
CREATE POLICY "Anyone can view payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Authorized can manage payments" ON public.payments FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Project Costs
CREATE POLICY "Anyone can view project_costs" ON public.project_costs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert project_costs" ON public.project_costs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update project_costs" ON public.project_costs FOR UPDATE USING (true);

-- Revenue Schedule
CREATE POLICY "Anyone can view revenue_schedule" ON public.revenue_schedule FOR SELECT USING (true);
CREATE POLICY "Authorized can manage revenue_schedule" ON public.revenue_schedule FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Employee Certifications
CREATE POLICY "Anyone can view employee_certifications" ON public.employee_certifications FOR SELECT USING (true);
CREATE POLICY "Anyone can manage employee_certifications" ON public.employee_certifications FOR ALL USING (true);

-- Project Assignments
CREATE POLICY "Anyone can view project_assignments" ON public.project_assignments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert project_assignments" ON public.project_assignments FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update project_assignments" ON public.project_assignments FOR UPDATE USING (true);
CREATE POLICY "Authorized can delete project_assignments" ON public.project_assignments FOR DELETE USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Policy Compliance
CREATE POLICY "Anyone can view policy_compliance" ON public.policy_compliance FOR SELECT USING (true);
CREATE POLICY "Authorized can manage policy_compliance" ON public.policy_compliance FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Marketing Campaigns
CREATE POLICY "Anyone can view marketing_campaigns" ON public.marketing_campaigns FOR SELECT USING (true);
CREATE POLICY "Authorized can manage marketing_campaigns" ON public.marketing_campaigns FOR ALL USING (has_role(auth.uid(), 'ceo') OR has_role(auth.uid(), 'department_head'));

-- Marketing Interactions
CREATE POLICY "Anyone can view marketing_interactions" ON public.marketing_interactions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert marketing_interactions" ON public.marketing_interactions FOR INSERT WITH CHECK (true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_opportunities_client ON public.opportunities(client_id);
CREATE INDEX idx_opportunities_salesman ON public.opportunities(salesman_id);
CREATE INDEX idx_opportunities_status ON public.opportunities(status);
CREATE INDEX idx_client_communications_client ON public.client_communications(client_id);
CREATE INDEX idx_client_communications_date ON public.client_communications(communication_date);
CREATE INDEX idx_support_tickets_client ON public.support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_client_products_client ON public.client_products(client_id);
CREATE INDEX idx_invoices_client ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_project_assignments_employee ON public.project_assignments(employee_id);
CREATE INDEX idx_marketing_interactions_client ON public.marketing_interactions(client_id);

-- =============================================
-- DEFAULT WIN/LOSS REASONS
-- =============================================

INSERT INTO public.win_loss_reasons (reason_type, reason, description) VALUES
('win', 'Better Price', 'Our pricing was more competitive'),
('win', 'Superior Features', 'Our product/service had better features'),
('win', 'Existing Relationship', 'Strong existing relationship with client'),
('win', 'Better Support', 'Our support services were more comprehensive'),
('win', 'Technical Fit', 'Our solution was a better technical fit'),
('loss', 'Price Too High', 'Client chose a cheaper alternative'),
('loss', 'Missing Features', 'Competitor had features we lacked'),
('loss', 'Lost to Competitor', 'Client chose a specific competitor'),
('loss', 'Budget Constraints', 'Client could not afford the solution'),
('loss', 'No Decision', 'Client decided not to proceed with any vendor'),
('loss', 'Timeline Issues', 'Could not meet client timeline requirements');

-- =============================================
-- DEFAULT CLIENT TAGS
-- =============================================

INSERT INTO public.client_tags (name, color, description) VALUES
('High Growth Potential', '#22c55e', 'Client with significant growth opportunity'),
('Strategic Partner', '#8b5cf6', 'Key strategic partnership'),
('At-Risk', '#ef4444', 'Client showing signs of churn risk'),
('Early Adopter', '#3b82f6', 'Client who adopts new features early'),
('Enterprise', '#f59e0b', 'Large enterprise client'),
('SMB', '#06b6d4', 'Small/Medium business client'),
('VIP', '#ec4899', 'Very important client requiring special attention');
