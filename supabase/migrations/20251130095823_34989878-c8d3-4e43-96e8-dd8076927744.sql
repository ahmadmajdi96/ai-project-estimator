-- Add salesman_id to quotes table if not exists
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS salesman_id uuid REFERENCES public.salesmen(id);

-- Create AI recommendations table
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'pending',
  context jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create AI decisions table
CREATE TABLE IF NOT EXISTS public.ai_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  title text NOT NULL,
  description text NOT NULL,
  context text,
  options jsonb DEFAULT '[]'::jsonb,
  ai_analysis jsonb DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending',
  final_decision text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_recommendations
CREATE POLICY "Anyone can view ai_recommendations" ON public.ai_recommendations FOR SELECT USING (true);
CREATE POLICY "Authorized users can manage ai_recommendations" ON public.ai_recommendations FOR ALL USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role));

-- RLS policies for ai_decisions
CREATE POLICY "Users can view ai_decisions" ON public.ai_decisions FOR SELECT USING (true);
CREATE POLICY "Users can create ai_decisions" ON public.ai_decisions FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own ai_decisions" ON public.ai_decisions FOR UPDATE USING (true);
CREATE POLICY "Authorized users can delete ai_decisions" ON public.ai_decisions FOR DELETE USING (has_role(auth.uid(), 'ceo'::app_role) OR has_role(auth.uid(), 'department_head'::app_role));