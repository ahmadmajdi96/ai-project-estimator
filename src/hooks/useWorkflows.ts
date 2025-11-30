import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WorkflowRule {
  id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  trigger_config: Record<string, any>;
  action_type: string;
  action_config: Record<string, any>;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkflowLog {
  id: string;
  workflow_rule_id: string | null;
  trigger_event: string;
  trigger_data: Record<string, any> | null;
  action_taken: string;
  action_result: Record<string, any> | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

export const TRIGGER_TYPES = [
  { value: 'stage_change', label: 'Sales Stage Changed', description: 'When a client moves to a different sales stage' },
  { value: 'status_change', label: 'Client Status Changed', description: 'When a client status is updated' },
  { value: 'quote_accepted', label: 'Quote Accepted', description: 'When a quote is marked as accepted' },
  { value: 'quote_sent', label: 'Quote Sent', description: 'When a quote is sent to a client' },
  { value: 'inactivity', label: 'Client Inactivity', description: 'When a client has no activity for X days' },
  { value: 'new_client', label: 'New Client Created', description: 'When a new client is added to the system' },
];

export const ACTION_TYPES = [
  { value: 'create_task', label: 'Create Task', description: 'Automatically create a follow-up task' },
  { value: 'send_reminder', label: 'Create Reminder', description: 'Schedule a reminder notification' },
  { value: 'update_status', label: 'Update Status', description: 'Change client status automatically' },
  { value: 'assign_salesman', label: 'Assign Salesman', description: 'Auto-assign a salesman to the client' },
  { value: 'log_activity', label: 'Log Activity', description: 'Record an activity in the system' },
];

export const useWorkflowRules = () => {
  return useQuery({
    queryKey: ['workflow_rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_rules')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as WorkflowRule[];
    },
  });
};

export const useWorkflowLogs = (limit = 50) => {
  return useQuery({
    queryKey: ['workflow_logs', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as WorkflowLog[];
    },
  });
};

export const useAddWorkflowRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (rule: Omit<WorkflowRule, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('workflow_rules')
        .insert([rule])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_rules'] });
      toast({ title: 'Workflow rule created successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating workflow rule', description: error.message, variant: 'destructive' });
    },
  });
};

export const useUpdateWorkflowRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<WorkflowRule> & { id: string }) => {
      const { data, error } = await supabase
        .from('workflow_rules')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_rules'] });
      toast({ title: 'Workflow rule updated successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating workflow rule', description: error.message, variant: 'destructive' });
    },
  });
};

export const useDeleteWorkflowRule = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('workflow_rules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_rules'] });
      toast({ title: 'Workflow rule deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting workflow rule', description: error.message, variant: 'destructive' });
    },
  });
};

export const useLogWorkflowExecution = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (log: Omit<WorkflowLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('workflow_logs')
        .insert([log])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow_logs'] });
    },
  });
};
