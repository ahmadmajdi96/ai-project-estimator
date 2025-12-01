import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TraceabilityRecord {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  user_id: string | null;
  ip_address: string | null;
  created_at: string;
  metadata: Record<string, any>;
}

export interface TraceabilityFilters {
  table_name?: string;
  action?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
}

// All business tables for comprehensive traceability
export const BUSINESS_TABLES = [
  // CRM
  'clients', 'quotes', 'salesmen', 'opportunities', 'call_logs', 'calendar_events',
  'client_communications', 'client_documents', 'client_notes', 'client_products',
  // Support
  'support_tickets', 'support_agents', 'support_stages',
  // Finance
  'invoices', 'payments', 'debit_cases', 'debit_collectors',
  // Operations
  'tasks', 'products', 'departments', 'employees', 'teams',
  // Intelligence
  'ai_recommendations', 'ai_decisions', 'ai_logs',
  // Automation
  'workflow_rules', 'workflow_logs',
  // Management
  'kpi_definitions', 'kpi_records', 'roadmaps', 'milestones', 'strategic_goals',
  // System
  'audit_logs', 'activity_logs', 'company_documents', 'company_policies'
] as const;

export function useAuditLogs(filters?: TraceabilityFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filters?.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('created_at', filters.date_to);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TraceabilityRecord[];
    },
  });
}

export function useAllTablesCounts() {
  return useQuery({
    queryKey: ['tables-counts'],
    queryFn: async () => {
      const counts: Record<string, number> = {};
      
      for (const table of BUSINESS_TABLES) {
        try {
          const { count } = await supabase.from(table as any).select('*', { count: 'exact', head: true });
          counts[table] = count || 0;
        } catch {
          counts[table] = 0;
        }
      }
      
      return counts;
    },
  });
}

export function useTableData(tableName: string, limit = 100) {
  return useQuery({
    queryKey: ['table-data', tableName, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data;
    },
    enabled: !!tableName,
  });
}
