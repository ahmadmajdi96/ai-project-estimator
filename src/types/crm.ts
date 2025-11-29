export type ClientStatus = 'prospect' | 'active' | 'inactive' | 'former';
export type SalesStage = 'pre_sales' | 'negotiation' | 'closing' | 'post_sales' | 'support';
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type CallType = 'incoming' | 'outgoing';
export type EventType = 'meeting' | 'call' | 'follow_up' | 'task';

export interface Client {
  id: string;
  client_name: string;
  contact_person: string | null;
  email: string | null;
  phone: string | null;
  industry: string | null;
  status: ClientStatus;
  sales_stage: SalesStage;
  contract_value: number;
  revenue_to_date: number;
  contract_start_date: string | null;
  contract_end_date: string | null;
  last_meeting_date: string | null;
  last_contact: string | null;
  meeting_notes: string | null;
  website: string | null;
  first_contact_date: string | null;
  notes: string | null;
  follow_up_needed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  client_id: string | null;
  title: string;
  status: QuoteStatus;
  components: any[];
  subtotal: number;
  discount_percent: number;
  discount_amount: number;
  total: number;
  profit_margin: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallLog {
  id: string;
  client_id: string;
  call_date: string;
  call_duration: number | null;
  summary: string | null;
  call_type: CallType;
  follow_up_action: string | null;
  assigned_to: string | null;
  created_at: string;
}

export interface ClientNote {
  id: string;
  client_id: string;
  note_text: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CalendarEvent {
  id: string;
  client_id: string | null;
  title: string;
  start_datetime: string;
  end_datetime: string;
  location: string | null;
  event_type: EventType;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const CLIENT_STATUSES: { value: ClientStatus; label: string; color: string }[] = [
  { value: 'prospect', label: 'Prospect', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'active', label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'inactive', label: 'Inactive', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  { value: 'former', label: 'Former', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
];

export const SALES_STAGES: { value: SalesStage; label: string; color: string }[] = [
  { value: 'pre_sales', label: 'Pre-Sales', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  { value: 'closing', label: 'Closing', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
  { value: 'post_sales', label: 'Post-Sales', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  { value: 'support', label: 'Support', color: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
];

export const QUOTE_STATUSES: { value: QuoteStatus; label: string; color: string }[] = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { value: 'accepted', label: 'Accepted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
];

export const EVENT_TYPES: { value: EventType; label: string; color: string }[] = [
  { value: 'meeting', label: 'Meeting', color: '#06b6d4' },
  { value: 'call', label: 'Call', color: '#8b5cf6' },
  { value: 'follow_up', label: 'Follow-up', color: '#f59e0b' },
  { value: 'task', label: 'Task', color: '#10b981' },
];

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Legal',
  'Tourism',
  'Retail',
  'Manufacturing',
  'Education',
  'Real Estate',
  'Other',
];
