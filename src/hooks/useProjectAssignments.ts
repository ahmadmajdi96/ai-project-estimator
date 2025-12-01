import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ProjectAssignment {
  id: string;
  employee_id: string;
  client_id: string | null;
  opportunity_id: string | null;
  role: string | null;
  allocation_percent: number;
  start_date: string | null;
  end_date: string | null;
  estimated_hours: number | null;
  actual_hours: number;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  created_at: string;
  updated_at: string;
  employees?: { position: string } | null;
  clients?: { client_name: string } | null;
}

export interface EmployeeCertification {
  id: string;
  employee_id: string;
  certification_name: string;
  issuing_organization: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  credential_id: string | null;
  status: 'active' | 'expired' | 'pending' | 'revoked';
  created_at: string;
}

export function useProjectAssignments(employeeId?: string) {
  return useQuery({
    queryKey: ['project_assignments', employeeId],
    queryFn: async () => {
      let query = supabase.from('project_assignments').select(`*, clients(client_name)`);
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query.order('start_date', { ascending: false });
      if (error) throw error;
      return data as ProjectAssignment[];
    },
  });
}

export function useEmployeeCertifications(employeeId?: string) {
  return useQuery({
    queryKey: ['employee_certifications', employeeId],
    queryFn: async () => {
      let query = supabase.from('employee_certifications').select('*');
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query.order('issue_date', { ascending: false });
      if (error) throw error;
      return data as EmployeeCertification[];
    },
  });
}

export function useAddProjectAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assignment: Partial<ProjectAssignment>) => {
      const { data, error } = await supabase.from('project_assignments').insert([assignment as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_assignments'] });
      toast.success('Assignment created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useAddEmployeeCertification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cert: Partial<EmployeeCertification>) => {
      const { data, error } = await supabase.from('employee_certifications').insert([cert as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_certifications'] });
      toast.success('Certification added');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useUpdateProjectAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProjectAssignment> & { id: string }) => {
      const { data, error } = await supabase.from('project_assignments').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project_assignments'] });
      toast.success('Assignment updated');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
