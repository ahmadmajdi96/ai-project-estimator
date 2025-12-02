import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WorkflowDefinition {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  steps: string[];
  related_pages: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useWorkflowDefinitions() {
  return useQuery({
    queryKey: ['workflow-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .select('*')
        .order('category, name');
      
      if (error) throw error;
      return data as WorkflowDefinition[];
    },
  });
}