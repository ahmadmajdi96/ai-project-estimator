import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContractAmendment {
  id: string;
  client_id: string;
  amendment_type: 'scope_change' | 'value_change' | 'term_extension' | 'term_reduction' | 'cancellation' | 'other' | null;
  description: string;
  previous_value: number | null;
  new_value: number | null;
  previous_end_date: string | null;
  new_end_date: string | null;
  effective_date: string | null;
  approved_by: string | null;
  created_at: string;
}

export function useContractAmendments(clientId: string | undefined) {
  return useQuery({
    queryKey: ['contract_amendments', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('contract_amendments')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ContractAmendment[];
    },
    enabled: !!clientId,
  });
}

export function useAddContractAmendment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amendment: Partial<ContractAmendment>) => {
      const { data, error } = await supabase.from('contract_amendments').insert([amendment as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['contract_amendments', vars.client_id] });
      toast.success('Amendment recorded');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
