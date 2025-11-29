import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface SalesmanDocument {
  id: string;
  salesman_id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

export function useSalesmanDocuments(salesmanId?: string) {
  return useQuery({
    queryKey: ['salesman_documents', salesmanId],
    queryFn: async () => {
      if (!salesmanId) return [];
      const { data, error } = await supabase
        .from('salesman_documents')
        .select('*')
        .eq('salesman_id', salesmanId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as SalesmanDocument[];
    },
    enabled: !!salesmanId,
  });
}

export function useUploadSalesmanDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ salesmanId, file, documentName }: { salesmanId: string; file: File; documentName: string }) => {
      // Upload file to storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${salesmanId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('salesman-documents')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Save document record
      const { data, error } = await supabase
        .from('salesman_documents')
        .insert({
          salesman_id: salesmanId,
          name: documentName,
          file_path: filePath,
          file_type: file.type,
          file_size: file.size,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { salesmanId }) => {
      queryClient.invalidateQueries({ queryKey: ['salesman_documents', salesmanId] });
      toast.success('Document uploaded');
    },
    onError: (error) => {
      toast.error('Failed to upload document: ' + error.message);
    },
  });
}

export function useDeleteSalesmanDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, filePath, salesmanId }: { id: string; filePath: string; salesmanId: string }) => {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('salesman-documents')
        .remove([filePath]);
      
      if (storageError) throw storageError;
      
      // Delete record
      const { error } = await supabase
        .from('salesman_documents')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return salesmanId;
    },
    onSuccess: (salesmanId) => {
      queryClient.invalidateQueries({ queryKey: ['salesman_documents', salesmanId] });
      toast.success('Document deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete document: ' + error.message);
    },
  });
}

export function getDocumentUrl(filePath: string) {
  const { data } = supabase.storage.from('salesman-documents').getPublicUrl(filePath);
  return data.publicUrl;
}