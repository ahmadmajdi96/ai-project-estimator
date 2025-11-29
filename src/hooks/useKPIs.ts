import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface KPIDefinition {
  id: string;
  name: string;
  description: string | null;
  unit: string | null;
  target_value: number | null;
  department_id: string | null;
  calculation_method: string | null;
  created_at: string;
  departments?: {
    name: string;
  } | null;
}

export interface KPIRecord {
  id: string;
  kpi_id: string;
  employee_id: string | null;
  department_id: string | null;
  value: number;
  period_start: string | null;
  period_end: string | null;
  notes: string | null;
  created_at: string;
  kpi_definitions?: {
    name: string;
    unit: string | null;
    target_value: number | null;
  } | null;
}

export function useKPIDefinitions() {
  return useQuery({
    queryKey: ['kpi-definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('kpi_definitions')
        .select(`
          *,
          departments:department_id (name)
        `)
        .order('name');
      
      if (error) throw error;
      return data as KPIDefinition[];
    },
  });
}

export function useKPIRecords(filters?: { department_id?: string; employee_id?: string; kpi_id?: string }) {
  return useQuery({
    queryKey: ['kpi-records', filters],
    queryFn: async () => {
      let query = supabase
        .from('kpi_records')
        .select(`
          *,
          kpi_definitions:kpi_id (name, unit, target_value)
        `)
        .order('created_at', { ascending: false });
      
      if (filters?.department_id) {
        query = query.eq('department_id', filters.department_id);
      }
      if (filters?.employee_id) {
        query = query.eq('employee_id', filters.employee_id);
      }
      if (filters?.kpi_id) {
        query = query.eq('kpi_id', filters.kpi_id);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as KPIRecord[];
    },
  });
}

export function useAddKPIDefinition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (kpi: { 
      name: string; 
      description?: string;
      unit?: string;
      target_value?: number;
      department_id?: string;
      calculation_method?: string;
    }) => {
      const { data, error } = await supabase
        .from('kpi_definitions')
        .insert(kpi)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-definitions'] });
      toast.success('KPI definition created');
    },
    onError: (error) => {
      toast.error('Failed to create KPI: ' + error.message);
    },
  });
}

export function useAddKPIRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (record: { 
      kpi_id: string;
      value: number;
      employee_id?: string;
      department_id?: string;
      period_start?: string;
      period_end?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from('kpi_records')
        .insert(record)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-records'] });
      toast.success('KPI record added');
    },
    onError: (error) => {
      toast.error('Failed to add KPI record: ' + error.message);
    },
  });
}

export function useDeleteKPIDefinition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('kpi_definitions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kpi-definitions'] });
      toast.success('KPI definition deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete KPI: ' + error.message);
    },
  });
}
