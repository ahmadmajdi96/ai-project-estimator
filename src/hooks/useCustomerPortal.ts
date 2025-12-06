import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

// Types
export interface PortalUser {
  id: string;
  auth_user_id: string;
  email: string;
  google_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  phone?: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  timezone: string;
  language: string;
  email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  metadata: Json;
  preferences: Json;
}

export interface CustomerChatbot {
  id: string;
  customer_id: string;
  chatbot_id: string;
  name: string;
  type: string;
  status: string;
  purchase_date: string;
  expiry_date?: string;
  renewal_date?: string;
  subscription_tier?: string;
  max_messages_per_month: number;
  used_messages: number;
  platform_integrations: string[];
  webhook_url?: string;
  webhook_secret?: string;
  custom_domain?: string;
  brand_color: string;
  logo_url?: string;
  welcome_message: string;
  fallback_message: string;
  created_at: string;
  updated_at: string;
  settings: Json;
  metadata: Json;
}

export interface AnswerRule {
  id: string;
  chatbot_id: string;
  rule_name: string;
  trigger_type: string;
  priority: number;
  keywords: string[];
  patterns: string[];
  exact_phrases: string[];
  intent?: string;
  entities: Json;
  response_type: string;
  response_text?: string;
  response_buttons: Json;
  response_cards: Json;
  response_quick_replies: Json;
  response_media: Json;
  next_step?: string;
  conditions: Json;
  is_active: boolean;
  match_count: number;
  last_triggered?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface KnowledgeBaseEntry {
  id: string;
  chatbot_id: string;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  subcategory?: string;
  tags: string[];
  keywords: string[];
  source_type: string;
  source_url?: string;
  source_file?: string;
  confidence_score: number;
  status: string;
  views: number;
  helpful_count: number;
  unhelpful_count: number;
  version: number;
  previous_version_id?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  metadata: Json;
}

export interface TrainingQuestion {
  id: string;
  knowledge_base_id?: string;
  chatbot_id: string;
  question: string;
  variations: string[];
  answer: string;
  confidence_threshold: number;
  training_status: string;
  trained_at?: string;
  match_count: number;
  last_used?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ChatbotAnalytics {
  id: string;
  chatbot_id: string;
  date: string;
  total_conversations: number;
  total_messages: number;
  unique_users: number;
  active_users: number;
  avg_response_time?: number;
  satisfaction_score?: number;
  rule_triggers: Json;
  top_intents: Json;
  failed_queries: string[];
  platform_breakdown: Json;
  peak_hours: Json;
  created_at: string;
}

export interface ImportJob {
  id: string;
  customer_id: string;
  chatbot_id: string;
  job_type: string;
  source_type: string;
  source_url?: string;
  source_file?: string;
  status: string;
  progress: number;
  total_items?: number;
  processed_items: number;
  success_items: number;
  failed_items: number;
  error_log?: string;
  result: Json;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// Portal User Hooks
export function usePortalUser() {
  return useQuery({
    queryKey: ['portal-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('portal_users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as PortalUser | null;
    },
  });
}

export function useCreatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userData: Partial<PortalUser>) => {
      const { data, error } = await supabase
        .from('portal_users')
        .insert([userData])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-user'] }),
  });
}

export function useUpdatePortalUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<PortalUser>) => {
      const { data, error } = await supabase
        .from('portal_users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portal-user'] }),
  });
}

// Customer Chatbots Hooks
export function useCustomerChatbots() {
  return useQuery({
    queryKey: ['customer-chatbots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_chatbots')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CustomerChatbot[];
    },
  });
}

export function useCustomerChatbot(id: string) {
  return useQuery({
    queryKey: ['customer-chatbot', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_chatbots')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as CustomerChatbot;
    },
    enabled: !!id,
  });
}

export function useUpdateCustomerChatbot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CustomerChatbot>) => {
      const { data, error } = await supabase
        .from('customer_chatbots')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customer-chatbots'] });
      queryClient.invalidateQueries({ queryKey: ['customer-chatbot'] });
    },
  });
}

// Answer Rules Hooks
export function useAnswerRules(chatbotId: string) {
  return useQuery({
    queryKey: ['answer-rules', chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('answer_rules')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('priority', { ascending: true });
      if (error) throw error;
      return data as AnswerRule[];
    },
    enabled: !!chatbotId,
  });
}

export function useCreateAnswerRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (rule: Partial<AnswerRule> & { chatbot_id: string; rule_name: string }) => {
      const { data, error } = await supabase
        .from('answer_rules')
        .insert([rule])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['answer-rules'] }),
  });
}

export function useUpdateAnswerRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<AnswerRule>) => {
      const { data, error } = await supabase
        .from('answer_rules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['answer-rules'] }),
  });
}

export function useDeleteAnswerRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('answer_rules')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['answer-rules'] }),
  });
}

// Knowledge Base Hooks
export function useKnowledgeBaseEntries(chatbotId: string) {
  return useQuery({
    queryKey: ['kb-entries', chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as KnowledgeBaseEntry[];
    },
    enabled: !!chatbotId,
  });
}

export function useCreateKBEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (entry: Partial<KnowledgeBaseEntry> & { chatbot_id: string; title: string; content: string }) => {
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .insert([entry])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-entries'] }),
  });
}

export function useUpdateKBEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<KnowledgeBaseEntry>) => {
      const { data, error } = await supabase
        .from('knowledge_base_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-entries'] }),
  });
}

export function useDeleteKBEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('knowledge_base_entries')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kb-entries'] }),
  });
}

// Training Questions Hooks
export function useTrainingQuestions(chatbotId: string) {
  return useQuery({
    queryKey: ['training-questions', chatbotId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('training_questions')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as TrainingQuestion[];
    },
    enabled: !!chatbotId,
  });
}

export function useCreateTrainingQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (question: Partial<TrainingQuestion> & { chatbot_id: string; question: string; answer: string }) => {
      const { data, error } = await supabase
        .from('training_questions')
        .insert([question])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-questions'] }),
  });
}

export function useDeleteTrainingQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('training_questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training-questions'] }),
  });
}

// Analytics Hooks
export function useChatbotAnalytics(chatbotId: string, dateRange?: { start: string; end: string }) {
  return useQuery({
    queryKey: ['chatbot-analytics', chatbotId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('chatbot_analytics')
        .select('*')
        .eq('chatbot_id', chatbotId)
        .order('date', { ascending: false });
      
      if (dateRange) {
        query = query.gte('date', dateRange.start).lte('date', dateRange.end);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ChatbotAnalytics[];
    },
    enabled: !!chatbotId,
  });
}

// Import Jobs Hooks
export function useImportJobs(chatbotId?: string) {
  return useQuery({
    queryKey: ['import-jobs', chatbotId],
    queryFn: async () => {
      let query = supabase
        .from('import_jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (chatbotId) {
        query = query.eq('chatbot_id', chatbotId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as ImportJob[];
    },
  });
}

export function useCreateImportJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (job: Partial<ImportJob> & { customer_id: string; chatbot_id: string; job_type: string; source_type: string }) => {
      const { data, error } = await supabase
        .from('import_jobs')
        .insert([job])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['import-jobs'] }),
  });
}

// Activity Logs Hooks
export function useActivityLogs(limit?: number) {
  return useQuery({
    queryKey: ['customer-activity-logs', limit],
    queryFn: async () => {
      let query = supabase
        .from('customer_activity_logs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
