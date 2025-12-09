-- Create accounting-specific role type
CREATE TYPE public.accounting_role AS ENUM ('admin', 'accountant', 'bookkeeper', 'manager', 'auditor', 'employee');

-- Companies table (multi-tenant)
CREATE TABLE public.accounting_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  legal_name TEXT,
  tax_id TEXT,
  currency TEXT DEFAULT 'USD',
  fiscal_year_start INTEGER DEFAULT 1,
  address JSONB DEFAULT '{}'::jsonb,
  phone TEXT,
  email TEXT,
  website TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Accounting users with roles
CREATE TABLE public.accounting_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE,
  role accounting_role NOT NULL DEFAULT 'employee',
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  department TEXT,
  job_title TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(auth_user_id, company_id)
);

-- Chart of Accounts
CREATE TABLE public.gl_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  account_number TEXT NOT NULL,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
  sub_type TEXT,
  parent_account_id UUID REFERENCES public.gl_accounts(id),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  opening_balance BIGINT DEFAULT 0,
  current_balance BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, account_number)
);

-- Journal Entries
CREATE TABLE public.gl_journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  entry_number TEXT NOT NULL,
  entry_date DATE NOT NULL,
  description TEXT,
  reference TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'posted', 'void')),
  is_adjusting BOOLEAN DEFAULT false,
  is_closing BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  created_by UUID REFERENCES public.accounting_users(id),
  posted_by UUID REFERENCES public.accounting_users(id),
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, entry_number)
);

-- Journal Entry Lines (double-entry)
CREATE TABLE public.gl_entry_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES public.gl_journal_entries(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.gl_accounts(id) NOT NULL,
  description TEXT,
  debit_amount BIGINT DEFAULT 0,
  credit_amount BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Customers (AR)
CREATE TABLE public.ar_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  customer_number TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  billing_address JSONB DEFAULT '{}'::jsonb,
  shipping_address JSONB DEFAULT '{}'::jsonb,
  payment_terms INTEGER DEFAULT 30,
  credit_limit BIGINT DEFAULT 0,
  current_balance BIGINT DEFAULT 0,
  tax_id TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, customer_number)
);

-- Invoices (AR)
CREATE TABLE public.ar_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.ar_customers(id) NOT NULL,
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'void', 'cancelled')),
  subtotal BIGINT DEFAULT 0,
  tax_amount BIGINT DEFAULT 0,
  discount_amount BIGINT DEFAULT 0,
  total_amount BIGINT DEFAULT 0,
  amount_paid BIGINT DEFAULT 0,
  balance_due BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  terms TEXT,
  is_recurring BOOLEAN DEFAULT false,
  recurring_frequency TEXT,
  created_by UUID REFERENCES public.accounting_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, invoice_number)
);

-- Invoice Items
CREATE TABLE public.ar_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES public.ar_invoices(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price BIGINT NOT NULL,
  discount_percent NUMERIC(5,2) DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  amount BIGINT NOT NULL,
  account_id UUID REFERENCES public.gl_accounts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AR Payments
CREATE TABLE public.ar_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.ar_customers(id) NOT NULL,
  payment_number TEXT NOT NULL,
  payment_date DATE NOT NULL,
  amount BIGINT NOT NULL,
  payment_method TEXT,
  reference TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.accounting_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, payment_number)
);

-- Payment Applications (link payments to invoices)
CREATE TABLE public.ar_payment_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES public.ar_payments(id) ON DELETE CASCADE NOT NULL,
  invoice_id UUID REFERENCES public.ar_invoices(id) NOT NULL,
  amount_applied BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Vendors (AP)
CREATE TABLE public.ap_vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  vendor_number TEXT NOT NULL,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address JSONB DEFAULT '{}'::jsonb,
  payment_terms INTEGER DEFAULT 30,
  current_balance BIGINT DEFAULT 0,
  tax_id TEXT,
  bank_details JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, vendor_number)
);

