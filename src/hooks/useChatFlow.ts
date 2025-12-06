import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface Organization {
  id: string;
  name: string;
  owner_id: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  size?: string;
  settings: Record<string, unknown>;
  billing_email?: string;
  created_at: string;
  updated_at: string;
}

export interface Chatbot {
  id: string;
  name: string;
  description?: string;
  organization_id: string;
  type: 'rule_based' | 'ai' | 'hybrid';
  status: 'draft' | 'active' | 'paused' | 'archived';
  personality_settings: Record<string, unknown>;
  config: Record<string, unknown>;
  ai_model: string;
  knowledge_base: Record<string, unknown>;
  training_data: Record<string, unknown>;
  conversation_flow: Record<string, unknown>;
  variables: Record<string, unknown>;
  working_hours: Record<string, unknown>;
  escalation_rules: Record<string, unknown>;
  created_by?: string;
  created_at: string;
  updated_at: string;
  last_trained_at?: string;
  is_template: boolean;
  template_category?: string;
  version: number;
  metadata: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  chatbot_id: string;
  platform: string;
  platform_conversation_id?: string;
  visitor_id?: string;
  visitor_name?: string;
  visitor_metadata: Record<string, unknown>;
  status: 'active' | 'closed' | 'pending';
  assigned_to?: string;
  tags: string[];
  priority: number;
  sentiment_score?: number;
  summary?: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  resolution?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_type: 'user' | 'bot' | 'agent';
  sender_id?: string;
  message_type: 'text' | 'image' | 'file' | 'quick_reply' | 'carousel';
  content?: string;
  attachments: unknown[];
  quick_replies: unknown[];
  buttons: unknown[];
  carousel: unknown[];
  read_at?: string;
  delivered_at?: string;
  sent_at: string;
  direction: 'incoming' | 'outgoing';
  intent?: string;
  confidence?: number;
  sentiment?: number;
  metadata: Record<string, unknown>;
}

export interface ChatbotIntegration {
  id: string;
  chatbot_id: string;
  platform: string;
  platform_id?: string;
  platform_name?: string;
  config: Record<string, unknown>;
  credentials: Record<string, unknown>;
  webhook_url?: string;
  webhook_secret?: string;
  status: 'active' | 'inactive' | 'error';
  last_synced?: string;
  error_log?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  use_case?: string;
  content: Record<string, unknown>;
  preview_image_url?: string;
  demo_url?: string;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  download_count: number;
  is_featured: boolean;
  is_public: boolean;
  tags: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

export interface KnowledgeArticle {
  id: string;
  organization_id: string;
  title: string;
  content: string;
  category?: string;
  subcategory?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  author_id?: string;
  views: number;
  helpful_votes: number;
  unhelpful_votes: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

export interface UsageMetric {
  id: string;
  organization_id: string;
  chatbot_id?: string;
  date: string;
  metric_type: string;
  platform?: string;
  count: number;
  unique_users: number;
  response_time_avg?: number;
  satisfaction_score?: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Organizations
export function useOrganizations() {
  return useQuery({
    queryKey: ['cf-organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cf_organizations')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Organization[];
    },
  });
}

export function useAddOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (org: { name: string; owner_id?: string }) => {
      const { data, error } = await supabase.from('cf_organizations').insert(org).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cf-organizations'] });
      toast.success('Organization created');
    },
    onError: (error) => toast.error(error.message),
  });
}

// Chatbots
export function useChatbots(organizationId?: string) {
  return useQuery({
    queryKey: ['cf-chatbots', organizationId],
    queryFn: async () => {
      let query = supabase.from('cf_chatbots').select('*').order('created_at', { ascending: false });
      if (organizationId) query = query.eq('organization_id', organizationId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Chatbot[];
    },
  });
}

export function useChatbot(id: string) {
  return useQuery({
    queryKey: ['cf-chatbot', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cf_chatbots').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Chatbot;
    },
    enabled: !!id,
  });
}

export function useAddChatbot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (chatbot: { name: string; description?: string; type?: string; status?: string; organization_id?: string }) => {
      const { data, error } = await supabase.from('cf_chatbots').insert(chatbot).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cf-chatbots'] });
      toast.success('Chatbot created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateChatbot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; status?: string; name?: string }) => {
      const { data, error } = await supabase.from('cf_chatbots').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cf-chatbots'] });
      toast.success('Chatbot updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteChatbot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cf_chatbots').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cf-chatbots'] });
      toast.success('Chatbot deleted');
    },
    onError: (error) => toast.error(error.message),
  });
}

// Conversations
export function useConversations(chatbotId?: string) {
  return useQuery({
    queryKey: ['cf-conversations', chatbotId],
    queryFn: async () => {
      let query = supabase.from('cf_conversations').select('*').order('updated_at', { ascending: false });
      if (chatbotId) query = query.eq('chatbot_id', chatbotId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Conversation[];
    },
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: ['cf-conversation', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('cf_conversations').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Conversation;
    },
    enabled: !!id,
  });
}

// Messages
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['cf-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cf_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('sent_at', { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (message: { conversation_id: string; sender_type: string; message_type?: string; content?: string; direction?: string }) => {
      const { data, error } = await supabase.from('cf_messages').insert(message).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cf-messages', variables.conversation_id] });
    },
    onError: (error) => toast.error(error.message),
  });
}

// Integrations
export function useChatbotIntegrations(chatbotId: string) {
  return useQuery({
    queryKey: ['cf-integrations', chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cf_chatbot_integrations')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ChatbotIntegration[];
    },
    enabled: !!chatbotId,
  });
}

export function useAddIntegration() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (integration: { chatbot_id: string; platform: string }) => {
      const { data, error } = await supabase.from('cf_chatbot_integrations').insert(integration).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cf-integrations', variables.chatbot_id] });
      toast.success('Integration added');
    },
    onError: (error) => toast.error(error.message),
  });
}

// Templates
export function useTemplates(category?: string) {
  return useQuery({
    queryKey: ['cf-templates', category],
    queryFn: async () => {
      let query = supabase.from('cf_templates').select('*').eq('is_public', true).order('download_count', { ascending: false });
      if (category) query = query.eq('category', category);
      const { data, error } = await query;
      if (error) throw error;
      return data as Template[];
    },
  });
}

// Knowledge Base
export function useKnowledgeArticles(organizationId?: string) {
  return useQuery({
    queryKey: ['cf-knowledge-articles', organizationId],
    queryFn: async () => {
      let query = supabase.from('cf_knowledge_articles').select('*').order('updated_at', { ascending: false });
      if (organizationId) query = query.eq('organization_id', organizationId);
      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeArticle[];
    },
  });
}

export function useAddKnowledgeArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (article: { title: string; content: string; category?: string; tags?: string[]; status?: string; organization_id?: string }) => {
      const { data, error } = await supabase.from('cf_knowledge_articles').insert(article).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cf-knowledge-articles'] });
      toast.success('Article created');
    },
    onError: (error) => toast.error(error.message),
  });
}

// Usage Metrics
export function useUsageMetrics(organizationId?: string, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['cf-usage-metrics', organizationId, dateRange],
    queryFn: async () => {
      let query = supabase.from('cf_usage_metrics').select('*').order('date', { ascending: false });
      if (organizationId) query = query.eq('organization_id', organizationId);
      if (dateRange) {
        query = query.gte('date', dateRange.start).lte('date', dateRange.end);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as UsageMetric[];
    },
  });
}
