import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Skill {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  created_at: string;
}

export interface EmployeeSkill {
  id: string;
  employee_id: string;
  skill_id: string;
  level: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
  last_evaluated_at: string | null;
  validated_by_employee_id: string | null;
  created_at: string;
  skills?: Skill;
}

export function useSkills() {
  return useQuery({
    queryKey: ['skills'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Skill[];
    },
  });
}

export function useAddSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skill: { name: string; category?: string; description?: string }) => {
      const { data, error } = await supabase
        .from('skills')
        .insert(skill)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add skill: ' + error.message);
    },
  });
}

export function useUpdateSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Skill> & { id: string }) => {
      const { data, error } = await supabase
        .from('skills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill updated');
    },
    onError: (error) => {
      toast.error('Failed to update skill: ' + error.message);
    },
  });
}

export function useDeleteSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('skills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['skills'] });
      toast.success('Skill deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete skill: ' + error.message);
    },
  });
}

export function useEmployeeSkills(employeeId?: string) {
  return useQuery({
    queryKey: ['employee-skills', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      
      const { data, error } = await supabase
        .from('employee_skills')
        .select('*, skills(*)')
        .eq('employee_id', employeeId);
      
      if (error) throw error;
      return data as EmployeeSkill[];
    },
    enabled: !!employeeId,
  });
}

export function useAddEmployeeSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (skillData: {
      employee_id: string;
      skill_id: string;
      level: 'Basic' | 'Intermediate' | 'Advanced' | 'Expert';
      last_evaluated_at?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_skills')
        .insert(skillData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills'] });
      toast.success('Skill added to employee');
    },
    onError: (error) => {
      toast.error('Failed to add skill: ' + error.message);
    },
  });
}

export function useUpdateEmployeeSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeSkill> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_skills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills'] });
      toast.success('Skill level updated');
    },
    onError: (error) => {
      toast.error('Failed to update skill: ' + error.message);
    },
  });
}

export function useDeleteEmployeeSkill() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employee_skills')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee-skills'] });
      toast.success('Skill removed from employee');
    },
    onError: (error) => {
      toast.error('Failed to remove skill: ' + error.message);
    },
  });
}
