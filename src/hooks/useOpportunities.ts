import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Opportunity {
  id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  value: number;
  deal_probability: number;
  lead_source: string;
  sales_stage: string;
  salesman_id: string | null;
  expected_close_date: string | null;
  actual_close_date: string | null;
  status: 'open' | 'won' | 'lost' | 'on_hold';
  win_loss_reason_id: string | null;
  win_loss_notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: { client_name: string } | null;
  salesmen?: { name: string } | null;
}

export function useOpportunities() {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select(`*, clients(client_name), salesmen(name)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Opportunity[];
    },
  });
}

export function useClientOpportunities(clientId: string | undefined) {
  return useQuery({
    queryKey: ['opportunities', 'client', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('opportunities')
        .select(`*, salesmen(name)`)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useAddOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (opp: Partial<Opportunity>) => {
      const { data, error } = await supabase.from('opportunities').insert([opp as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Opportunity created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Opportunity> & { id: string }) => {
      const { data, error } = await supabase.from('opportunities').update(updates as any).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast.success('Opportunity updated');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useWinLossReasons() {
  return useQuery({
    queryKey: ['win_loss_reasons'],
    queryFn: async () => {
      const { data, error } = await supabase.from('win_loss_reasons').select('*').eq('is_active', true);
      if (error) throw error;
      return data;
    },
  });
}
