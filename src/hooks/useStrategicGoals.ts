import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StrategicGoal {
  id: string;
  scope: 'company' | 'department' | 'team';
  organization_id: string | null;
  department_id: string | null;
  team_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  owner_employee_id: string | null;
  status: 'not_started' | 'in_progress' | 'at_risk' | 'completed';
  created_at: string;
  updated_at: string;
}

export function useStrategicGoals() {
  return useQuery({
    queryKey: ['strategic-goals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('strategic_goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StrategicGoal[];
    },
  });
}

export function useAddStrategicGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (goal: Omit<StrategicGoal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('strategic_goals')
        .insert(goal)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success('Strategic goal created');
    },
    onError: (error) => {
      toast.error('Failed to create strategic goal: ' + error.message);
    },
  });
}

export function useUpdateStrategicGoal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<StrategicGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from('strategic_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success('Strategic goal updated');
    },
  });
}