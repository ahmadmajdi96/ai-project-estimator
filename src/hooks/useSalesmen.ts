import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Salesman {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  hire_date: string | null;
  status: 'active' | 'inactive' | 'on_leave';
  territory: string | null;
  target_monthly: number;
  target_quarterly: number;
  target_annual: number;
  commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface SalesPerformance {
  id: string;
  salesman_id: string;
  period_start: string;
  period_end: string;
  deals_closed: number;
  revenue_generated: number;
  leads_contacted: number;
  meetings_held: number;
  proposals_sent: number;
  conversion_rate: number;
  notes: string | null;
  created_at: string;
}

export function useSalesmen() {
  return useQuery({
    queryKey: ['salesmen'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('salesmen')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Salesman[];
    },
  });
}

export function useSalesman(id: string | undefined) {
  return useQuery({
    queryKey: ['salesmen', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('salesmen')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Salesman;
    },
    enabled: !!id,
  });
}

export function useSalesPerformance(salesmanId?: string) {
  return useQuery({
    queryKey: ['sales_performance', salesmanId],
    queryFn: async () => {
      let query = supabase
        .from('sales_performance')
        .select('*')
        .order('period_start', { ascending: false });
      
      if (salesmanId) {
        query = query.eq('salesman_id', salesmanId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as SalesPerformance[];
    },
  });
}

export function useAddSalesman() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (salesman: { name: string; email?: string; phone?: string; territory?: string; target_monthly?: number; target_quarterly?: number; target_annual?: number; commission_rate?: number; status?: string }) => {
      const { data, error } = await supabase
        .from('salesmen')
        .insert([salesman])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      toast.success('Salesman added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add salesman: ' + error.message);
    },
  });
}

export function useUpdateSalesman() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Salesman> & { id: string }) => {
      const { data, error } = await supabase
        .from('salesmen')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      toast.success('Salesman updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });
}

export function useDeleteSalesman() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('salesmen')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      toast.success('Salesman removed');
    },
    onError: (error) => {
      toast.error('Failed to remove: ' + error.message);
    },
  });
}

export function useAddSalesPerformance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (performance: { salesman_id: string; period_start: string; period_end: string; deals_closed?: number; revenue_generated?: number; leads_contacted?: number; meetings_held?: number; proposals_sent?: number; conversion_rate?: number; notes?: string }) => {
      const { data, error } = await supabase
        .from('sales_performance')
        .insert([performance])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales_performance'] });
      toast.success('Performance record added');
    },
    onError: (error) => {
      toast.error('Failed to add record: ' + error.message);
    },
  });
}
