-- CortaCentral / CX Orchestrator - Separate Database Schema
-- All tables prefixed with cxo_ to keep isolated from main CRM

-- Enum types for CXO
CREATE TYPE cxo_user_role AS ENUM ('agent', 'supervisor', 'admin', 'billing_owner');
CREATE TYPE cxo_user_status AS ENUM ('active', 'invited', 'disabled');
CREATE TYPE cxo_tenant_status AS ENUM ('active', 'suspended', 'closed');
CREATE TYPE cxo_connector_type AS ENUM ('ringcentral', 'twilio', 'zoom_phone', 'ms_teams_phone', 'generic_voice', 'sms_provider', 'whatsapp_provider', 'email_provider', 'webchat_provider');
CREATE TYPE cxo_health_status AS ENUM ('healthy', 'degraded', 'down', 'unknown');
CREATE TYPE cxo_channel_type AS ENUM ('voice', 'sms', 'whatsapp', 'email', 'webchat', 'other');
CREATE TYPE cxo_conversation_status AS ENUM ('open', 'pending', 'resolved', 'closed');
CREATE TYPE cxo_priority AS ENUM ('low', 'normal', 'high', 'urgent');
CREATE TYPE cxo_routing_strategy AS ENUM ('round_robin', 'least_busy', 'skill_based');
CREATE TYPE cxo_workflow_trigger AS ENUM ('inbound_voice', 'inbound_sms', 'inbound_email', 'inbound_webchat', 'outbound_event', 'scheduled');
CREATE TYPE cxo_workflow_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE cxo_event_type AS ENUM ('voice_call_started', 'voice_call_ended', 'voice_recording_available', 'sms_inbound', 'sms_outbound', 'email_inbound', 'email_outbound', 'chat_message_inbound', 'chat_message_outbound', 'note_added', 'status_changed', 'tag_added', 'ai_summary_ready', 'ai_sentiment_analysis');
CREATE TYPE cxo_ai_job_type AS ENUM ('summary', 'sentiment', 'suggestion', 'classification', 'translation');
CREATE TYPE cxo_ai_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE cxo_ticket_type AS ENUM ('bug', 'incident', 'billing_question', 'feature_request');
CREATE TYPE cxo_ticket_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE cxo_ticket_status AS ENUM ('open', 'investigating', 'waiting_for_customer', 'resolved', 'closed');
CREATE TYPE cxo_health_check_type AS ENUM ('api_ping', 'test_sms', 'test_call_metadata', 'webhook_latency');
CREATE TYPE cxo_check_status AS ENUM ('success', 'failure');

-- Tenants table
CREATE TABLE cxo_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  primary_region TEXT DEFAULT 'us-east-1',
  plan TEXT DEFAULT 'starter',
  status cxo_tenant_status DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Users table (CXO specific, not auth.users)
CREATE TABLE cxo_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role cxo_user_role DEFAULT 'agent',
  status cxo_user_status DEFAULT 'active',
  timezone TEXT DEFAULT 'UTC',
  language TEXT DEFAULT 'en',
  avatar_url TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, email)
);

-- Connectors table
CREATE TABLE cxo_connectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  type cxo_connector_type NOT NULL,
  display_name TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  health_status cxo_health_status DEFAULT 'unknown',
  last_health_check_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts table
CREATE TABLE cxo_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  external_id TEXT,
  first_name TEXT,
  last_name TEXT,
  primary_phone TEXT,
  primary_email TEXT,
  channels JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  attributes JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Queues table
CREATE TABLE cxo_queues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  channel_types cxo_channel_type[] DEFAULT '{voice}',
  skills_required TEXT[] DEFAULT '{}',
  routing_strategy cxo_routing_strategy DEFAULT 'round_robin',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversations table
CREATE TABLE cxo_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES cxo_contacts(id),
  external_reference TEXT,
  primary_channel cxo_channel_type DEFAULT 'voice',
  status cxo_conversation_status DEFAULT 'open',
  priority cxo_priority DEFAULT 'normal',
  assigned_queue_id UUID REFERENCES cxo_queues(id),
  assigned_agent_id UUID REFERENCES cxo_users(id),
  started_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Conversation Events table
CREATE TABLE cxo_conversation_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES cxo_conversations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  type cxo_event_type NOT NULL,
  provider_type cxo_connector_type,
  provider_event_id TEXT,
  timestamp TIMESTAMPTZ DEFAULT now(),
  payload JSONB DEFAULT '{}',
  created_by_user_id UUID REFERENCES cxo_users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Workflows table
CREATE TABLE cxo_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type cxo_workflow_trigger NOT NULL,
  current_version_id UUID,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Workflow Versions table
CREATE TABLE cxo_workflow_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES cxo_workflows(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  version_number INTEGER DEFAULT 1,
  definition JSONB DEFAULT '{"nodes":[],"edges":[]}',
  status cxo_workflow_status DEFAULT 'draft',
  created_by_user_id UUID REFERENCES cxo_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  published_at TIMESTAMPTZ
);

