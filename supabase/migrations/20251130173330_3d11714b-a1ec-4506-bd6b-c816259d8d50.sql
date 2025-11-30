-- Create workflow_rules table for automation
CREATE TABLE public.workflow_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT NOT NULL, -- 'stage_change', 'status_change', 'quote_accepted', 'inactivity', 'scheduled'
  trigger_config JSONB NOT NULL DEFAULT '{}',
  action_type TEXT NOT NULL, -- 'create_task', 'send_reminder', 'assign_salesman', 'update_status', 'log_activity'
  action_config JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reminders table
CREATE TABLE public.reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  reminder_type TEXT NOT NULL, -- 'follow_up', 'meeting', 'task', 'custom'
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  related_client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  related_salesman_id UUID REFERENCES public.salesmen(id) ON DELETE SET NULL,
  assigned_to UUID,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create workflow_logs table to track triggered automations
CREATE TABLE public.workflow_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_rule_id UUID REFERENCES public.workflow_rules(id) ON DELETE SET NULL,
  trigger_event TEXT NOT NULL,
  trigger_data JSONB,
  action_taken TEXT NOT NULL,
  action_result JSONB,
  status TEXT DEFAULT 'success', -- 'success', 'failed', 'pending'
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity_logs table for email/action tracking
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_type TEXT NOT NULL, -- 'email_sent', 'email_opened', 'call_made', 'meeting_scheduled', 'note_added', 'stage_changed'
  entity_type TEXT NOT NULL, -- 'client', 'quote', 'salesman', 'task'
  entity_id UUID NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  performed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.workflow_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workflow_rules
CREATE POLICY "Anyone can view workflow rules" ON public.workflow_rules FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage workflow rules" ON public.workflow_rules FOR ALL 
  USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role));

-- RLS Policies for reminders
CREATE POLICY "Anyone can view reminders" ON public.reminders FOR SELECT USING (true);
CREATE POLICY "Anyone can create reminders" ON public.reminders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reminders" ON public.reminders FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reminders" ON public.reminders FOR DELETE USING (true);

-- RLS Policies for workflow_logs
CREATE POLICY "Anyone can view workflow logs" ON public.workflow_logs FOR SELECT USING (true);
CREATE POLICY "System can create workflow logs" ON public.workflow_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for activity_logs
CREATE POLICY "Anyone can view activity logs" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can create activity logs" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_reminders_due_date ON public.reminders(due_date);
CREATE INDEX idx_reminders_client ON public.reminders(related_client_id);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX idx_workflow_logs_rule ON public.workflow_logs(workflow_rule_id);