
-- ChatFlow AI Platform Tables

-- Organizations table
CREATE TABLE public.cf_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  website VARCHAR(255),
  industry VARCHAR(100),
  size VARCHAR(50),
  settings JSONB DEFAULT '{}',
  billing_email VARCHAR(255),
  tax_id VARCHAR(100),
  address JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Organization members
CREATE TABLE public.cf_organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.cf_organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  permissions JSONB DEFAULT '{}',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  invited_by UUID REFERENCES auth.users(id),
  invitation_token VARCHAR(255),
  invitation_status VARCHAR(50) DEFAULT 'pending',
  UNIQUE(organization_id, user_id)
);

-- Chatbots table
CREATE TABLE public.cf_chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES public.cf_organizations(id) ON DELETE CASCADE,
  type VARCHAR(50) DEFAULT 'rule_based',
  status VARCHAR(50) DEFAULT 'draft',
  personality_settings JSONB DEFAULT '{}',
  config JSONB DEFAULT '{}',
  ai_model VARCHAR(100) DEFAULT 'gpt-3.5-turbo',
  knowledge_base JSONB DEFAULT '{}',
  training_data JSONB DEFAULT '{}',
  conversation_flow JSONB DEFAULT '{}',
  variables JSONB DEFAULT '{}',
  working_hours JSONB DEFAULT '{}',
  escalation_rules JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_trained_at TIMESTAMP WITH TIME ZONE,
  is_template BOOLEAN DEFAULT FALSE,
  template_category VARCHAR(100),
  version INTEGER DEFAULT 1,
  metadata JSONB DEFAULT '{}'
);

-- Chatbot integrations
CREATE TABLE public.cf_chatbot_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES public.cf_chatbots(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_id VARCHAR(255),
  platform_name VARCHAR(255),
  config JSONB DEFAULT '{}',
  credentials JSONB DEFAULT '{}',
  webhook_url TEXT,
  webhook_secret VARCHAR(255),
  status VARCHAR(50) DEFAULT 'inactive',
  last_synced TIMESTAMP WITH TIME ZONE,
  error_log TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(chatbot_id, platform)
);

-- Conversations
CREATE TABLE public.cf_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES public.cf_chatbots(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  platform_conversation_id VARCHAR(255),
  visitor_id VARCHAR(255),
  visitor_name VARCHAR(255),
  visitor_metadata JSONB DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'active',
  assigned_to UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  priority INTEGER DEFAULT 1,
  sentiment_score DECIMAL(3,2),
  summary TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE,
  resolution VARCHAR(50)
);

-- Messages
CREATE TABLE public.cf_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES public.cf_conversations(id) ON DELETE CASCADE,
  sender_type VARCHAR(50) NOT NULL,
  sender_id VARCHAR(255),
  message_type VARCHAR(50) DEFAULT 'text',
  content TEXT,
  attachments JSONB DEFAULT '[]',
  quick_replies JSONB DEFAULT '[]',
  buttons JSONB DEFAULT '[]',
  carousel JSONB DEFAULT '[]',
  read_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  direction VARCHAR(50) DEFAULT 'incoming',
  intent VARCHAR(255),
  confidence DECIMAL(3,2),
  sentiment DECIMAL(3,2),
  metadata JSONB DEFAULT '{}'
);

-- Knowledge base articles
CREATE TABLE public.cf_knowledge_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.cf_organizations(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  status VARCHAR(50) DEFAULT 'draft',
  author_id UUID REFERENCES auth.users(id),
  views INTEGER DEFAULT 0,
  helpful_votes INTEGER DEFAULT 0,
  unhelpful_votes INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Templates
CREATE TABLE public.cf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  use_case VARCHAR(255),
  content JSONB DEFAULT '{}',
  preview_image_url TEXT,
  demo_url TEXT,
  price DECIMAL(10,2) DEFAULT 0.00,
  currency VARCHAR(3) DEFAULT 'USD',
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Subscriptions
CREATE TABLE public.cf_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.cf_organizations(id) ON DELETE CASCADE,
  plan_id VARCHAR(255) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  interval VARCHAR(50) DEFAULT 'month',
  interval_count INTEGER DEFAULT 1,
  usage_limits JSONB DEFAULT '{}',
  features JSONB DEFAULT '{}',
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Invoices
CREATE TABLE public.cf_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.cf_organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.cf_subscriptions(id),
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  items JSONB DEFAULT '[]',
  stripe_invoice_id VARCHAR(255),
  payment_method VARCHAR(50),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Usage metrics
CREATE TABLE public.cf_usage_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.cf_organizations(id) ON DELETE CASCADE,
  chatbot_id UUID REFERENCES public.cf_chatbots(id),
  date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL,
  platform VARCHAR(50),
  count INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  response_time_avg DECIMAL(10,2),
  satisfaction_score DECIMAL(3,2),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, chatbot_id, date, metric_type, platform)
);