-- Bills (AP)
CREATE TABLE public.ap_bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.ap_vendors(id) NOT NULL,
  bill_number TEXT NOT NULL,
  vendor_invoice_number TEXT,
  bill_date DATE NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_approval', 'approved', 'partial', 'paid', 'void')),
  subtotal BIGINT DEFAULT 0,
  tax_amount BIGINT DEFAULT 0,
  total_amount BIGINT DEFAULT 0,
  amount_paid BIGINT DEFAULT 0,
  balance_due BIGINT DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  attachment_url TEXT,
  approval_status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES public.accounting_users(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.accounting_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, bill_number)
);

-- Bill Items
CREATE TABLE public.ap_bill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id UUID REFERENCES public.ap_bills(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) DEFAULT 1,
  unit_price BIGINT NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  amount BIGINT NOT NULL,
  account_id UUID REFERENCES public.gl_accounts(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AP Payments
CREATE TABLE public.ap_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES public.ap_vendors(id) NOT NULL,
  payment_number TEXT NOT NULL,
  payment_date DATE NOT NULL,
  amount BIGINT NOT NULL,
  payment_method TEXT,
  reference TEXT,
  bank_account_id UUID,
  notes TEXT,
  created_by UUID REFERENCES public.accounting_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, payment_number)
);

-- Bank Accounts
CREATE TABLE public.bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  account_name TEXT NOT NULL,
  bank_name TEXT,
  account_number TEXT,
  routing_number TEXT,
  account_type TEXT,
  currency TEXT DEFAULT 'USD',
  current_balance BIGINT DEFAULT 0,
  gl_account_id UUID REFERENCES public.gl_accounts(id),
  is_active BOOLEAN DEFAULT true,
  plaid_access_token TEXT,
  plaid_item_id TEXT,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bank Transactions
CREATE TABLE public.bank_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bank_account_id UUID REFERENCES public.bank_accounts(id) ON DELETE CASCADE NOT NULL,
  transaction_date DATE NOT NULL,
  description TEXT,
  amount BIGINT NOT NULL,
  transaction_type TEXT,
  category TEXT,
  payee TEXT,
  is_reconciled BOOLEAN DEFAULT false,
  reconciled_at TIMESTAMPTZ,
  matched_entry_id UUID REFERENCES public.gl_journal_entries(id),
  plaid_transaction_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  expense_number TEXT NOT NULL,
  employee_id UUID REFERENCES public.accounting_users(id) NOT NULL,
  expense_date DATE NOT NULL,
  category TEXT,
  description TEXT,
  amount BIGINT NOT NULL,
  currency TEXT DEFAULT 'USD',
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
  approved_by UUID REFERENCES public.accounting_users(id),
  approved_at TIMESTAMPTZ,
  reimbursed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, expense_number)
);

-- Employees (Payroll)
CREATE TABLE public.payroll_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.accounting_users(id),
  employee_number TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  hire_date DATE,
  termination_date DATE,
  employment_type TEXT DEFAULT 'full_time',
  department TEXT,
  job_title TEXT,
  salary_type TEXT DEFAULT 'salary' CHECK (salary_type IN ('salary', 'hourly')),
  salary_amount BIGINT,
  hourly_rate BIGINT,
  tax_filing_status TEXT,
  federal_allowances INTEGER DEFAULT 0,
  state_allowances INTEGER DEFAULT 0,
  bank_details JSONB DEFAULT '{}'::jsonb,
  address JSONB DEFAULT '{}'::jsonb,
  ssn_last_four TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, employee_number)
);

-- Payroll Runs
CREATE TABLE public.payroll_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  run_number TEXT NOT NULL,
  pay_period_start DATE NOT NULL,
  pay_period_end DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'approved', 'paid', 'void')),
  total_gross BIGINT DEFAULT 0,
  total_taxes BIGINT DEFAULT 0,
  total_deductions BIGINT DEFAULT 0,
  total_net BIGINT DEFAULT 0,
  employee_count INTEGER DEFAULT 0,
  approved_by UUID REFERENCES public.accounting_users(id),
  approved_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.accounting_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, run_number)
);

