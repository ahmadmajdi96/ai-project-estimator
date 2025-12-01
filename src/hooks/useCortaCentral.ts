import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface CXOTenant {
  id: string;
  name: string;
  slug: string;
  primary_region: string;
  plan: string;
  status: 'active' | 'suspended' | 'closed';
  settings: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CXOUser {
  id: string;
  tenant_id: string;
  auth_user_id: string | null;
  email: string;
  full_name: string | null;
  role: 'agent' | 'supervisor' | 'admin' | 'billing_owner';
  status: 'active' | 'invited' | 'disabled';
  timezone: string;
  language: string;
  avatar_url: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface CXOConnector {
  id: string;
  tenant_id: string;
  type: string;
  display_name: string;
  is_enabled: boolean;
  config: Record<string, any>;
  health_status: 'healthy' | 'degraded' | 'down' | 'unknown';
  last_health_check_at: string | null;
  created_at: string;
}

export interface CXOContact {
  id: string;
  tenant_id: string;
  external_id: string | null;
  first_name: string | null;
  last_name: string | null;
  primary_phone: string | null;
  primary_email: string | null;
  channels: any[];
  tags: string[];
  attributes: Record<string, any>;
  created_at: string;
}

export interface CXOQueue {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  channel_types: string[];
  skills_required: string[];
  routing_strategy: 'round_robin' | 'least_busy' | 'skill_based';
  is_default: boolean;
  created_at: string;
}

export interface CXOConversation {
  id: string;
  tenant_id: string;
  contact_id: string | null;
  external_reference: string | null;
  primary_channel: string;
  status: 'open' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  assigned_queue_id: string | null;
  assigned_agent_id: string | null;
  started_at: string;
  closed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  contact?: CXOContact;
  assigned_agent?: CXOUser;
}

export interface CXOWorkflow {
  id: string;
  tenant_id: string;
  name: string;
  description: string | null;
  trigger_type: string;
  current_version_id: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CXOAIJob {
  id: string;
  tenant_id: string;
  conversation_id: string | null;
  job_type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  input_reference: Record<string, any>;
  output: Record<string, any> | null;
  error: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface CXOSupportTicket {
  id: string;
  tenant_id: string;
  created_by_user_id: string | null;
  type: string;
  severity: string;
  status: string;
  title: string;
  description: string | null;
  related_conversation_id: string | null;
  related_connector_id: string | null;
  diagnostic_bundle_id: string | null;
  created_at: string;
}

// Hooks
export function useCXOTenants() {
  return useQuery({
    queryKey: ['cxo-tenants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cxo_tenants')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CXOTenant[];
    },
  });
}

export function useAddCXOTenant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tenant: { name: string; slug: string; primary_region?: string; plan?: string }) => {
      const { data, error } = await supabase
        .from('cxo_tenants')
        .insert(tenant)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-tenants'] });
      toast.success('Tenant created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCXOConnectors(tenantId?: string) {
  return useQuery({
    queryKey: ['cxo-connectors', tenantId],
    queryFn: async () => {
      let query = supabase.from('cxo_connectors').select('*').order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOConnector[];
    },
  });
}

export function useAddCXOConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (connector: { tenant_id: string; type: string; display_name: string; is_enabled?: boolean; config?: Record<string, any>; health_status?: string }) => {
      const { data, error } = await supabase
        .from('cxo_connectors')
        .insert(connector as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-connectors'] });
      toast.success('Connector created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCXOConnector() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; is_enabled?: boolean; display_name?: string; config?: Record<string, any> }) => {
      const { data, error } = await supabase
        .from('cxo_connectors')
        .update(updates as any)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-connectors'] });
      toast.success('Connector updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCXOContacts(tenantId?: string) {
  return useQuery({
    queryKey: ['cxo-contacts', tenantId],
    queryFn: async () => {
      let query = supabase.from('cxo_contacts').select('*').order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOContact[];
    },
  });
}

export function useAddCXOContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (contact: { tenant_id: string; first_name?: string; last_name?: string; primary_email?: string; primary_phone?: string }) => {
      const { data, error } = await supabase
        .from('cxo_contacts')
        .insert(contact)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-contacts'] });
      toast.success('Contact created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCXOQueues(tenantId?: string) {
  return useQuery({
    queryKey: ['cxo-queues', tenantId],
    queryFn: async () => {
      let query = supabase.from('cxo_queues').select('*').order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOQueue[];
    },
  });
}

export function useAddCXOQueue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (queue: { tenant_id: string; name: string; description?: string; routing_strategy?: string }) => {
      const { data, error } = await supabase
        .from('cxo_queues')
        .insert(queue as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-queues'] });
      toast.success('Queue created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCXOConversations(tenantId?: string, filters?: { status?: string; queueId?: string }) {
  return useQuery({
    queryKey: ['cxo-conversations', tenantId, filters],
    queryFn: async () => {
      let query = supabase
        .from('cxo_conversations')
        .select(`
          *,
          contact:cxo_contacts(*),
          assigned_agent:cxo_users(*)
        `)
        .order('started_at', { ascending: false });
      
      if (tenantId) query = query.eq('tenant_id', tenantId);
      if (filters?.status) query = query.eq('status', filters.status as any);
      if (filters?.queueId) query = query.eq('assigned_queue_id', filters.queueId);
      
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOConversation[];
    },
  });
}

export function useCXOWorkflows(tenantId?: string) {
  return useQuery({
    queryKey: ['cxo-workflows', tenantId],
    queryFn: async () => {
      let query = supabase.from('cxo_workflows').select('*').order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOWorkflow[];
    },
  });
}

export function useAddCXOWorkflow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (workflow: { tenant_id: string; name: string; description?: string; trigger_type: string; is_active?: boolean }) => {
      const { data, error } = await supabase
        .from('cxo_workflows')
        .insert(workflow as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-workflows'] });
      toast.success('Workflow created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCXOAIJobs(tenantId?: string) {
  return useQuery({
    queryKey: ['cxo-ai-jobs', tenantId],
    queryFn: async () => {
      let query = supabase.from('cxo_ai_jobs').select('*').order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOAIJob[];
    },
  });
}

export function useCXOSupportTickets(tenantId?: string) {
  return useQuery({
    queryKey: ['cxo-support-tickets', tenantId],
    queryFn: async () => {
      let query = supabase.from('cxo_support_tickets').select('*').order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOSupportTicket[];
    },
  });
}

export function useAddCXOSupportTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: { tenant_id: string; type: string; severity: string; title: string; description?: string; status?: string }) => {
      const { data, error } = await supabase
        .from('cxo_support_tickets')
        .insert(ticket as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-support-tickets'] });
      toast.success('Support ticket created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useCXOHealthChecks(connectorId?: string) {
  return useQuery({
    queryKey: ['cxo-health-checks', connectorId],
    queryFn: async () => {
      let query = supabase
        .from('cxo_provider_health_checks')
        .select('*')
        .order('checked_at', { ascending: false })
        .limit(100);
      if (connectorId) query = query.eq('connector_id', connectorId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCXOUsers(tenantId?: string) {
  return useQuery({
    queryKey: ['cxo-users', tenantId],
    queryFn: async () => {
      let query = supabase.from('cxo_users').select('*').order('created_at', { ascending: false });
      if (tenantId) query = query.eq('tenant_id', tenantId);
      const { data, error } = await query;
      if (error) throw error;
      return data as CXOUser[];
    },
  });
}

export function useAddCXOUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (user: { tenant_id: string; email: string; full_name?: string; role?: string }) => {
      const { data, error } = await supabase
        .from('cxo_users')
        .insert(user as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cxo-users'] });
      toast.success('User created');
    },
    onError: (error) => toast.error(error.message),
  });
}
