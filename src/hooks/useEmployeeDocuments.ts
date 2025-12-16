import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EmployeeDocument {
  id: string;
  employee_id: string;
  document_name: string;
  document_type: string | null;
  file_url: string;
  file_size: number | null;
  uploaded_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useEmployeeDocuments(employeeId: string | undefined) {
  return useQuery({
    queryKey: ['employee_documents', employeeId],
    queryFn: async () => {
      if (!employeeId) return [];
      const { data, error } = await supabase
        .from('employee_documents')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as EmployeeDocument[];
    },
    enabled: !!employeeId,
  });
}

export function useAddEmployeeDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (doc: {
      employee_id: string;
      document_name: string;
      document_type?: string;
      file_url: string;
      file_size?: number;
      uploaded_by?: string;
    }) => {
      const { data, error } = await supabase
        .from('employee_documents')
        .insert([doc])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employee_documents', variables.employee_id] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error('Failed to upload document: ' + error.message);
    },
  });
}

export function useDeleteEmployeeDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, employee_id }: { id: string; employee_id: string }) => {
      const { error } = await supabase
        .from('employee_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return employee_id;
    },
    onSuccess: (employee_id) => {
      queryClient.invalidateQueries({ queryKey: ['employee_documents', employee_id] });
      toast.success('Document deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete document: ' + error.message);
    },
  });
}

export async function uploadEmployeeFile(file: File, employeeId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${employeeId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('company-documents')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: urlData } = supabase.storage
    .from('company-documents')
    .getPublicUrl(data.path);
  
  return urlData.publicUrl;
}
