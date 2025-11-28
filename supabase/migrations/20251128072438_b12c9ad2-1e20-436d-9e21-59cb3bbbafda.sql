-- Create table for calculator settings (profit margin)
CREATE TABLE public.calculator_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profit_margin DECIMAL NOT NULL DEFAULT 25,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for components
CREATE TABLE public.components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  base_cost DECIMAL NOT NULL,
  base_price DECIMAL NOT NULL,
  is_base BOOLEAN DEFAULT false,
  icon TEXT DEFAULT 'Sparkles',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for CSV files metadata
CREATE TABLE public.csv_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.calculator_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.csv_files ENABLE ROW LEVEL SECURITY;

-- Create public read policies (anyone can read settings and components)
CREATE POLICY "Anyone can read settings" ON public.calculator_settings FOR SELECT USING (true);
CREATE POLICY "Anyone can read components" ON public.components FOR SELECT USING (true);
CREATE POLICY "Anyone can read csv files" ON public.csv_files FOR SELECT USING (true);

-- Create public write policies for now (no auth required)
CREATE POLICY "Anyone can insert settings" ON public.calculator_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update settings" ON public.calculator_settings FOR UPDATE USING (true);
CREATE POLICY "Anyone can insert components" ON public.components FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update components" ON public.components FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete components" ON public.components FOR DELETE USING (true);
CREATE POLICY "Anyone can insert csv files" ON public.csv_files FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete csv files" ON public.csv_files FOR DELETE USING (true);

-- Insert default settings
INSERT INTO public.calculator_settings (profit_margin) VALUES (25);

-- Insert default components
INSERT INTO public.components (name, description, category, base_cost, base_price, is_base, icon) VALUES
  ('Base Website', 'Modern responsive website with up to 5 pages', 'Website', 1500, 2000, true, 'Globe'),
  ('Additional Page', 'Extra page with custom design and content', 'Website', 75, 100, false, 'FileText'),
  ('AI Chatbot', 'Intelligent chatbot with custom training', 'AI Services', 2200, 3000, false, 'Bot'),
  ('E-commerce Integration', 'Full shopping cart and payment processing', 'Features', 1800, 2500, false, 'ShoppingCart'),
  ('User Authentication', 'Secure login system with social auth options', 'Features', 600, 800, false, 'Shield'),
  ('Custom API Development', 'RESTful API with documentation', 'Backend', 1200, 1600, false, 'Code'),
  ('AI Image Generation', 'Custom AI-powered image generation feature', 'AI Services', 1500, 2000, false, 'Image'),
  ('Analytics Dashboard', 'Real-time analytics and reporting', 'Features', 900, 1200, false, 'BarChart3');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_calculator_settings_updated_at
  BEFORE UPDATE ON public.calculator_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON public.components
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();