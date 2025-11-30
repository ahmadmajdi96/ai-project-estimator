import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSalesPerformance() {
  return useQuery({
    queryKey: ['sales-performance'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales_performance')
        .select(`
          *,
          salesmen:salesman_id (id, name)
        `)
        .order('period_start', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });
}

export function useSalesmanPerformance(salesmanId: string | undefined) {
  return useQuery({
    queryKey: ['sales-performance', salesmanId],
    queryFn: async () => {
      if (!salesmanId) return [];
      const { data, error } = await supabase
        .from('sales_performance')
        .select('*')
        .eq('salesman_id', salesmanId)
        .order('period_start', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!salesmanId,
  });
}
