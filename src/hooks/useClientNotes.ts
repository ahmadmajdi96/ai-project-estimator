import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ClientNote } from '@/types/crm';
import type { Database } from '@/integrations/supabase/types';

type ClientNoteInsert = Database['public']['Tables']['client_notes']['Insert'];

export function useClientNotes(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client_notes', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ClientNote[];
    },
    enabled: !!clientId,
  });
}

export function useAddClientNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (note: ClientNoteInsert) => {
      const { data, error } = await supabase
        .from('client_notes')
        .insert(note)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_notes'] });
      toast.success('Note added');
    },
    onError: (error) => {
      toast.error('Failed to add note: ' + error.message);
    },
  });
}

export function useDeleteClientNote() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('client_notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_notes'] });
      toast.success('Note deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete note: ' + error.message);
    },
  });
}
