import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  department_id: string | null;
  roadmap_id: string | null;
  strategic_goal_id: string | null;
  target_date: string | null;
  start_date: string | null;
  due_date: string | null;
  status: string;
  progress: number | null;
  owner_team_id: string | null;
  owner_employee_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useMilestones(roadmapId?: string) {
  return useQuery({
    queryKey: ['milestones', roadmapId],
    queryFn: async () => {
      let query = supabase
        .from('milestones')
        .select('*')
        .order('target_date');
      
      if (roadmapId) {
        query = query.eq('roadmap_id', roadmapId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Milestone[];
    },
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (milestone: {
      roadmap_id?: string;
      title: string;
      description?: string;
      start_date?: string;
      due_date?: string;
      target_date?: string;
      status?: string;
      owner_team_id?: string;
      owner_employee_id?: string;
      strategic_goal_id?: string;
      department_id?: string;
      progress?: number;
    }) => {
      const { data, error} = await supabase
        .from('milestones')
        .insert({
          ...milestone,
          status: milestone.status || 'not_started',
          progress: milestone.progress || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success('Milestone created');
    },
    onError: (error) => {
      toast.error('Failed to create milestone: ' + error.message);
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Milestone> & { id: string }) => {
      const { data, error } = await supabase
        .from('milestones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success('Milestone updated');
    },
    onError: (error) => {
      toast.error('Failed to update milestone: ' + error.message);
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      toast.success('Milestone deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete milestone: ' + error.message);
    },
  });
}
