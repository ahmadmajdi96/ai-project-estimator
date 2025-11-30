import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIAgentConfig {
  id: string;
  name: string;
  system_prompt: string | null;
  personality: string | null;
  rules: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export function useAIConfigs() {
  return useQuery({
    queryKey: ['ai-configs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_agent_config')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AIAgentConfig[];
    },
  });
}

export function useAddAIConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (config: Partial<AIAgentConfig>) => {
      const { data, error } = await supabase
        .from('ai_agent_config')
        .insert(config)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
      toast.success('AI configuration saved');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateAIConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AIAgentConfig>) => {
      const { data, error } = await supabase
        .from('ai_agent_config')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
      toast.success('AI configuration updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteAIConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_agent_config').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-configs'] });
      toast.success('AI configuration deleted');
    },
    onError: (error) => toast.error(error.message),
  });
}
