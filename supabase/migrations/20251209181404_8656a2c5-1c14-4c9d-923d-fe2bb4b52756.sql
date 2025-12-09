-- Add new roles for logistics
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'dispatcher';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'warehouse_manager';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'driver';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'carrier';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'customer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'finance_manager';

-- Equipment types table
CREATE TABLE public.equipment_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES accounting_companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  description TEXT,
  max_weight_lbs INTEGER,
  max_volume_cuft NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Carriers table
CREATE TABLE public.carriers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES accounting_companies(id) ON DELETE CASCADE,
  carrier_number TEXT NOT NULL,
  name TEXT NOT NULL,
  mc_number TEXT,
  dot_number TEXT,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}',
  payment_terms INTEGER DEFAULT 30,
  default_rate_per_mile BIGINT DEFAULT 0,
  insurance_expiry DATE,
  performance_score NUMERIC DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, carrier_number)
);

-- Rate contracts for carriers
CREATE TABLE public.rate_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES accounting_companies(id) ON DELETE CASCADE,
  carrier_id UUID REFERENCES carriers(id) ON DELETE CASCADE,
  origin_region TEXT,
  destination_region TEXT,
  equipment_type_id UUID REFERENCES equipment_types(id),
  rate_per_mile BIGINT NOT NULL,
  flat_rate BIGINT,
  fuel_surcharge_percent NUMERIC DEFAULT 0,
  effective_date DATE NOT NULL,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Shipments table
CREATE TABLE public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES accounting_companies(id) ON DELETE CASCADE,
  shipment_number TEXT NOT NULL,
  customer_id UUID REFERENCES ar_customers(id),
  carrier_id UUID REFERENCES carriers(id),
  equipment_type_id UUID REFERENCES equipment_types(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'booked', 'dispatched', 'in_transit', 'delivered', 'cancelled', 'invoiced', 'settled')),
  
  -- Dates
  pickup_date DATE,
  delivery_date DATE,
  actual_pickup_date TIMESTAMPTZ,
  actual_delivery_date TIMESTAMPTZ,
  
  -- Financials (in cents)
  customer_rate BIGINT DEFAULT 0,
  carrier_rate BIGINT DEFAULT 0,
  fuel_surcharge BIGINT DEFAULT 0,
  accessorial_charges BIGINT DEFAULT 0,
  total_revenue BIGINT DEFAULT 0,
  total_cost BIGINT DEFAULT 0,
  margin BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  fx_rate NUMERIC DEFAULT 1.0,
  
  -- Details
  weight_lbs INTEGER,
  pieces INTEGER,
  commodity TEXT,
  special_instructions TEXT,
  
  -- References
  customer_po TEXT,
  customer_ref TEXT,
  bol_number TEXT,
  
  -- Tracking
  current_location JSONB,
  
  -- Audit
  created_by UUID,
  dispatched_by UUID,
  dispatched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(company_id, shipment_number)
);

-- Stops table (multi-stop routing)
CREATE TABLE public.stops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  stop_number INTEGER NOT NULL,
  stop_type TEXT NOT NULL CHECK (stop_type IN ('pickup', 'delivery', 'cross_dock')),
  
  -- Location
  facility_name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  location JSONB, -- For PostGIS later: {lat, lng}
  
  -- Scheduling
  scheduled_date DATE,
  scheduled_time_from TIME,
  scheduled_time_to TIME,
  actual_arrival TIMESTAMPTZ,
  actual_departure TIMESTAMPTZ,
  
  -- Details
  contact_name TEXT,
  contact_phone TEXT,
  notes TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'arrived', 'loading', 'completed', 'skipped')),
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tracking events
CREATE TABLE public.tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_time TIMESTAMPTZ DEFAULT now(),
  location JSONB, -- {lat, lng, address}
  description TEXT,
  reported_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Driver expenses (for mobile app)
CREATE TABLE public.driver_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES accounting_companies(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id),
  driver_id UUID,
  expense_type TEXT NOT NULL CHECK (expense_type IN ('fuel', 'toll', 'parking', 'lumper', 'detention', 'other')),
  amount BIGINT NOT NULL,
  currency TEXT DEFAULT 'USD',
  receipt_url TEXT,
  description TEXT,
  expense_date DATE DEFAULT CURRENT_DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  journal_entry_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Carrier settlements
CREATE TABLE public.carrier_settlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES accounting_companies(id) ON DELETE CASCADE,
  carrier_id UUID REFERENCES carriers(id),
  settlement_number TEXT NOT NULL,
  settlement_date DATE DEFAULT CURRENT_DATE,
  total_amount BIGINT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  bill_id UUID, -- Links to AP bill when created
  journal_entry_id UUID, -- Links to GL journal when posted
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, settlement_number)
);

