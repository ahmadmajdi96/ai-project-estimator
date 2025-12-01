import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SLAAgreement {
  id: string;
  client_id: string;
  name: string;
  description: string | null;
  metric_type: string;
  target_value: number;
  unit: string | null;
  measurement_period: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | null;
  is_active: boolean;
  created_at: string;
}

export interface SLAPerformance {
  id: string;
  sla_id: string;
  period_start: string;
  period_end: string;
  actual_value: number;
  target_met: boolean | null;
  notes: string | null;
  created_at: string;
  sla_agreements?: SLAAgreement;
}

export function useClientSLAs(clientId: string | undefined) {
  return useQuery({
    queryKey: ['sla_agreements', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('sla_agreements')
        .select('*')
        .eq('client_id', clientId)
        .order('name');
      if (error) throw error;
      return data as SLAAgreement[];
    },
    enabled: !!clientId,
  });
}

export function useSLAPerformance(slaId: string | undefined) {
  return useQuery({
    queryKey: ['sla_performance', slaId],
    queryFn: async () => {
      if (!slaId) return [];
      const { data, error } = await supabase
        .from('sla_performance')
        .select('*')
        .eq('sla_id', slaId)
        .order('period_start', { ascending: false });
      if (error) throw error;
      return data as SLAPerformance[];
    },
    enabled: !!slaId,
  });
}

export function useAddSLA() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sla: Partial<SLAAgreement>) => {
      const { data, error } = await supabase.from('sla_agreements').insert([sla as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['sla_agreements', vars.client_id] });
      toast.success('SLA created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useAddSLAPerformance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (perf: Partial<SLAPerformance>) => {
      const { data, error } = await supabase.from('sla_performance').insert([perf as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sla_performance'] });
      toast.success('Performance recorded');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
