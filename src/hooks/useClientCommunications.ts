import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientCommunication {
  id: string;
  client_id: string;
  communication_type: 'call' | 'email' | 'meeting' | 'video_call' | 'sms' | 'chat' | 'letter';
  subject: string | null;
  content: string | null;
  sentiment: 'positive' | 'neutral' | 'negative' | null;
  direction: 'inbound' | 'outbound' | null;
  contact_person: string | null;
  salesman_id: string | null;
  duration_minutes: number | null;
  communication_date: string;
  created_at: string;
  salesmen?: { name: string } | null;
}

export function useClientCommunications(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client_communications', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('client_communications')
        .select(`*, salesmen(name)`)
        .eq('client_id', clientId)
        .order('communication_date', { ascending: false });
      if (error) throw error;
      return data as ClientCommunication[];
    },
    enabled: !!clientId,
  });
}

export function useAddClientCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comm: Partial<ClientCommunication>) => {
      const { data, error } = await supabase.from('client_communications').insert([comm as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['client_communications', vars.client_id] });
      toast.success('Communication logged');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useDeleteClientCommunication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase.from('client_communications').delete().eq('id', id);
      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['client_communications', clientId] });
      toast.success('Communication deleted');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
