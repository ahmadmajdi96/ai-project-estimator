import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface EmployeeRequest {
  id: string;
  employee_id: string | null;
  request_type: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SalarySlip {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  basic_salary: number;
  allowances: number;
  bonuses: number;
  gross_salary: number;
  tax_deduction: number;
  insurance_deduction: number;
  pension_deduction: number;
  other_deductions: number;
  total_deductions: number;
  net_salary: number;
  payment_date: string | null;
  payment_status: string;
  notes: string | null;
  created_at: string;
}

// Task Comments
export function useTaskComments(taskId: string) {
  return useQuery({
    queryKey: ['task_comments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_comments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as TaskComment[];
    },
    enabled: !!taskId,
  });
}

export function useAddTaskComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comment: { task_id: string; content: string; user_id?: string }) => {
      const { data, error } = await supabase
        .from('task_comments')
        .insert([comment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task_comments', variables.task_id] });
      toast.success('Comment added');
    },
    onError: (error) => toast.error('Failed to add comment: ' + error.message),
  });
}

export function useDeleteTaskComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, task_id }: { id: string; task_id: string }) => {
      const { error } = await supabase.from('task_comments').delete().eq('id', id);
      if (error) throw error;
      return task_id;
    },
    onSuccess: (task_id) => {
      queryClient.invalidateQueries({ queryKey: ['task_comments', task_id] });
      toast.success('Comment deleted');
    },
    onError: (error) => toast.error('Failed to delete comment: ' + error.message),
  });
}

// Task Attachments
export function useTaskAttachments(taskId: string) {
  return useQuery({
    queryKey: ['task_attachments', taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TaskAttachment[];
    },
    enabled: !!taskId,
  });
}

export function useAddTaskAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (attachment: { 
      task_id: string; 
      file_name: string; 
      file_url: string;
      file_type?: string;
      file_size?: number;
      uploaded_by?: string;
    }) => {
      const { data, error } = await supabase
        .from('task_attachments')
        .insert([attachment])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task_attachments', variables.task_id] });
      toast.success('File attached');
    },
    onError: (error) => toast.error('Failed to attach file: ' + error.message),
  });
}

export function useDeleteTaskAttachment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, task_id }: { id: string; task_id: string }) => {
      const { error } = await supabase.from('task_attachments').delete().eq('id', id);
      if (error) throw error;
      return task_id;
    },
    onSuccess: (task_id) => {
      queryClient.invalidateQueries({ queryKey: ['task_attachments', task_id] });
      toast.success('Attachment deleted');
    },
    onError: (error) => toast.error('Failed to delete attachment: ' + error.message),
  });
}

// Employee Requests
export function useEmployeeRequests(employeeId?: string) {
  return useQuery({
    queryKey: ['employee_requests', employeeId],
    queryFn: async () => {
      let query = supabase.from('employee_requests').select('*').order('created_at', { ascending: false });
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query;
      if (error) throw error;
      return data as EmployeeRequest[];
    },
  });
}

export function useAddEmployeeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (request: {
      employee_id?: string;
      request_type: string;
      title: string;
      description?: string;
      priority?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_requests')
        .insert([request])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
      toast.success('Request submitted');
    },
    onError: (error) => toast.error('Failed to submit request: ' + error.message),
  });
}

export function useUpdateEmployeeRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EmployeeRequest> & { id: string }) => {
      const { data, error } = await supabase
        .from('employee_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
      toast.success('Request updated');
    },
    onError: (error) => toast.error('Failed to update request: ' + error.message),
  });
}

// Salary Slips
export function useSalarySlips(employeeId?: string) {
  return useQuery({
    queryKey: ['salary_slips', employeeId],
    queryFn: async () => {
      let query = supabase.from('salary_slips').select('*').order('period_end', { ascending: false });
      if (employeeId) query = query.eq('employee_id', employeeId);
      const { data, error } = await query;
      if (error) throw error;
      return data as SalarySlip[];
    },
  });
}

export function useAddSalarySlip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (slip: Omit<SalarySlip, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('salary_slips')
        .insert([slip])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salary_slips'] });
      toast.success('Salary slip created');
    },
    onError: (error) => toast.error('Failed to create salary slip: ' + error.message),
  });
}