-- Paystubs
CREATE TABLE public.payroll_paystubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_run_id UUID REFERENCES public.payroll_runs(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.payroll_employees(id) NOT NULL,
  gross_pay BIGINT NOT NULL,
  federal_tax BIGINT DEFAULT 0,
  state_tax BIGINT DEFAULT 0,
  social_security BIGINT DEFAULT 0,
  medicare BIGINT DEFAULT 0,
  other_deductions BIGINT DEFAULT 0,
  net_pay BIGINT NOT NULL,
  hours_worked NUMERIC(10,2),
  overtime_hours NUMERIC(10,2) DEFAULT 0,
  deductions_detail JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tax Rates
CREATE TABLE public.tax_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  rate NUMERIC(5,2) NOT NULL,
  tax_type TEXT,
  jurisdiction TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Budgets
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  fiscal_year INTEGER NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed')),
  notes TEXT,
  created_by UUID REFERENCES public.accounting_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Budget Lines
CREATE TABLE public.budget_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
  account_id UUID REFERENCES public.gl_accounts(id) NOT NULL,
  month_1 BIGINT DEFAULT 0,
  month_2 BIGINT DEFAULT 0,
  month_3 BIGINT DEFAULT 0,
  month_4 BIGINT DEFAULT 0,
  month_5 BIGINT DEFAULT 0,
  month_6 BIGINT DEFAULT 0,
  month_7 BIGINT DEFAULT 0,
  month_8 BIGINT DEFAULT 0,
  month_9 BIGINT DEFAULT 0,
  month_10 BIGINT DEFAULT 0,
  month_11 BIGINT DEFAULT 0,
  month_12 BIGINT DEFAULT 0,
  annual_total BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fixed Assets
CREATE TABLE public.fixed_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  asset_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  purchase_date DATE,
  purchase_price BIGINT,
  useful_life_months INTEGER,
  salvage_value BIGINT DEFAULT 0,
  depreciation_method TEXT DEFAULT 'straight_line',
  accumulated_depreciation BIGINT DEFAULT 0,
  book_value BIGINT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'disposed', 'fully_depreciated')),
  disposal_date DATE,
  disposal_amount BIGINT,
  gl_asset_account_id UUID REFERENCES public.gl_accounts(id),
  gl_depreciation_account_id UUID REFERENCES public.gl_accounts(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, asset_number)
);

-- Inventory Items
CREATE TABLE public.inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  unit_of_measure TEXT,
  unit_cost BIGINT DEFAULT 0,
  selling_price BIGINT DEFAULT 0,
  quantity_on_hand INTEGER DEFAULT 0,
  reorder_point INTEGER DEFAULT 0,
  valuation_method TEXT DEFAULT 'fifo',
  gl_asset_account_id UUID REFERENCES public.gl_accounts(id),
  gl_cogs_account_id UUID REFERENCES public.gl_accounts(id),
  gl_revenue_account_id UUID REFERENCES public.gl_accounts(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, sku)
);

-- Projects
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  project_number TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  customer_id UUID REFERENCES public.ar_customers(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  budget BIGINT DEFAULT 0,
  actual_cost BIGINT DEFAULT 0,
  billable_amount BIGINT DEFAULT 0,
  project_manager_id UUID REFERENCES public.accounting_users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, project_number)
);

-- Time Entries
CREATE TABLE public.time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  employee_id UUID REFERENCES public.accounting_users(id) NOT NULL,
  entry_date DATE NOT NULL,
  hours NUMERIC(5,2) NOT NULL,
  description TEXT,
  is_billable BOOLEAN DEFAULT true,
  hourly_rate BIGINT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'invoiced')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Accounting Audit Logs
CREATE TABLE public.accounting_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.accounting_companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.accounting_users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.accounting_companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gl_entry_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_payment_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ap_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ap_bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ap_bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ap_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_paystubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounting_audit_logs ENABLE ROW LEVEL SECURITY;

