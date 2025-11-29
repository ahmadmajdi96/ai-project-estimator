import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  department_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  departments?: {
    name: string;
  } | null;
}

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  department_id: string | null;
  target_date: string | null;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  created_at: string;
  updated_at: string;
  departments?: {
    name: string;
  } | null;
}

export function useRoadmaps() {
  return useQuery({
    queryKey: ['roadmaps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('roadmaps')
        .select(`
          *,
          departments:department_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Roadmap[];
    },
  });
}

export function useMilestones() {
  return useQuery({
    queryKey: ['milestones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('milestones')
        .select(`
          *,
          departments:department_id (name)
        `)
        .order('target_date');
      
      if (error) throw error;
      return data as Milestone[];
    },
  });
}

export function useAddRoadmap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (roadmap: { 
      title: string; 
      description?: string;
      department_id?: string;
      start_date?: string;
      end_date?: string;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('roadmaps')
        .insert(roadmap)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap created');
    },
    onError: (error) => {
      toast.error('Failed to create roadmap: ' + error.message);
    },
  });
}

export function useUpdateRoadmap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Roadmap> & { id: string }) => {
      const { data, error } = await supabase
        .from('roadmaps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap updated');
    },
    onError: (error) => {
      toast.error('Failed to update roadmap: ' + error.message);
    },
  });
}

export function useAddMilestone() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (milestone: { 
      title: string; 
      description?: string;
      department_id?: string;
      target_date?: string;
      status?: string;
      progress?: number;
    }) => {
      const { data, error } = await supabase
        .from('milestones')
        .insert(milestone)
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

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('roadmaps')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      toast.success('Roadmap deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete roadmap: ' + error.message);
    },
  });
}
