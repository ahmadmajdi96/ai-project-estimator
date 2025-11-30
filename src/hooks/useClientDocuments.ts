import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientDocument {
  id: string;
  client_id: string;
  name: string;
  file_path: string;
  file_type: string | null;
  file_size: number | null;
  uploaded_at: string;
  uploaded_by: string | null;
}

export function useClientDocuments(clientId?: string) {
  return useQuery({
    queryKey: ['client_documents', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientDocument[];
    },
    enabled: !!clientId,
  });
}

export function useUploadClientDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ clientId, file }: { clientId: string; file: File }) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${clientId}/${Date.now()}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('client-documents')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data, error } = await supabase
        .from('client_documents')
        .insert([{
          client_id: clientId,
          name: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { clientId }) => {
      queryClient.invalidateQueries({ queryKey: ['client_documents', clientId] });
      toast.success('Document uploaded');
    },
    onError: (error) => {
      toast.error('Upload failed: ' + error.message);
    },
  });
}

export function useDeleteClientDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, filePath, clientId }: { id: string; filePath: string; clientId: string }) => {
      await supabase.storage.from('client-documents').remove([filePath]);
      const { error } = await supabase.from('client_documents').delete().eq('id', id);
      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['client_documents', clientId] });
      toast.success('Document deleted');
    },
    onError: (error) => {
      toast.error('Delete failed: ' + error.message);
    },
  });
}

export function getClientDocumentUrl(filePath: string) {
  const { data } = supabase.storage.from('client-documents').getPublicUrl(filePath);
  return data.publicUrl;
}