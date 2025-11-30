import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIDecision {
  id: string;
  user_id: string | null;
  title: string;
  description: string;
  context: string | null;
  options: Array<{ name: string; description: string }>;
  ai_analysis: {
    recommendation?: string;
    advantages?: string[];
    disadvantages?: string[];
    risk_score?: number;
    risk_factors?: string[];
    confidence?: number;
  };
  status: string;
  final_decision: string | null;
  created_at: string;
  updated_at: string;
}

export function useAIDecisions() {
  return useQuery({
    queryKey: ['ai-decisions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AIDecision[];
    },
  });
}

export function useAddAIDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (decision: {
      title: string;
      description: string;
      context?: string | null;
      options?: Array<{ name: string; description: string }>;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .insert({
          title: decision.title,
          description: decision.description,
          context: decision.context || null,
          options: decision.options || [],
          status: decision.status || 'pending',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-decisions'] });
      toast.success('Decision saved');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateAIDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AIDecision>) => {
      const { data, error } = await supabase
        .from('ai_decisions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-decisions'] });
      toast.success('Decision updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteAIDecision() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('ai_decisions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-decisions'] });
      toast.success('Decision deleted');
    },
    onError: (error) => toast.error(error.message),
  });
}
