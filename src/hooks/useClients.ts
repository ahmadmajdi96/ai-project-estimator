import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Client, ClientStatus, SalesStage } from '@/types/crm';
import type { Database } from '@/integrations/supabase/types';
import { triggerStageChangeWorkflow, triggerStatusChangeWorkflow, triggerNewClientWorkflow } from '@/services/workflowEngine';

type ClientInsert = Database['public']['Tables']['clients']['Insert'];
type ClientUpdate = Database['public']['Tables']['clients']['Update'];

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Client | null;
    },
    enabled: !!id,
  });
}

export function useAddClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const { data, error } = await supabase
        .from('clients')
        .insert(client)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client added successfully');
      // Trigger new client workflow
      if (data) {
        triggerNewClientWorkflow(data.id, data.client_name);
      }
    },
    onError: (error) => {
      toast.error('Failed to add client: ' + error.message);
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: ClientUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated');
    },
    onError: (error) => {
      toast.error('Failed to update client: ' + error.message);
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete client: ' + error.message);
    },
  });
}

export function useUpdateClientStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, status, oldStatus, clientName }: { id: string; status: ClientStatus; oldStatus?: string; clientName?: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, oldStatus, clientName };
    },
    onSuccess: ({ data, oldStatus, clientName }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      // Trigger workflow
      if (data && oldStatus && clientName) {
        triggerStatusChangeWorkflow(data.id, clientName, oldStatus, data.status);
      }
    },
    onError: (error) => {
      toast.error('Failed to update status: ' + error.message);
    },
  });
}

export function useUpdateClientSalesStage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, sales_stage, oldStage, clientName }: { id: string; sales_stage: SalesStage; oldStage?: string; clientName?: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ sales_stage })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { data, oldStage, clientName };
    },
    onSuccess: ({ data, oldStage, clientName }) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      // Trigger workflow
      if (data && oldStage && clientName) {
        triggerStageChangeWorkflow(data.id, clientName, oldStage, data.sales_stage);
      }
    },
    onError: (error) => {
      toast.error('Failed to update sales stage: ' + error.message);
    },
  });
}
