import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Department {
  id: string;
  name: string;
  description: string | null;
  head_id: string | null;
  parent_department_id: string | null;
  budget: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Department[];
    },
  });
}

export function useDepartment(id: string | undefined) {
  return useQuery({
    queryKey: ['departments', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Department;
    },
    enabled: !!id,
  });
}

export function useAddDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (dept: { name: string; description?: string; color?: string; budget?: number }) => {
      const { data, error } = await supabase
        .from('departments')
        .insert(dept)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department created');
    },
    onError: (error) => {
      toast.error('Failed to create department: ' + error.message);
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Department> & { id: string }) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department updated');
    },
    onError: (error) => {
      toast.error('Failed to update department: ' + error.message);
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      toast.success('Department deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete department: ' + error.message);
    },
  });
}
