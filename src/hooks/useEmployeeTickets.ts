import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmployeeTicket {
  id: string;
  employee_id: string | null;
  ticket_number: string;
  category: string;
  subject: string;
  description: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
  department_id: string | null;
  attachments: any[];
  resolution: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  is_escalated: boolean;
  escalated_at: string | null;
  escalation_reason: string | null;
  due_date: string | null;
  sla_breach: boolean;
  first_response_at: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string | null;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export function useEmployeeTickets(employeeId?: string) {
  return useQuery({
    queryKey: ['employee_tickets', employeeId],
    queryFn: async () => {
      let query = supabase
        .from('employee_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeeTicket[];
    },
  });
}

export function useTicketComments(ticketId: string) {
  return useQuery({
    queryKey: ['ticket_comments', ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as TicketComment[];
    },
    enabled: !!ticketId,
  });
}

export function useAddEmployeeTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ticket: Omit<EmployeeTicket, 'id' | 'created_at' | 'updated_at' | 'ticket_number'>) => {
      const ticketNumber = `TKT-${Date.now().toString(36).toUpperCase()}`;
      const { data, error } = await supabase
        .from('employee_tickets')
        .insert([{ ...ticket, ticket_number: ticketNumber }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_tickets'] });
      toast.success('Ticket created successfully');
    },
    onError: (error) => toast.error('Failed to create ticket: ' + error.message),
  });
}

export function useUpdateEmployeeTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeTicket> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_tickets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_tickets'] });
      toast.success('Ticket updated');
    },
    onError: (error) => toast.error('Failed to update ticket: ' + error.message),
  });
}

export function useAddTicketComment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (comment: Omit<TicketComment, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('ticket_comments')
        .insert([comment])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ticket_comments', variables.ticket_id] });
      toast.success('Comment added');
    },
    onError: (error) => toast.error('Failed to add comment: ' + error.message),
  });
}

export function useEscalateTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const { data, error } = await supabase
        .from('employee_tickets')
        .update({
          is_escalated: true,
          escalated_at: new Date().toISOString(),
          escalation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_tickets'] });
      toast.success('Ticket escalated');
    },
    onError: (error) => toast.error('Failed to escalate ticket: ' + error.message),
  });
}

export function useResolveTicket() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, resolution, resolved_by }: { id: string; resolution: string; resolved_by?: string }) => {
      const { data, error } = await supabase
        .from('employee_tickets')
        .update({
          status: 'resolved',
          resolution,
          resolved_at: new Date().toISOString(),
          resolved_by,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_tickets'] });
      toast.success('Ticket resolved');
    },
    onError: (error) => toast.error('Failed to resolve ticket: ' + error.message),
  });
}
