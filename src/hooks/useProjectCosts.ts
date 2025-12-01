import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectCost {
  id: string;
  client_id: string;
  opportunity_id: string | null;
  cost_type: 'labor' | 'materials' | 'software' | 'travel' | 'subcontractor' | 'overhead' | 'other' | null;
  description: string;
  estimated_cost: number;
  actual_cost: number;
  incurred_date: string | null;
  employee_id: string | null;
  created_at: string;
}

export function useProjectCosts(clientId?: string, opportunityId?: string) {
  return useQuery({
    queryKey: ['project_costs', clientId, opportunityId],
    queryFn: async () => {
      let query = supabase.from('project_costs').select('*');
      if (clientId) query = query.eq('client_id', clientId);
      if (opportunityId) query = query.eq('opportunity_id', opportunityId);
      const { data, error } = await query.order('incurred_date', { ascending: false });
      if (error) throw error;
      return data as ProjectCost[];
    },
    enabled: !!clientId || !!opportunityId,
  });
}

export function useAddProjectCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cost: Partial<ProjectCost>) => {
      const { data, error } = await supabase.from('project_costs').insert([cost as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_costs'] });
      toast.success('Cost recorded');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateProjectCost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectCost> & { id: string }) => {
      const { data, error } = await supabase.from('project_costs').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_costs'] });
      toast.success('Cost updated');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