-- Settlement line items
CREATE TABLE public.carrier_settlement_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  settlement_id UUID REFERENCES carrier_settlements(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id),
  line_haul BIGINT DEFAULT 0,
  fuel_surcharge BIGINT DEFAULT 0,
  accessorials BIGINT DEFAULT 0,
  deductions BIGINT DEFAULT 0,
  total BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add source tracking to invoices for logistics integration
ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE ar_invoices ADD COLUMN IF NOT EXISTS source_id UUID;

-- Add source tracking to bills for logistics integration  
ALTER TABLE ap_bills ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE ap_bills ADD COLUMN IF NOT EXISTS source_id UUID;

-- Add source tracking to journal entries
ALTER TABLE gl_journal_entries ADD COLUMN IF NOT EXISTS source_type TEXT;
ALTER TABLE gl_journal_entries ADD COLUMN IF NOT EXISTS source_id UUID;

-- Enable RLS on all new tables
ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_settlement_lines ENABLE ROW LEVEL SECURITY;

-- RLS Policies for equipment_types
CREATE POLICY "Company users can view equipment types" ON equipment_types FOR SELECT
  USING (company_id = get_user_accounting_company());
CREATE POLICY "Authorized users can manage equipment types" ON equipment_types FOR ALL
  USING (company_id = get_user_accounting_company());

-- RLS Policies for carriers
CREATE POLICY "Company users can view carriers" ON carriers FOR SELECT
  USING (company_id = get_user_accounting_company());
CREATE POLICY "Authorized users can manage carriers" ON carriers FOR ALL
  USING (company_id = get_user_accounting_company());

-- RLS Policies for rate_contracts
CREATE POLICY "Company users can view rate contracts" ON rate_contracts FOR SELECT
  USING (company_id = get_user_accounting_company());
CREATE POLICY "Authorized users can manage rate contracts" ON rate_contracts FOR ALL
  USING (company_id = get_user_accounting_company());

-- RLS Policies for shipments
CREATE POLICY "Company users can view shipments" ON shipments FOR SELECT
  USING (company_id = get_user_accounting_company());
CREATE POLICY "Authorized users can manage shipments" ON shipments FOR ALL
  USING (company_id = get_user_accounting_company());

-- RLS Policies for stops
CREATE POLICY "Company users can view stops" ON stops FOR SELECT
  USING (shipment_id IN (SELECT id FROM shipments WHERE company_id = get_user_accounting_company()));
CREATE POLICY "Authorized users can manage stops" ON stops FOR ALL
  USING (shipment_id IN (SELECT id FROM shipments WHERE company_id = get_user_accounting_company()));

-- RLS Policies for tracking_events
CREATE POLICY "Company users can view tracking events" ON tracking_events FOR SELECT
  USING (shipment_id IN (SELECT id FROM shipments WHERE company_id = get_user_accounting_company()));
CREATE POLICY "Authorized users can manage tracking events" ON tracking_events FOR ALL
  USING (shipment_id IN (SELECT id FROM shipments WHERE company_id = get_user_accounting_company()));

-- RLS Policies for driver_expenses
CREATE POLICY "Company users can view driver expenses" ON driver_expenses FOR SELECT
  USING (company_id = get_user_accounting_company());
CREATE POLICY "Authorized users can manage driver expenses" ON driver_expenses FOR ALL
  USING (company_id = get_user_accounting_company());

-- RLS Policies for carrier_settlements
CREATE POLICY "Company users can view settlements" ON carrier_settlements FOR SELECT
  USING (company_id = get_user_accounting_company());
CREATE POLICY "Authorized users can manage settlements" ON carrier_settlements FOR ALL
  USING (company_id = get_user_accounting_company());

-- RLS Policies for settlement lines
CREATE POLICY "Company users can view settlement lines" ON carrier_settlement_lines FOR SELECT
  USING (settlement_id IN (SELECT id FROM carrier_settlements WHERE company_id = get_user_accounting_company()));
CREATE POLICY "Authorized users can manage settlement lines" ON carrier_settlement_lines FOR ALL
  USING (settlement_id IN (SELECT id FROM carrier_settlements WHERE company_id = get_user_accounting_company()));

-- Create indexes for performance
CREATE INDEX idx_shipments_company ON shipments(company_id);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_customer ON shipments(customer_id);
CREATE INDEX idx_shipments_carrier ON shipments(carrier_id);
CREATE INDEX idx_stops_shipment ON stops(shipment_id);
CREATE INDEX idx_tracking_shipment ON tracking_events(shipment_id);
CREATE INDEX idx_carriers_company ON carriers(company_id);
CREATE INDEX idx_settlements_carrier ON carrier_settlements(carrier_id);