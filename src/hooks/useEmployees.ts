import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Employee {
  id: string;
  user_id: string | null;
  department_id: string | null;
  employee_code: string | null;
  position: string | null;
  hire_date: string;
  salary: number | null;
  skills: string[] | null;
  status: 'active' | 'inactive' | 'on_leave';
  manager_id: string | null;
  created_at: string;
  updated_at: string;
  departments?: {
    name: string;
  } | null;
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          departments:department_id (name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Employee[];
    },
  });
}

export function useEmployee(id: string | undefined) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          departments:department_id (name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
  });
}

export function useAddEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emp: { 
      position: string; 
      department_id?: string; 
      employee_code?: string;
      salary?: number;
      skills?: string[];
    }) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(emp)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee added');
    },
    onError: (error) => {
      toast.error('Failed to add employee: ' + error.message);
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employee> & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated');
    },
    onError: (error) => {
      toast.error('Failed to update employee: ' + error.message);
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee removed');
    },
    onError: (error) => {
      toast.error('Failed to remove employee: ' + error.message);
    },
  });
}
