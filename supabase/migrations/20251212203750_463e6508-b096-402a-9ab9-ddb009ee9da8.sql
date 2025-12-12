-- Change sales_stage from enum to text to allow custom stages
ALTER TABLE public.clients 
  ALTER COLUMN sales_stage DROP DEFAULT,
  ALTER COLUMN sales_stage TYPE text USING sales_stage::text,
  ALTER COLUMN sales_stage SET DEFAULT 'pre_sales';

-- Change status from enum to text to allow custom statuses
ALTER TABLE public.clients 
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE text USING status::text,
  ALTER COLUMN status SET DEFAULT 'prospect';