-- Provider Health Checks table
CREATE TABLE cxo_provider_health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  connector_id UUID NOT NULL REFERENCES cxo_connectors(id) ON DELETE CASCADE,
  type cxo_health_check_type NOT NULL,
  status cxo_check_status NOT NULL,
  latency_ms INTEGER,
  error_code TEXT,
  error_message TEXT,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- AI Jobs table
CREATE TABLE cxo_ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES cxo_conversations(id),
  job_type cxo_ai_job_type NOT NULL,
  status cxo_ai_job_status DEFAULT 'pending',
  input_reference JSONB DEFAULT '{}',
  output JSONB,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Support Tickets table
CREATE TABLE cxo_support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES cxo_users(id),
  type cxo_ticket_type NOT NULL,
  severity cxo_ticket_severity DEFAULT 'medium',
  status cxo_ticket_status DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT,
  related_conversation_id UUID REFERENCES cxo_conversations(id),
  related_connector_id UUID REFERENCES cxo_connectors(id),
  diagnostic_bundle_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Diagnostic Bundles table
CREATE TABLE cxo_diagnostic_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  created_by_user_id UUID REFERENCES cxo_users(id),
  context JSONB DEFAULT '{}',
  logs JSONB DEFAULT '[]',
  network_tests JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit Logs table (CXO specific)
CREATE TABLE cxo_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES cxo_tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES cxo_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE cxo_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_connectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_queues ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_conversation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_workflow_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_provider_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_diagnostic_bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cxo_audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow authenticated users to access their tenant data
CREATE POLICY "Users can view their tenant" ON cxo_tenants FOR SELECT USING (true);
CREATE POLICY "Users can manage tenants" ON cxo_tenants FOR ALL USING (true);

CREATE POLICY "Users can view tenant users" ON cxo_users FOR SELECT USING (true);
CREATE POLICY "Users can manage tenant users" ON cxo_users FOR ALL USING (true);

CREATE POLICY "Users can view connectors" ON cxo_connectors FOR SELECT USING (true);
CREATE POLICY "Users can manage connectors" ON cxo_connectors FOR ALL USING (true);

CREATE POLICY "Users can view contacts" ON cxo_contacts FOR SELECT USING (true);
CREATE POLICY "Users can manage contacts" ON cxo_contacts FOR ALL USING (true);

CREATE POLICY "Users can view queues" ON cxo_queues FOR SELECT USING (true);
CREATE POLICY "Users can manage queues" ON cxo_queues FOR ALL USING (true);

CREATE POLICY "Users can view conversations" ON cxo_conversations FOR SELECT USING (true);
CREATE POLICY "Users can manage conversations" ON cxo_conversations FOR ALL USING (true);

CREATE POLICY "Users can view conversation events" ON cxo_conversation_events FOR SELECT USING (true);
CREATE POLICY "Users can manage conversation events" ON cxo_conversation_events FOR ALL USING (true);

CREATE POLICY "Users can view workflows" ON cxo_workflows FOR SELECT USING (true);
CREATE POLICY "Users can manage workflows" ON cxo_workflows FOR ALL USING (true);

CREATE POLICY "Users can view workflow versions" ON cxo_workflow_versions FOR SELECT USING (true);
CREATE POLICY "Users can manage workflow versions" ON cxo_workflow_versions FOR ALL USING (true);

CREATE POLICY "Users can view health checks" ON cxo_provider_health_checks FOR SELECT USING (true);
CREATE POLICY "Users can manage health checks" ON cxo_provider_health_checks FOR ALL USING (true);

CREATE POLICY "Users can view AI jobs" ON cxo_ai_jobs FOR SELECT USING (true);
CREATE POLICY "Users can manage AI jobs" ON cxo_ai_jobs FOR ALL USING (true);

CREATE POLICY "Users can view support tickets" ON cxo_support_tickets FOR SELECT USING (true);
CREATE POLICY "Users can manage support tickets" ON cxo_support_tickets FOR ALL USING (true);

CREATE POLICY "Users can view diagnostic bundles" ON cxo_diagnostic_bundles FOR SELECT USING (true);
CREATE POLICY "Users can manage diagnostic bundles" ON cxo_diagnostic_bundles FOR ALL USING (true);

CREATE POLICY "Users can view audit logs" ON cxo_audit_logs FOR SELECT USING (true);
CREATE POLICY "Users can create audit logs" ON cxo_audit_logs FOR INSERT WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_cxo_users_tenant ON cxo_users(tenant_id);
CREATE INDEX idx_cxo_connectors_tenant ON cxo_connectors(tenant_id);
CREATE INDEX idx_cxo_contacts_tenant ON cxo_contacts(tenant_id);
CREATE INDEX idx_cxo_queues_tenant ON cxo_queues(tenant_id);
CREATE INDEX idx_cxo_conversations_tenant ON cxo_conversations(tenant_id);
CREATE INDEX idx_cxo_conversations_status ON cxo_conversations(status);
CREATE INDEX idx_cxo_conversation_events_conversation ON cxo_conversation_events(conversation_id);
CREATE INDEX idx_cxo_workflows_tenant ON cxo_workflows(tenant_id);
CREATE INDEX idx_cxo_ai_jobs_tenant ON cxo_ai_jobs(tenant_id);
CREATE INDEX idx_cxo_support_tickets_tenant ON cxo_support_tickets(tenant_id);