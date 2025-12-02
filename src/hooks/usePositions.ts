import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Position {
  id: string;
  title: string;
  department_id: string | null;
  description: string | null;
  responsibilities: string[] | null;
  required_skills: string[] | null;
  seniority_level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Director' | null;
  created_at: string;
  updated_at: string;
}

export interface JobDescription {
  id: string;
  position_id: string;
  summary: string | null;
  responsibilities: string[] | null;
  required_skills: string[] | null;
  ideal_profile: string | null;
  additional_requirements: string | null;
  created_at: string;
  updated_at: string;
}

export function usePositions() {
  return useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('positions')
        .select('*')
        .order('title');
      
      if (error) throw error;
      return data as Position[];
    },
  });
}

export function useAddPosition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (position: {
      title: string;
      department_id?: string;
      description?: string;
      responsibilities?: string[];
      required_skills?: string[];
      seniority_level?: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Director';
    }) => {
      const { data, error } = await supabase
        .from('positions')
        .insert(position)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add position: ' + error.message);
    },
  });
}

export function useUpdatePosition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Position> & { id: string }) => {
      const { data, error } = await supabase
        .from('positions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position updated');
    },
    onError: (error) => {
      toast.error('Failed to update position: ' + error.message);
    },
  });
}

export function useDeletePosition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('positions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      toast.success('Position deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete position: ' + error.message);
    },
  });
}

export function useJobDescription(positionId?: string) {
  return useQuery({
    queryKey: ['job-description', positionId],
    queryFn: async () => {
      if (!positionId) return null;
      
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('position_id', positionId)
        .maybeSingle();
      
      if (error) throw error;
      return data as JobDescription | null;
    },
    enabled: !!positionId,
  });
}

export function useUpsertJobDescription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (jobDesc: {
      position_id: string;
      summary?: string;
      responsibilities?: string[];
      required_skills?: string[];
      ideal_profile?: string;
      additional_requirements?: string;
    }) => {
      const { data, error } = await supabase
        .from('job_descriptions')
        .upsert(jobDesc)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-description'] });
      toast.success('Job description saved');
    },
    onError: (error) => {
      toast.error('Failed to save job description: ' + error.message);
    },
  });
}
