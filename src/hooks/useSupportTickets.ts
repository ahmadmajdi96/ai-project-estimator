import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SupportTicket {
  id: string;
  ticket_number: string | null;
  client_id: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  category: string | null;
  assigned_to: string | null;
  resolution: string | null;
  resolution_time_hours: number | null;
  satisfaction_rating: number | null;
  satisfaction_feedback: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  clients?: { client_name: string } | null;
  employees?: { position: string } | null;
}

export function useSupportTickets() {
  return useQuery({
    queryKey: ['support_tickets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`*, clients(client_name)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SupportTicket[];
    },
  });
}

export function useClientSupportTickets(clientId: string | undefined) {
  return useQuery({
    queryKey: ['support_tickets', 'client', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!clientId,
  });
}

export function useAddSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: Partial<SupportTicket>) => {
      const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('support_tickets')
        .insert([{ ...ticket, ticket_number: ticketNumber } as any])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      toast.success('Ticket created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SupportTicket> & { id: string }) => {
      const { data, error } = await supabase.from('support_tickets').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support_tickets'] });
      toast.success('Ticket updated');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