-- Audit logs for ChatFlow
CREATE TABLE public.cf_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.cf_organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id VARCHAR(255),
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.cf_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_chatbot_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_knowledge_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_usage_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cf_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their organizations" ON public.cf_organizations
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    id IN (SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create organizations" ON public.cf_organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update organizations" ON public.cf_organizations
  FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete organizations" ON public.cf_organizations
  FOR DELETE USING (owner_id = auth.uid());

-- RLS Policies for organization members
CREATE POLICY "Members can view org members" ON public.cf_organization_members
  FOR SELECT USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()) OR
    organization_id IN (SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Owners can manage members" ON public.cf_organization_members
  FOR ALL USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid())
  );

-- RLS Policies for chatbots
CREATE POLICY "Users can view org chatbots" ON public.cf_chatbots
  FOR SELECT USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()) OR
    organization_id IN (SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage org chatbots" ON public.cf_chatbots
  FOR ALL USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()) OR
    organization_id IN (SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- RLS Policies for integrations
CREATE POLICY "Users can view chatbot integrations" ON public.cf_chatbot_integrations
  FOR SELECT USING (
    chatbot_id IN (SELECT id FROM public.cf_chatbots WHERE organization_id IN (
      SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can manage chatbot integrations" ON public.cf_chatbot_integrations
  FOR ALL USING (
    chatbot_id IN (SELECT id FROM public.cf_chatbots WHERE organization_id IN (
      SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()
    ))
  );

-- RLS Policies for conversations
CREATE POLICY "Users can view org conversations" ON public.cf_conversations
  FOR SELECT USING (
    chatbot_id IN (SELECT id FROM public.cf_chatbots WHERE organization_id IN (
      SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Users can manage org conversations" ON public.cf_conversations
  FOR ALL USING (
    chatbot_id IN (SELECT id FROM public.cf_chatbots WHERE organization_id IN (
      SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()
      UNION
      SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid()
    ))
  );

-- RLS Policies for messages
CREATE POLICY "Users can view conversation messages" ON public.cf_messages
  FOR SELECT USING (
    conversation_id IN (SELECT id FROM public.cf_conversations WHERE chatbot_id IN (
      SELECT id FROM public.cf_chatbots WHERE organization_id IN (
        SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()
        UNION
        SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Users can manage messages" ON public.cf_messages
  FOR ALL USING (
    conversation_id IN (SELECT id FROM public.cf_conversations WHERE chatbot_id IN (
      SELECT id FROM public.cf_chatbots WHERE organization_id IN (
        SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()
        UNION
        SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid()
      )
    ))
  );

-- RLS Policies for knowledge articles
CREATE POLICY "Users can view org articles" ON public.cf_knowledge_articles
  FOR SELECT USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()) OR
    organization_id IN (SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage org articles" ON public.cf_knowledge_articles
  FOR ALL USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()) OR
    organization_id IN (SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner'))
  );

-- RLS Policies for templates (public read, restricted write)
CREATE POLICY "Anyone can view public templates" ON public.cf_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can manage own templates" ON public.cf_templates
  FOR ALL USING (created_by = auth.uid());

-- RLS Policies for subscriptions
CREATE POLICY "Users can view org subscriptions" ON public.cf_subscriptions
  FOR SELECT USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "Owners can manage subscriptions" ON public.cf_subscriptions
  FOR ALL USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid())
  );

-- RLS Policies for invoices
CREATE POLICY "Users can view org invoices" ON public.cf_invoices
  FOR SELECT USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "System can manage invoices" ON public.cf_invoices
  FOR ALL USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid())
  );

-- RLS Policies for usage metrics
CREATE POLICY "Users can view org usage" ON public.cf_usage_metrics
  FOR SELECT USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid()) OR
    organization_id IN (SELECT organization_id FROM public.cf_organization_members WHERE user_id = auth.uid())
  );

CREATE POLICY "System can manage usage" ON public.cf_usage_metrics
  FOR ALL USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid())
  );

-- RLS Policies for audit logs
CREATE POLICY "Users can view org audit logs" ON public.cf_audit_logs
  FOR SELECT USING (
    organization_id IN (SELECT id FROM public.cf_organizations WHERE owner_id = auth.uid())
  );

CREATE POLICY "System can create audit logs" ON public.cf_audit_logs
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_cf_chatbots_org ON public.cf_chatbots(organization_id);
CREATE INDEX idx_cf_chatbots_status ON public.cf_chatbots(status);
CREATE INDEX idx_cf_conversations_chatbot ON public.cf_conversations(chatbot_id);
CREATE INDEX idx_cf_conversations_status ON public.cf_conversations(status);
CREATE INDEX idx_cf_messages_conversation ON public.cf_messages(conversation_id);
CREATE INDEX idx_cf_messages_sent_at ON public.cf_messages(sent_at);
CREATE INDEX idx_cf_usage_metrics_date ON public.cf_usage_metrics(date);

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.cf_conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.cf_messages;
