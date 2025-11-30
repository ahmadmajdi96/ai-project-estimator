import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StatusConfig {
  id: string;
  name: string;
  value: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export function useStatusConfigs() {
  return useQuery({
    queryKey: ['client_status_configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_status_configs')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as StatusConfig[];
    },
  });
}

export function useAddStatusConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (status: { name: string; value: string; color?: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from('client_status_configs')
        .insert([status])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_status_configs'] });
      toast.success('Status config added');
    },
    onError: (error) => {
      toast.error('Failed to add status: ' + error.message);
    },
  });
}

export function useUpdateStatusConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StatusConfig> & { id: string }) => {
      const { data, error } = await supabase
        .from('client_status_configs')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_status_configs'] });
      toast.success('Status updated');
    },
    onError: (error) => {
      toast.error('Update failed: ' + error.message);
    },
  });
}

export function useDeleteStatusConfig() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_status_configs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_status_configs'] });
      toast.success('Status deleted');
    },
    onError: (error) => {
      toast.error('Delete failed: ' + error.message);
    },
  });
}