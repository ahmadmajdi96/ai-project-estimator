import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ClientTag {
  id: string;
  name: string;
  color: string;
  description: string | null;
  created_at: string;
}

export interface ClientTagAssignment {
  id: string;
  client_id: string;
  tag_id: string;
  assigned_at: string;
  client_tags?: ClientTag;
}

export function useClientTags() {
  return useQuery({
    queryKey: ['client_tags'],
    queryFn: async () => {
      const { data, error } = await supabase.from('client_tags').select('*').order('name');
      if (error) throw error;
      return data as ClientTag[];
    },
  });
}

export function useClientTagAssignments(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client_tag_assignments', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('client_tag_assignments')
        .select(`*, client_tags(*)`)
        .eq('client_id', clientId);
      if (error) throw error;
      return data as ClientTagAssignment[];
    },
    enabled: !!clientId,
  });
}

export function useAssignClientTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ clientId, tagId }: { clientId: string; tagId: string }) => {
      const { data, error } = await supabase
        .from('client_tag_assignments')
        .insert({ client_id: clientId, tag_id: tagId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['client_tag_assignments', vars.clientId] });
      toast.success('Tag assigned');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useRemoveClientTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, clientId }: { id: string; clientId: string }) => {
      const { error } = await supabase.from('client_tag_assignments').delete().eq('id', id);
      if (error) throw error;
      return clientId;
    },
    onSuccess: (clientId) => {
      queryClient.invalidateQueries({ queryKey: ['client_tag_assignments', clientId] });
      toast.success('Tag removed');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useAddClientTag() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tag: Partial<ClientTag>) => {
      const { data, error } = await supabase.from('client_tags').insert([tag as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client_tags'] });
      toast.success('Tag created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
