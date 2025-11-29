import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CallLog } from '@/types/crm';
import type { Database } from '@/integrations/supabase/types';

type CallLogInsert = Database['public']['Tables']['call_logs']['Insert'];

export function useCallLogs(clientId: string | undefined) {
  return useQuery({
    queryKey: ['call_logs', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('call_logs')
        .select('*')
        .eq('client_id', clientId)
        .order('call_date', { ascending: false });
      
      if (error) throw error;
      return data as CallLog[];
    },
    enabled: !!clientId,
  });
}

export function useAddCallLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (log: CallLogInsert) => {
      const { data, error } = await supabase
        .from('call_logs')
        .insert(log)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call_logs'] });
      toast.success('Call log added');
    },
    onError: (error) => {
      toast.error('Failed to add call log: ' + error.message);
    },
  });
}

export function useDeleteCallLog() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('call_logs')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call_logs'] });
      toast.success('Call log deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete call log: ' + error.message);
    },
  });
}
