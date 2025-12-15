-- Add new columns to employee_requests for manager approval workflow and escalation
ALTER TABLE employee_requests 
ADD COLUMN IF NOT EXISTS manager_approved_by uuid,
ADD COLUMN IF NOT EXISTS manager_approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS manager_status text DEFAULT 'pending_manager',
ADD COLUMN IF NOT EXISTS is_escalated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS escalation_reason text,
ADD COLUMN IF NOT EXISTS escalated_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS escalation_resolved_by uuid,
ADD COLUMN IF NOT EXISTS escalation_resolved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS escalation_resolution text,
ADD COLUMN IF NOT EXISTS documents jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS additional_details text;

-- Create employee_tickets table for enhanced ticket functionality
CREATE TABLE IF NOT EXISTS employee_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES employees(id) ON DELETE SET NULL,
  ticket_number text NOT NULL,
  category text NOT NULL,
  subject text NOT NULL,
  description text,
  priority text DEFAULT 'medium',
  status text DEFAULT 'open',
  assigned_to uuid,
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  attachments jsonb DEFAULT '[]'::jsonb,
  resolution text,
  resolved_at timestamp with time zone,
  resolved_by uuid,
  is_escalated boolean DEFAULT false,
  escalated_at timestamp with time zone,
  escalation_reason text,
  due_date timestamp with time zone,
  sla_breach boolean DEFAULT false,
  first_response_at timestamp with time zone,
  tags text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES employee_tickets(id) ON DELETE CASCADE,
  user_id uuid,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE employee_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

-- Policies for employee_tickets
CREATE POLICY "Users can view all tickets" ON employee_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create tickets" ON employee_tickets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update tickets" ON employee_tickets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete tickets" ON employee_tickets FOR DELETE TO authenticated USING (true);

-- Policies for ticket_comments
CREATE POLICY "Users can view ticket comments" ON ticket_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create ticket comments" ON ticket_comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can delete own comments" ON ticket_comments FOR DELETE TO authenticated USING (true);

-- Create portal_permissions table to define which portals each role can access
CREATE TABLE IF NOT EXISTS portal_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role text NOT NULL,
  portal_path text NOT NULL,
  can_access boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(role, portal_path)
);

-- Enable RLS
ALTER TABLE portal_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view portal permissions" ON portal_permissions FOR SELECT TO authenticated USING (true);

-- Insert default portal permissions
INSERT INTO portal_permissions (role, portal_path, can_access) VALUES
('super_admin', '/crm', true),
('super_admin', '/management', true),
('super_admin', '/hr', true),
('super_admin', '/accounting', true),
('super_admin', '/logistics', true),
('super_admin', '/chatflow', true),
('super_admin', '/employee', true),
('ceo', '/crm', true),
('ceo', '/management', true),
('ceo', '/hr', true),
('ceo', '/accounting', true),
('ceo', '/logistics', true),
('ceo', '/chatflow', true),
('ceo', '/employee', true),
('department_head', '/management', true),
('department_head', '/hr', true),
('department_head', '/employee', true),
('team_lead', '/management', true),
('team_lead', '/employee', true),
('employee', '/employee', true)
ON CONFLICT (role, portal_path) DO NOTHING;