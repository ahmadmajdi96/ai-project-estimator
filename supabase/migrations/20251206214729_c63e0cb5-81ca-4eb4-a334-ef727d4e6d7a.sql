-- Customer Portal Tables

-- Portal Users (separate from main users for customer self-service)
CREATE TABLE public.portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  google_id VARCHAR(255) UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  company_size VARCHAR(50),
  industry VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{"notifications": true, "theme": "light", "email_updates": true}'
);

CREATE INDEX idx_portal_users_email ON portal_users(email);
CREATE INDEX idx_portal_users_google_id ON portal_users(google_id);
CREATE INDEX idx_portal_users_company ON portal_users(company_name);
CREATE INDEX idx_portal_users_auth ON portal_users(auth_user_id);

-- Customer Chatbots (chatbots rented by customers)
CREATE TABLE public.customer_chatbots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  chatbot_id VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'rule_based',
  status VARCHAR(50) DEFAULT 'active',
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE,
  renewal_date TIMESTAMP WITH TIME ZONE,
  subscription_tier VARCHAR(50),
  max_messages_per_month INTEGER DEFAULT 1000,
  used_messages INTEGER DEFAULT 0,
  platform_integrations TEXT[] DEFAULT '{}',
  webhook_url TEXT,
  webhook_secret VARCHAR(255),
  custom_domain VARCHAR(255),
  brand_color VARCHAR(7) DEFAULT '#3B82F6',
  logo_url TEXT,
  welcome_message TEXT DEFAULT 'Hello! How can I help you today?',
  fallback_message TEXT DEFAULT 'I apologize, but I don''t have an answer for that. Could you please rephrase your question?',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  UNIQUE(customer_id, chatbot_id)
);

CREATE INDEX idx_customer_chatbots_customer ON customer_chatbots(customer_id);
CREATE INDEX idx_customer_chatbots_status ON customer_chatbots(status);
CREATE INDEX idx_customer_chatbots_expiry ON customer_chatbots(expiry_date);

-- Answer Rules
CREATE TABLE public.answer_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES customer_chatbots(id) ON DELETE CASCADE,
  rule_name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) DEFAULT 'exact_match',
  priority INTEGER DEFAULT 1,
  keywords TEXT[] DEFAULT '{}',
  patterns TEXT[] DEFAULT '{}',
  exact_phrases TEXT[] DEFAULT '{}',
  intent VARCHAR(255),
  entities JSONB DEFAULT '{}',
  response_type VARCHAR(50) DEFAULT 'text',
  response_text TEXT,
  response_buttons JSONB DEFAULT '[]',
  response_cards JSONB DEFAULT '[]',
  response_quick_replies JSONB DEFAULT '[]',
  response_media JSONB DEFAULT '[]',
  next_step VARCHAR(100),
  conditions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  match_count INTEGER DEFAULT 0,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES portal_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_answer_rules_chatbot ON answer_rules(chatbot_id);
CREATE INDEX idx_answer_rules_priority ON answer_rules(priority);
CREATE INDEX idx_answer_rules_active ON answer_rules(is_active);
CREATE INDEX idx_answer_rules_intent ON answer_rules(intent);

