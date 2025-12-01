import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface MarketingCampaign {
  id: string;
  name: string;
  description: string | null;
  campaign_type: 'email' | 'social_media' | 'webinar' | 'trade_show' | 'content' | 'paid_ads' | 'other' | null;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';
  start_date: string | null;
  end_date: string | null;
  budget: number;
  actual_spend: number;
  target_audience: string | null;
  goals: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface MarketingInteraction {
  id: string;
  client_id: string;
  campaign_id: string | null;
  interaction_type: string | null;
  content_name: string | null;
  content_url: string | null;
  interaction_data: Record<string, any>;
  interaction_date: string;
  created_at: string;
  marketing_campaigns?: MarketingCampaign;
}

export function useMarketingCampaigns() {
  return useQuery({
    queryKey: ['marketing_campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as MarketingCampaign[];
    },
  });
}

export function useClientMarketingInteractions(clientId: string | undefined) {
  return useQuery({
    queryKey: ['marketing_interactions', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('marketing_interactions')
        .select(`*, marketing_campaigns(name, campaign_type)`)
        .eq('client_id', clientId)
        .order('interaction_date', { ascending: false });
      if (error) throw error;
      return data as MarketingInteraction[];
    },
    enabled: !!clientId,
  });
}

export function useAddMarketingCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (campaign: Partial<MarketingCampaign>) => {
      const { data, error } = await supabase.from('marketing_campaigns').insert([campaign as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing_campaigns'] });
      toast.success('Campaign created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useAddMarketingInteraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (interaction: Partial<MarketingInteraction>) => {
      const { data, error } = await supabase.from('marketing_interactions').insert([interaction as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['marketing_interactions', vars.client_id] });
      toast.success('Interaction recorded');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
