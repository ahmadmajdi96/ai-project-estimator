import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { CalendarEvent } from '@/types/crm';
import type { Database } from '@/integrations/supabase/types';

type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert'];
type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update'];

export function useEmployeeCalendarEvents(employeeId?: string) {
  return useQuery({
    queryKey: ['employee_calendar_events', employeeId],
    queryFn: async () => {
      // If we have an employee ID, filter by salesman_id (which maps to employee)
      // Otherwise return all events for the current user
      let query = supabase
        .from('calendar_events')
        .select('*')
        .order('start_datetime', { ascending: true });
      
      if (employeeId) {
        query = query.eq('salesman_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as CalendarEvent[];
    },
    enabled: true,
  });
}

export function useAddEmployeeCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (event: CalendarEventInsert) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(event)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      toast.success('Event created');
    },
    onError: (error) => {
      toast.error('Failed to create event: ' + error.message);
    },
  });
}

export function useUpdateEmployeeCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: CalendarEventUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      toast.success('Event updated');
    },
    onError: (error) => {
      toast.error('Failed to update event: ' + error.message);
    },
  });
}

export function useDeleteEmployeeCalendarEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_calendar_events'] });
      queryClient.invalidateQueries({ queryKey: ['calendar_events'] });
      toast.success('Event deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete event: ' + error.message);
    },
  });
}
