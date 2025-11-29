-- Create enums for CRM
CREATE TYPE public.client_status AS ENUM ('prospect', 'active', 'inactive', 'former');
CREATE TYPE public.sales_stage AS ENUM ('pre_sales', 'negotiation', 'closing', 'post_sales', 'support');
CREATE TYPE public.quote_status AS ENUM ('draft', 'sent', 'accepted', 'rejected');
CREATE TYPE public.call_type AS ENUM ('incoming', 'outgoing');
CREATE TYPE public.event_type AS ENUM ('meeting', 'call', 'follow_up', 'task');

-- Clients table
CREATE TABLE public.clients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  industry TEXT,
  status client_status NOT NULL DEFAULT 'prospect',
  sales_stage sales_stage NOT NULL DEFAULT 'pre_sales',
  contract_value NUMERIC DEFAULT 0,
  revenue_to_date NUMERIC DEFAULT 0,
  contract_start_date DATE,
  contract_end_date DATE,
  last_meeting_date TIMESTAMPTZ,
  last_contact TIMESTAMPTZ,
  meeting_notes TEXT,
  website TEXT,
  first_contact_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  follow_up_needed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Quotes table (links to existing components)
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  components JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  discount_percent NUMERIC DEFAULT 0,
  discount_amount NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  profit_margin NUMERIC DEFAULT 25,
  notes TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Call logs table
CREATE TABLE public.call_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  call_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  call_duration INTEGER, -- in minutes
  summary TEXT,
  call_type call_type NOT NULL DEFAULT 'outgoing',
  follow_up_action TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notes table
CREATE TABLE public.client_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  note_text TEXT NOT NULL,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Calendar events table
CREATE TABLE public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ NOT NULL,
  location TEXT,
  event_type event_type NOT NULL DEFAULT 'meeting',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Anyone can read clients" ON public.clients FOR SELECT USING (true);
CREATE POLICY "Anyone can insert clients" ON public.clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clients" ON public.clients FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete clients" ON public.clients FOR DELETE USING (true);

-- RLS Policies for quotes
CREATE POLICY "Anyone can read quotes" ON public.quotes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quotes" ON public.quotes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quotes" ON public.quotes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete quotes" ON public.quotes FOR DELETE USING (true);

-- RLS Policies for call_logs
CREATE POLICY "Anyone can read call_logs" ON public.call_logs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert call_logs" ON public.call_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update call_logs" ON public.call_logs FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete call_logs" ON public.call_logs FOR DELETE USING (true);

-- RLS Policies for client_notes
CREATE POLICY "Anyone can read client_notes" ON public.client_notes FOR SELECT USING (true);
CREATE POLICY "Anyone can insert client_notes" ON public.client_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update client_notes" ON public.client_notes FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete client_notes" ON public.client_notes FOR DELETE USING (true);

-- RLS Policies for calendar_events
CREATE POLICY "Anyone can read calendar_events" ON public.calendar_events FOR SELECT USING (true);
CREATE POLICY "Anyone can insert calendar_events" ON public.calendar_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update calendar_events" ON public.calendar_events FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete calendar_events" ON public.calendar_events FOR DELETE USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON public.quotes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON public.client_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();