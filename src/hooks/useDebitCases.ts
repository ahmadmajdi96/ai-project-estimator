import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DebitCase {
  id: string;
  title: string;
  description: string | null;
  client_id: string | null;
  collector_id: string | null;
  original_amount: number;
  current_amount: number;
  collected_amount: number;
  stage: string;
  priority: string;
  due_date: string | null;
  last_contact_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: { client_name: string } | null;
  debit_collectors?: { name: string } | null;
}

export function useDebitCases() {
  return useQuery({
    queryKey: ['debit_cases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('debit_cases')
        .select('*, clients(client_name), debit_collectors(name)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as DebitCase[];
    },
  });
}

export function useAddDebitCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (debitCase: { title: string } & Partial<Omit<DebitCase, 'id' | 'created_at' | 'updated_at' | 'clients' | 'debit_collectors'>>) => {
      const { data, error } = await supabase.from('debit_cases').insert([debitCase]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit_cases'] });
      toast.success('Debit case added');
    },
    onError: (error) => toast.error('Failed to add case: ' + error.message),
  });
}

export function useUpdateDebitCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DebitCase> & { id: string }) => {
      const { data, error } = await supabase.from('debit_cases').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit_cases'] });
      toast.success('Case updated');
    },
    onError: (error) => toast.error('Update failed: ' + error.message),
  });
}

export function useDeleteDebitCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('debit_cases').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debit_cases'] });
      toast.success('Case deleted');
    },
    onError: (error) => toast.error('Delete failed: ' + error.message),
  });
}
