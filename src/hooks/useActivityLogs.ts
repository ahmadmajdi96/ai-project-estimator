import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ActivityLog {
  id: string;
  activity_type: string;
  entity_type: string;
  entity_id: string;
  description: string | null;
  metadata: Record<string, any>;
  performed_by: string | null;
  created_at: string;
}

export const ACTIVITY_TYPES = [
  { value: 'email_sent', label: 'Email Sent', icon: 'Mail' },
  { value: 'email_opened', label: 'Email Opened', icon: 'MailOpen' },
  { value: 'call_made', label: 'Call Made', icon: 'Phone' },
  { value: 'meeting_scheduled', label: 'Meeting Scheduled', icon: 'Calendar' },
  { value: 'note_added', label: 'Note Added', icon: 'FileText' },
  { value: 'stage_changed', label: 'Stage Changed', icon: 'ArrowRight' },
  { value: 'status_changed', label: 'Status Changed', icon: 'RefreshCw' },
  { value: 'quote_created', label: 'Quote Created', icon: 'FileText' },
  { value: 'quote_sent', label: 'Quote Sent', icon: 'Send' },
  { value: 'quote_accepted', label: 'Quote Accepted', icon: 'CheckCircle' },
  { value: 'task_created', label: 'Task Created', icon: 'ListTodo' },
  { value: 'task_completed', label: 'Task Completed', icon: 'CheckSquare' },
];

export const useActivityLogs = (entityType?: string, entityId?: string, limit = 50) => {
  return useQuery({
    queryKey: ['activity_logs', entityType, entityId, limit],
    queryFn: async () => {
      let query = supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (entityType) {
        query = query.eq('entity_type', entityType);
      }
      if (entityId) {
        query = query.eq('entity_id', entityId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
};

export const useRecentActivityLogs = (limit = 20) => {
  return useQuery({
    queryKey: ['activity_logs', 'recent', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as ActivityLog[];
    },
  });
};

export const useLogActivity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: Omit<ActivityLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('activity_logs')
        .insert([log])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity_logs'] });
    },
  });
};
