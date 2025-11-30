import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminder_type: string;
  due_date: string;
  is_completed: boolean;
  completed_at: string | null;
  priority: string;
  related_client_id: string | null;
  related_salesman_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  clients?: { client_name: string } | null;
  salesmen?: { name: string } | null;
}

export const REMINDER_TYPES = [
  { value: 'follow_up', label: 'Follow-up', color: '#f59e0b' },
  { value: 'meeting', label: 'Meeting', color: '#3b82f6' },
  { value: 'task', label: 'Task', color: '#10b981' },
  { value: 'deadline', label: 'Deadline', color: '#ef4444' },
  { value: 'custom', label: 'Custom', color: '#8b5cf6' },
];

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: '#6b7280' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export const useReminders = () => {
  return useQuery({
    queryKey: ['reminders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          clients:related_client_id(client_name),
          salesmen:related_salesman_id(name)
        `)
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as Reminder[];
    },
  });
};

export const useUpcomingReminders = (days = 7) => {
  return useQuery({
    queryKey: ['reminders', 'upcoming', days],
    queryFn: async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          clients:related_client_id(client_name),
          salesmen:related_salesman_id(name)
        `)
        .eq('is_completed', false)
        .lte('due_date', futureDate.toISOString())
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as Reminder[];
    },
  });
};

export const useOverdueReminders = () => {
  return useQuery({
    queryKey: ['reminders', 'overdue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reminders')
        .select(`
          *,
          clients:related_client_id(client_name),
          salesmen:related_salesman_id(name)
        `)
        .eq('is_completed', false)
        .lt('due_date', new Date().toISOString())
        .order('due_date', { ascending: true });
      if (error) throw error;
      return data as Reminder[];
    },
  });
};

export const useAddReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (reminder: Omit<Reminder, 'id' | 'created_at' | 'updated_at' | 'clients' | 'salesmen'>) => {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminder])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({ title: 'Reminder created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating reminder', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Reminder> & { id: string }) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({ title: 'Reminder updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating reminder', description: error.message, variant: 'destructive' });
    },
  });
};

export const useCompleteReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('reminders')
        .update({ 
          is_completed: true, 
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({ title: 'Reminder marked as complete' });
    },
    onError: (error: any) => {
      toast({ title: 'Error completing reminder', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast({ title: 'Reminder deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting reminder', description: error.message, variant: 'destructive' });
    },
  });
};
