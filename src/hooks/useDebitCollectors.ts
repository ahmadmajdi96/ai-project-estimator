import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DebitCollector {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  hire_date: string | null;
  target_amount: number;
  commission_rate: number;
  status: string;
  avatar_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export function useDebitCollectors() {
  return useQuery({
    queryKey: ['debit_collectors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debit_collectors')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as DebitCollector[];
    },
  });
}

export function useAddDebitCollector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (collector: Omit<DebitCollector, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('debit_collectors').insert([collector]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit_collectors'] });
      toast.success('Collector added');
    },
    onError: (error) => toast.error('Failed to add collector: ' + error.message),
  });
}

export function useUpdateDebitCollector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DebitCollector> & { id: string }) => {
      const { data, error } = await supabase.from('debit_collectors').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit_collectors'] });
      toast.success('Collector updated');
    },
    onError: (error) => toast.error('Update failed: ' + error.message),
  });
}

export function useDeleteDebitCollector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debit_collectors').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit_collectors'] });
      toast.success('Collector deleted');
    },
    onError: (error) => toast.error('Delete failed: ' + error.message),
  });
}
