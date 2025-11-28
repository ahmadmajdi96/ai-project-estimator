import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbComponent {
  id: string;
  name: string;
  description: string | null;
  category: string;
  base_cost: number;
  base_price: number;
  is_base: boolean | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export function useComponents() {
  return useQuery({
    queryKey: ['components'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('components')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as DbComponent[];
    },
  });
}

export function useAddComponent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (component: Omit<DbComponent, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('components')
        .insert(component)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component added');
    },
    onError: (error) => {
      toast.error('Failed to add component: ' + error.message);
    },
  });
}

export function useUpdateComponent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DbComponent> & { id: string }) => {
      const { data, error } = await supabase
        .from('components')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component updated');
    },
    onError: (error) => {
      toast.error('Failed to update component: ' + error.message);
    },
  });
}

export function useDeleteComponent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('components')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['components'] });
      toast.success('Component deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete component: ' + error.message);
    },
  });
}