-- Create function to check accounting user role
CREATE OR REPLACE FUNCTION public.get_user_accounting_company()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.accounting_users WHERE auth_user_id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.has_accounting_role(_role accounting_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.accounting_users
    WHERE auth_user_id = auth.uid() AND role = _role
  )
$$;

-- RLS Policies for accounting_companies
CREATE POLICY "Users can view their company" ON public.accounting_companies FOR SELECT USING (
  id IN (SELECT company_id FROM public.accounting_users WHERE auth_user_id = auth.uid())
);
CREATE POLICY "Admins can manage companies" ON public.accounting_companies FOR ALL USING (
  id IN (SELECT company_id FROM public.accounting_users WHERE auth_user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for accounting_users
CREATE POLICY "Users can view company users" ON public.accounting_users FOR SELECT USING (
  company_id = public.get_user_accounting_company()
);
CREATE POLICY "Admins can manage users" ON public.accounting_users FOR ALL USING (
  company_id = public.get_user_accounting_company() AND public.has_accounting_role('admin')
);

-- Generic company-scoped policies for financial tables
CREATE POLICY "Company users can view gl_accounts" ON public.gl_accounts FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage gl_accounts" ON public.gl_accounts FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('accountant')));

CREATE POLICY "Company users can view journal entries" ON public.gl_journal_entries FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage journal entries" ON public.gl_journal_entries FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('accountant') OR public.has_accounting_role('bookkeeper')));

CREATE POLICY "Company users can view entry lines" ON public.gl_entry_lines FOR SELECT USING (journal_entry_id IN (SELECT id FROM public.gl_journal_entries WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Authorized users can manage entry lines" ON public.gl_entry_lines FOR ALL USING (journal_entry_id IN (SELECT id FROM public.gl_journal_entries WHERE company_id = public.get_user_accounting_company()));

CREATE POLICY "Company users can view customers" ON public.ar_customers FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage customers" ON public.ar_customers FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view invoices" ON public.ar_invoices FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage invoices" ON public.ar_invoices FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view invoice items" ON public.ar_invoice_items FOR SELECT USING (invoice_id IN (SELECT id FROM public.ar_invoices WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Authorized users can manage invoice items" ON public.ar_invoice_items FOR ALL USING (invoice_id IN (SELECT id FROM public.ar_invoices WHERE company_id = public.get_user_accounting_company()));

CREATE POLICY "Company users can view ar payments" ON public.ar_payments FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage ar payments" ON public.ar_payments FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view payment applications" ON public.ar_payment_applications FOR SELECT USING (payment_id IN (SELECT id FROM public.ar_payments WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Authorized users can manage payment applications" ON public.ar_payment_applications FOR ALL USING (payment_id IN (SELECT id FROM public.ar_payments WHERE company_id = public.get_user_accounting_company()));

CREATE POLICY "Company users can view vendors" ON public.ap_vendors FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage vendors" ON public.ap_vendors FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view bills" ON public.ap_bills FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage bills" ON public.ap_bills FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view bill items" ON public.ap_bill_items FOR SELECT USING (bill_id IN (SELECT id FROM public.ap_bills WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Authorized users can manage bill items" ON public.ap_bill_items FOR ALL USING (bill_id IN (SELECT id FROM public.ap_bills WHERE company_id = public.get_user_accounting_company()));

CREATE POLICY "Company users can view ap payments" ON public.ap_payments FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage ap payments" ON public.ap_payments FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view bank accounts" ON public.bank_accounts FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage bank accounts" ON public.bank_accounts FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('accountant')));

CREATE POLICY "Company users can view bank transactions" ON public.bank_transactions FOR SELECT USING (bank_account_id IN (SELECT id FROM public.bank_accounts WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Authorized users can manage bank transactions" ON public.bank_transactions FOR ALL USING (bank_account_id IN (SELECT id FROM public.bank_accounts WHERE company_id = public.get_user_accounting_company()));

CREATE POLICY "Users can view own expenses" ON public.expenses FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Users can create expenses" ON public.expenses FOR INSERT WITH CHECK (company_id = public.get_user_accounting_company());
CREATE POLICY "Managers can manage expenses" ON public.expenses FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('manager') OR public.has_accounting_role('accountant')));

CREATE POLICY "Company users can view payroll employees" ON public.payroll_employees FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "HR/Admin can manage payroll employees" ON public.payroll_employees FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('accountant')));

CREATE POLICY "Company users can view payroll runs" ON public.payroll_runs FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "HR/Admin can manage payroll runs" ON public.payroll_runs FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('accountant')));

CREATE POLICY "Company users can view paystubs" ON public.payroll_paystubs FOR SELECT USING (payroll_run_id IN (SELECT id FROM public.payroll_runs WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "HR/Admin can manage paystubs" ON public.payroll_paystubs FOR ALL USING (payroll_run_id IN (SELECT id FROM public.payroll_runs WHERE company_id = public.get_user_accounting_company()));

CREATE POLICY "Company users can view tax rates" ON public.tax_rates FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Admins can manage tax rates" ON public.tax_rates FOR ALL USING (company_id = public.get_user_accounting_company() AND public.has_accounting_role('admin'));

CREATE POLICY "Company users can view budgets" ON public.budgets FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Managers can manage budgets" ON public.budgets FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('manager') OR public.has_accounting_role('accountant')));

CREATE POLICY "Company users can view budget lines" ON public.budget_lines FOR SELECT USING (budget_id IN (SELECT id FROM public.budgets WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Managers can manage budget lines" ON public.budget_lines FOR ALL USING (budget_id IN (SELECT id FROM public.budgets WHERE company_id = public.get_user_accounting_company()));

CREATE POLICY "Company users can view fixed assets" ON public.fixed_assets FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage fixed assets" ON public.fixed_assets FOR ALL USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('accountant')));

CREATE POLICY "Company users can view inventory" ON public.inventory_items FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage inventory" ON public.inventory_items FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view projects" ON public.projects FOR SELECT USING (company_id = public.get_user_accounting_company());
CREATE POLICY "Authorized users can manage projects" ON public.projects FOR ALL USING (company_id = public.get_user_accounting_company());

CREATE POLICY "Company users can view time entries" ON public.time_entries FOR SELECT USING (project_id IN (SELECT id FROM public.projects WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Users can create time entries" ON public.time_entries FOR INSERT WITH CHECK (project_id IN (SELECT id FROM public.projects WHERE company_id = public.get_user_accounting_company()));
CREATE POLICY "Managers can manage time entries" ON public.time_entries FOR ALL USING (project_id IN (SELECT id FROM public.projects WHERE company_id = public.get_user_accounting_company()) AND (public.has_accounting_role('admin') OR public.has_accounting_role('manager')));

CREATE POLICY "Company users can view audit logs" ON public.accounting_audit_logs FOR SELECT USING (company_id = public.get_user_accounting_company() AND (public.has_accounting_role('admin') OR public.has_accounting_role('auditor')));
CREATE POLICY "System can create audit logs" ON public.accounting_audit_logs FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_accounting_users_auth_user ON public.accounting_users(auth_user_id);
CREATE INDEX idx_accounting_users_company ON public.accounting_users(company_id);
CREATE INDEX idx_gl_accounts_company ON public.gl_accounts(company_id);
CREATE INDEX idx_gl_journal_entries_company ON public.gl_journal_entries(company_id);
CREATE INDEX idx_ar_customers_company ON public.ar_customers(company_id);
CREATE INDEX idx_ar_invoices_company ON public.ar_invoices(company_id);
CREATE INDEX idx_ap_vendors_company ON public.ap_vendors(company_id);
CREATE INDEX idx_ap_bills_company ON public.ap_bills(company_id);
CREATE INDEX idx_expenses_company ON public.expenses(company_id);
CREATE INDEX idx_payroll_employees_company ON public.payroll_employees(company_id);