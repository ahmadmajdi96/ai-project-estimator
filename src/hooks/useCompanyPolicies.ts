import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CompanyPolicy {
  id: string;
  title: string;
  category: string;
  content: string;
  is_active: boolean;
  effective_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useCompanyPolicies() {
  return useQuery({
    queryKey: ['company-policies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_policies')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CompanyPolicy[];
    },
  });
}

export function useAddCompanyPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (policy: { title: string; content: string; category?: string; is_active?: boolean; effective_date?: string }) => {
      const { data, error } = await supabase
        .from('company_policies')
        .insert([policy])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-policies'] });
      toast.success('Policy created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateCompanyPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<CompanyPolicy>) => {
      const { data, error } = await supabase
        .from('company_policies')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-policies'] });
      toast.success('Policy updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteCompanyPolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('company_policies').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-policies'] });
      toast.success('Policy deleted');
    },
    onError: (error) => toast.error(error.message),
  });
}
