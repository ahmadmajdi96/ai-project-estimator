import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskFeedback {
  id: string;
  task_id: string;
  user_id: string | null;
  feedback_type: 'comment' | 'approval' | 'rejection' | 'request_changes';
  content: string;
  is_approved: boolean | null;
  created_at: string;
  updated_at: string;
}

export function useTaskFeedback(taskId: string) {
  return useQuery({
    queryKey: ['task-feedback', taskId],
    queryFn: async () => {
      if (!taskId) return [];
      const { data, error } = await supabase
        .from('task_feedback')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as TaskFeedback[];
    },
    enabled: !!taskId,
  });
}

export function useAddTaskFeedback() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (feedback: {
      task_id: string;
      content: string;
      feedback_type?: 'comment' | 'approval' | 'rejection' | 'request_changes';
      user_id?: string;
      is_approved?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('task_feedback')
        .insert({
          ...feedback,
          feedback_type: feedback.feedback_type || 'comment',
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task-feedback', variables.task_id] });
      toast.success('Feedback added');
    },
    onError: (error) => {
      toast.error('Failed to add feedback: ' + error.message);
    },
  });
}

export function useApproveTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, userId, comment }: { taskId: string; userId?: string; comment: string }) => {
      // Add approval feedback
      await supabase
        .from('task_feedback')
        .insert({
          task_id: taskId,
          user_id: userId,
          feedback_type: 'approval',
          content: comment || 'Task approved',
          is_approved: true,
        });
      
      // Update task approval status
      const { data, error } = await supabase
        .from('tasks')
        .update({
          approval_status: 'approved',
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-feedback', variables.taskId] });
      toast.success('Task approved');
    },
    onError: (error) => {
      toast.error('Failed to approve task: ' + error.message);
    },
  });
}

export function useRejectTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, userId, reason }: { taskId: string; userId?: string; reason: string }) => {
      // Add rejection feedback
      await supabase
        .from('task_feedback')
        .insert({
          task_id: taskId,
          user_id: userId,
          feedback_type: 'rejection',
          content: reason,
          is_approved: false,
        });
      
      // Update task approval status
      const { data, error } = await supabase
        .from('tasks')
        .update({
          approval_status: 'rejected',
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-feedback', variables.taskId] });
      toast.success('Task rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject task: ' + error.message);
    },
  });
}

export function useRequestTaskChanges() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ taskId, userId, changes }: { taskId: string; userId?: string; changes: string }) => {
      // Add change request feedback
      await supabase
        .from('task_feedback')
        .insert({
          task_id: taskId,
          user_id: userId,
          feedback_type: 'request_changes',
          content: changes,
        });
      
      // Update task approval status
      const { data, error } = await supabase
        .from('tasks')
        .update({
          approval_status: 'changes_requested',
        })
        .eq('id', taskId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-feedback', variables.taskId] });
      toast.success('Changes requested');
    },
    onError: (error) => {
      toast.error('Failed to request changes: ' + error.message);
    },
  });
}
