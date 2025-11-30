import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PipelineStage {
  id: string;
  name: string;
  value: string;
  color: string;
  sort_order: number;
  created_at: string;
}

export function usePipelineStages() {
  return useQuery({
    queryKey: ['pipeline_stages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .select('*')
        .order('sort_order');
      
      if (error) throw error;
      return data as PipelineStage[];
    },
  });
}

export function useAddPipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (stage: { name: string; value: string; color?: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .insert([stage])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] });
      toast.success('Pipeline stage added');
    },
    onError: (error) => {
      toast.error('Failed to add stage: ' + error.message);
    },
  });
}

export function useUpdatePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PipelineStage> & { id: string }) => {
      const { data, error } = await supabase
        .from('pipeline_stages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] });
      toast.success('Stage updated');
    },
    onError: (error) => {
      toast.error('Update failed: ' + error.message);
    },
  });
}

export function useDeletePipelineStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('pipeline_stages').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline_stages'] });
      toast.success('Stage deleted');
    },
    onError: (error) => {
      toast.error('Delete failed: ' + error.message);
    },
  });
}