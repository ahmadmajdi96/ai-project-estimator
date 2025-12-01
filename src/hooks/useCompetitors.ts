import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Competitor {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  market_position: string | null;
  pricing_info: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CompetitorAnalysis {
  id: string;
  opportunity_id: string | null;
  client_id: string | null;
  competitor_id: string;
  threat_level: 'low' | 'medium' | 'high' | null;
  competitor_price: number | null;
  competitor_strengths: string | null;
  competitor_weaknesses: string | null;
  our_advantages: string | null;
  strategy_notes: string | null;
  outcome: 'won' | 'lost' | 'pending' | null;
  created_at: string;
  competitors?: Competitor;
}

export function useCompetitors() {
  return useQuery({
    queryKey: ['competitors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('competitors').select('*').order('name');
      if (error) throw error;
      return data as Competitor[];
    },
  });
}

export function useCompetitorAnalysis(opportunityId?: string, clientId?: string) {
  return useQuery({
    queryKey: ['competitor_analysis', opportunityId, clientId],
    queryFn: async () => {
      let query = supabase.from('competitor_analysis').select(`*, competitors(*)`);
      if (opportunityId) query = query.eq('opportunity_id', opportunityId);
      if (clientId) query = query.eq('client_id', clientId);
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data as CompetitorAnalysis[];
    },
    enabled: !!opportunityId || !!clientId,
  });
}

export function useAddCompetitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (comp: Partial<Competitor>) => {
      const { data, error } = await supabase.from('competitors').insert([comp as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Competitor added');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useAddCompetitorAnalysis() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (analysis: Partial<CompetitorAnalysis>) => {
      const { data, error } = await supabase.from('competitor_analysis').insert([analysis as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitor_analysis'] });
      toast.success('Analysis recorded');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
