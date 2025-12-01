import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyDocument {
  id: string;
  title: string;
  description: string | null;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  category: string;
  department_id: string | null;
  uploaded_by: string | null;
  is_active: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  departments?: { name: string } | null;
}

export function useCompanyDocuments(departmentId?: string) {
  return useQuery({
    queryKey: ['company_documents', departmentId],
    queryFn: async () => {
      let query = supabase
        .from('company_documents')
        .select(`*, departments:department_id(name)`)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (departmentId) {
        query = query.eq('department_id', departmentId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CompanyDocument[];
    },
  });
}

export function useAddCompanyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doc: {
      title: string;
      description?: string;
      file_path: string;
      file_type?: string;
      file_size?: number;
      category?: string;
      department_id?: string;
      tags?: string[];
    }) => {
      const { data, error } = await supabase
        .from('company_documents')
        .insert([doc])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_documents'] });
      toast.success('Document added');
    },
    onError: (error) => toast.error('Failed to add document: ' + error.message),
  });
}

export function useUpdateCompanyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CompanyDocument> & { id: string }) => {
      const { data, error } = await supabase
        .from('company_documents')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_documents'] });
      toast.success('Document updated');
    },
    onError: (error) => toast.error('Update failed: ' + error.message),
  });
}

export function useDeleteCompanyDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('company_documents')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company_documents'] });
      toast.success('Document deleted');
    },
    onError: (error) => toast.error('Delete failed: ' + error.message),
  });
}
