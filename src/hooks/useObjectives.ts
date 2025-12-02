import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Objective {
  id: string;
  strategic_goal_id: string | null;
  scope: 'company' | 'department' | 'team';
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  owner_employee_id: string | null;
  status: 'not_started' | 'in_progress' | 'at_risk' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface KeyResult {
  id: string;
  objective_id: string;
  linked_kpi_id: string | null;
  title: string;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  status: 'on_track' | 'at_risk' | 'off_track' | 'achieved';
  created_at: string;
  updated_at: string;
}

export function useObjectives() {
  return useQuery({
    queryKey: ['objectives'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('objectives')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Objective[];
    },
  });
}

export function useKeyResults(objectiveId?: string) {
  return useQuery({
    queryKey: ['key-results', objectiveId],
    queryFn: async () => {
      let query = supabase.from('key_results').select('*');
      
      if (objectiveId) {
        query = query.eq('objective_id', objectiveId);
      }
      
      const { data, error } = await query.order('created_at');
      
      if (error) throw error;
      return data as KeyResult[];
    },
  });
}

export function useAddObjective() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (objective: Omit<Objective, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('objectives')
        .insert(objective)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['objectives'] });
      toast.success('Objective created');
    },
  });
}

export function useAddKeyResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (keyResult: Omit<KeyResult, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('key_results')
        .insert(keyResult)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      toast.success('Key result added');
    },
  });
}

export function useUpdateKeyResult() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<KeyResult> & { id: string }) => {
      const { data, error } = await supabase
        .from('key_results')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['key-results'] });
      toast.success('Key result updated');
    },
  });
}