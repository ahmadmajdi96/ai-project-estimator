import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupportAgent {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  status: string;
  specialization: string | null;
  max_tickets: number;
  current_tickets: number;
  performance_score: number;
  total_resolved: number;
  avg_resolution_time: number;
  created_at: string;
  updated_at: string;
}

export function useSupportAgents() {
  return useQuery({
    queryKey: ['support_agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_agents')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as SupportAgent[];
    },
  });
}

export function useAddSupportAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (agent: { name: string; email?: string; phone?: string; specialization?: string; max_tickets?: number }) => {
      const { data, error } = await supabase.from('support_agents').insert([agent]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_agents'] });
      toast.success('Agent added');
    },
    onError: (error) => toast.error('Failed to add agent: ' + error.message),
  });
}

export function useUpdateSupportAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SupportAgent> & { id: string }) => {
      const { data, error } = await supabase
        .from('support_agents')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_agents'] });
      toast.success('Agent updated');
    },
    onError: (error) => toast.error('Update failed: ' + error.message),
  });
}

export function useDeleteSupportAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('support_agents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_agents'] });
      toast.success('Agent deleted');
    },
    onError: (error) => toast.error('Delete failed: ' + error.message),
  });
}
