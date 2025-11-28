import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DbCsvFile {
  id: string;
  name: string;
  size: number;
  uploaded_at: string;
}

export function useCsvFiles() {
  return useQuery({
    queryKey: ['csv-files'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('csv_files')
        .select('*')
        .order('uploaded_at', { ascending: false });
      
      if (error) throw error;
      return data as DbCsvFile[];
    },
  });
}

export function useAddCsvFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (file: Omit<DbCsvFile, 'id' | 'uploaded_at'>) => {
      const { data, error } = await supabase
        .from('csv_files')
        .insert(file)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csv-files'] });
      toast.success('CSV file uploaded');
    },
    onError: (error) => {
      toast.error('Failed to upload CSV: ' + error.message);
    },
  });
}

export function useDeleteCsvFile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('csv_files')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csv-files'] });
      toast.success('CSV file deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete CSV: ' + error.message);
    },
  });
}