-- Knowledge Base Entries
CREATE TABLE public.knowledge_base_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES customer_chatbots(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  category VARCHAR(100),
  subcategory VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  source_type VARCHAR(50) DEFAULT 'manual',
  source_url TEXT,
  source_file TEXT,
  confidence_score DECIMAL(3,2) DEFAULT 1.0,
  status VARCHAR(50) DEFAULT 'active',
  views INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  unhelpful_count INTEGER DEFAULT 0,
  version INTEGER DEFAULT 1,
  previous_version_id UUID REFERENCES knowledge_base_entries(id),
  created_by UUID REFERENCES portal_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_kb_entries_chatbot ON knowledge_base_entries(chatbot_id);
CREATE INDEX idx_kb_entries_category ON knowledge_base_entries(category);
CREATE INDEX idx_kb_entries_tags ON knowledge_base_entries USING gin(tags);
CREATE INDEX idx_kb_entries_keywords ON knowledge_base_entries USING gin(keywords);
CREATE INDEX idx_kb_entries_status ON knowledge_base_entries(status);

-- Training Questions
CREATE TABLE public.training_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  knowledge_base_id UUID REFERENCES knowledge_base_entries(id) ON DELETE CASCADE,
  chatbot_id UUID REFERENCES customer_chatbots(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  variations TEXT[] DEFAULT '{}',
  answer TEXT NOT NULL,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.7,
  training_status VARCHAR(50) DEFAULT 'pending',
  trained_at TIMESTAMP WITH TIME ZONE,
  match_count INTEGER DEFAULT 0,
  last_used TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES portal_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_training_questions_kb ON training_questions(knowledge_base_id);
CREATE INDEX idx_training_questions_chatbot ON training_questions(chatbot_id);
CREATE INDEX idx_training_questions_status ON training_questions(training_status);

-- Chatbot Analytics
CREATE TABLE public.chatbot_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id UUID REFERENCES customer_chatbots(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_conversations INTEGER DEFAULT 0,
  total_messages INTEGER DEFAULT 0,
  unique_users INTEGER DEFAULT 0,
  active_users INTEGER DEFAULT 0,
  avg_response_time DECIMAL(10,2),
  satisfaction_score DECIMAL(3,2),
  rule_triggers JSONB DEFAULT '{}',
  top_intents JSONB DEFAULT '[]',
  failed_queries TEXT[] DEFAULT '{}',
  platform_breakdown JSONB DEFAULT '{}',
  peak_hours JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(chatbot_id, date)
);

CREATE INDEX idx_chatbot_analytics_chatbot ON chatbot_analytics(chatbot_id);
CREATE INDEX idx_chatbot_analytics_date ON chatbot_analytics(date);

-- Customer Activity Logs
CREATE TABLE public.customer_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  chatbot_id UUID REFERENCES customer_chatbots(id) ON DELETE SET NULL,
  activity_type VARCHAR(100) NOT NULL,
  activity_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_activity_logs_customer ON customer_activity_logs(customer_id);
CREATE INDEX idx_activity_logs_type ON customer_activity_logs(activity_type);
CREATE INDEX idx_activity_logs_created ON customer_activity_logs(created_at);

-- Import Jobs
CREATE TABLE public.import_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  chatbot_id UUID REFERENCES customer_chatbots(id) ON DELETE CASCADE,
  job_type VARCHAR(50) NOT NULL,
  source_type VARCHAR(50) NOT NULL,
  source_url TEXT,
  source_file TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  progress INTEGER DEFAULT 0,
  total_items INTEGER,
  processed_items INTEGER DEFAULT 0,
  success_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  error_log TEXT,
  result JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_import_jobs_customer ON import_jobs(customer_id);
CREATE INDEX idx_import_jobs_status ON import_jobs(status);
CREATE INDEX idx_import_jobs_type ON import_jobs(job_type);

-- Enable RLS
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portal_users
CREATE POLICY "Users can view own profile" ON portal_users FOR SELECT USING (auth_user_id = auth.uid());
CREATE POLICY "Users can update own profile" ON portal_users FOR UPDATE USING (auth_user_id = auth.uid());
CREATE POLICY "Users can insert own profile" ON portal_users FOR INSERT WITH CHECK (auth_user_id = auth.uid());

-- RLS Policies for customer_chatbots
CREATE POLICY "Users can view own chatbots" ON customer_chatbots FOR SELECT 
  USING (customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can manage own chatbots" ON customer_chatbots FOR ALL 
  USING (customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for answer_rules
CREATE POLICY "Users can view own rules" ON answer_rules FOR SELECT 
  USING (chatbot_id IN (SELECT id FROM customer_chatbots WHERE customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid())));
CREATE POLICY "Users can manage own rules" ON answer_rules FOR ALL 
  USING (chatbot_id IN (SELECT id FROM customer_chatbots WHERE customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid())));

-- RLS Policies for knowledge_base_entries
CREATE POLICY "Users can view own kb entries" ON knowledge_base_entries FOR SELECT 
  USING (chatbot_id IN (SELECT id FROM customer_chatbots WHERE customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid())));
CREATE POLICY "Users can manage own kb entries" ON knowledge_base_entries FOR ALL 
  USING (chatbot_id IN (SELECT id FROM customer_chatbots WHERE customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid())));

-- RLS Policies for training_questions
CREATE POLICY "Users can view own training questions" ON training_questions FOR SELECT 
  USING (chatbot_id IN (SELECT id FROM customer_chatbots WHERE customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid())));
CREATE POLICY "Users can manage own training questions" ON training_questions FOR ALL 
  USING (chatbot_id IN (SELECT id FROM customer_chatbots WHERE customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid())));

-- RLS Policies for chatbot_analytics
CREATE POLICY "Users can view own analytics" ON chatbot_analytics FOR SELECT 
  USING (chatbot_id IN (SELECT id FROM customer_chatbots WHERE customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid())));

-- RLS Policies for customer_activity_logs
CREATE POLICY "Users can view own activity" ON customer_activity_logs FOR SELECT 
  USING (customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can create activity logs" ON customer_activity_logs FOR INSERT 
  WITH CHECK (customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid()));

-- RLS Policies for import_jobs
CREATE POLICY "Users can view own import jobs" ON import_jobs FOR SELECT 
  USING (customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid()));
CREATE POLICY "Users can manage own import jobs" ON import_jobs FOR ALL 
  USING (customer_id IN (SELECT id FROM portal_users WHERE auth_user_id = auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_portal_users_updated_at BEFORE UPDATE ON portal_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customer_chatbots_updated_at BEFORE UPDATE ON customer_chatbots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answer_rules_updated_at BEFORE UPDATE ON answer_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_knowledge_base_entries_updated_at BEFORE UPDATE ON knowledge_base_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_training_questions_updated_at BEFORE UPDATE ON training_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_import_jobs_updated_at BEFORE UPDATE ON import_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();