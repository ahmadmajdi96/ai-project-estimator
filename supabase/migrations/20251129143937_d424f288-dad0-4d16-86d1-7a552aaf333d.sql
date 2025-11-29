-- Create salesmen table
CREATE TABLE public.salesmen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  hire_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
  territory TEXT,
  target_monthly NUMERIC DEFAULT 0,
  target_quarterly NUMERIC DEFAULT 0,
  target_annual NUMERIC DEFAULT 0,
  commission_rate NUMERIC DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales_performance table for tracking
CREATE TABLE public.sales_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salesman_id UUID REFERENCES public.salesmen(id) ON DELETE CASCADE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  deals_closed INTEGER DEFAULT 0,
  revenue_generated NUMERIC DEFAULT 0,
  leads_contacted INTEGER DEFAULT 0,
  meetings_held INTEGER DEFAULT 0,
  proposals_sent INTEGER DEFAULT 0,
  conversion_rate NUMERIC DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.salesmen ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales_performance ENABLE ROW LEVEL SECURITY;

-- RLS policies for salesmen
CREATE POLICY "Allow all access to salesmen" ON public.salesmen FOR ALL USING (true);
CREATE POLICY "Allow all access to sales_performance" ON public.sales_performance FOR ALL USING (true);

-- Add salesman_id to calendar_events for assignment
ALTER TABLE public.calendar_events ADD COLUMN salesman_id UUID REFERENCES public.salesmen(id) ON DELETE SET NULL;

-- Add salesman_id to clients for tracking
ALTER TABLE public.clients ADD COLUMN salesman_id UUID REFERENCES public.salesmen(id) ON DELETE SET NULL;