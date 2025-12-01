import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  type: 'product' | 'service' | 'subscription' | null;
  base_price: number;
  cost: number;
  is_active: boolean;
  features: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientProduct {
  id: string;
  client_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  discount_percent: number;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'expired' | 'cancelled' | 'pending';
  notes: string | null;
  created_at: string;
  products?: Product;
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*').order('name');
      if (error) throw error;
      return data as Product[];
    },
  });
}

export function useClientProducts(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client_products', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('client_products')
        .select(`*, products(*)`)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ClientProduct[];
    },
    enabled: !!clientId,
  });
}

export function useAddProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (product: Partial<Product>) => {
      const { data, error } = await supabase.from('products').insert([product as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}

export function useAddClientProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (cp: Partial<ClientProduct>) => {
      const { data, error } = await supabase.from('client_products').insert([cp as any]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['client_products', vars.client_id] });
      toast.success('Product assigned to client');
    },
    onError: (e) => toast.error('Failed: ' + e.message),
  });
}
