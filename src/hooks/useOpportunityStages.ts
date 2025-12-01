import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface OpportunityStage {
  id: string;
  name: string;
  value: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export function useOpportunityStages() {
  return useQuery({
    queryKey: ['opportunity_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunity_stages')
        .select('*')
        .order('sort_order');
      if (error) throw error;
      return data as OpportunityStage[];
    },
  });
}

export function useAddOpportunityStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (stage: { name: string; value: string; color?: string; sort_order?: number }) => {
      const { data, error } = await supabase.from('opportunity_stages').insert([stage]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity_stages'] });
      toast.success('Stage added');
    },
    onError: (error) => toast.error('Failed to add stage: ' + error.message),
  });
}

export function useUpdateOpportunityStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OpportunityStage> & { id: string }) => {
      const { data, error } = await supabase.from('opportunity_stages').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity_stages'] });
      toast.success('Stage updated');
    },
    onError: (error) => toast.error('Update failed: ' + error.message),
  });
}

export function useDeleteOpportunityStage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('opportunity_stages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunity_stages'] });
      toast.success('Stage deleted');
    },
    onError: (error) => toast.error('Delete failed: ' + error.message),
  });
}
