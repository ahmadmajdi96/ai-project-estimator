import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Invoice {
  id: string;
  invoice_number: string | null;
  client_id: string;
  opportunity_id: string | null;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
  line_items: any[];
  created_at: string;
  updated_at: string;
  clients?: { client_name: string } | null;
}

export interface Payment {
  id: string;
  invoice_id: string | null;
  client_id: string;
  amount: number;
  payment_method: string | null;
  payment_date: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invoices')
        .select(`*, clients(client_name)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Invoice[];
    },
  });
}

export function useClientInvoices(clientId: string | undefined) {
  return useQuery({
    queryKey: ['invoices', 'client', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useAddInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Partial<Invoice>) => {
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('invoices')
        .insert([{ ...invoice, invoice_number: invoiceNumber } as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Invoice> & { id: string }) => {
      const { data, error } = await supabase.from('invoices').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function usePayments(clientId?: string) {
  return useQuery({
    queryKey: ['payments', clientId],
    queryFn: async () => {
      let query = supabase.from('payments').select('*').order('payment_date', { ascending: false });
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Payment[];
    },
  });
}

export function useAddPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payment: Partial<Payment>) => {
      const { data, error } = await supabase.from('payments').insert([payment as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Payment recorded');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
