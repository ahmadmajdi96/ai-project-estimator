import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  context: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useAIRecommendations() {
  return useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AIRecommendation[];
    },
  });
}

export function useUpdateAIRecommendation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AIRecommendation>) => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast.success('Recommendation updated');
    },
    onError: (error) => toast.error(error.message),
  });
}
