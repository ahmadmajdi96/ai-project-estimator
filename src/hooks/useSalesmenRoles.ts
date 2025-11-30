import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type SalesPosition = 'sales_director' | 'sales_manager' | 'senior_salesman' | 'salesman' | 'junior_salesman';
export type AppRole = 'ceo' | 'department_head' | 'team_lead' | 'employee';

export interface SalesmanWithRole {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  position: SalesPosition;
  role: AppRole;
  status: 'active' | 'inactive' | 'on_leave';
  territory: string | null;
  employee_id: string | null;
  hire_date: string | null;
  created_at: string;
}

// Map positions to roles
export const POSITION_ROLE_MAP: Record<SalesPosition, AppRole> = {
  sales_director: 'department_head',
  sales_manager: 'team_lead',
  senior_salesman: 'team_lead',
  salesman: 'employee',
  junior_salesman: 'employee',
};

export const SALES_POSITIONS = [
  { value: 'sales_director', label: 'Sales Director', role: 'department_head' },
  { value: 'sales_manager', label: 'Sales Manager', role: 'team_lead' },
  { value: 'senior_salesman', label: 'Senior Salesman', role: 'team_lead' },
  { value: 'salesman', label: 'Salesman', role: 'employee' },
  { value: 'junior_salesman', label: 'Junior Salesman', role: 'employee' },
] as const;

export const ROLE_INFO = {
  ceo: { label: 'CEO', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
  department_head: { label: 'Department Head', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  team_lead: { label: 'Team Lead', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  employee: { label: 'Employee', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

export function useSalesmenWithRoles() {
  return useQuery({
    queryKey: ['salesmen_with_roles'],
    queryFn: async () => {
      const { data: salesmen, error } = await supabase
        .from('salesmen')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      // Get employee positions and map to roles
      const { data: employees } = await supabase
        .from('employees')
        .select('id, position');
      
      const employeePositions = new Map(employees?.map(e => [e.id, e.position]) || []);
      
      return salesmen.map(s => {
        // Get position from employee record or default
        const rawPosition = s.employee_id ? employeePositions.get(s.employee_id) : null;
        
        // Map to valid position or default to 'salesman'
        const validPositions = Object.keys(POSITION_ROLE_MAP);
        const position = (rawPosition && validPositions.includes(rawPosition)) 
          ? rawPosition as SalesPosition 
          : 'salesman';
        
        const role = POSITION_ROLE_MAP[position] || 'employee';
        
        return {
          id: s.id,
          name: s.name,
          email: s.email,
          phone: s.phone,
          position,
          role,
          status: s.status || 'active',
          territory: s.territory,
          employee_id: s.employee_id,
          hire_date: s.hire_date,
          created_at: s.created_at,
        } as SalesmanWithRole;
      });
    },
  });
}

export function useUpdateSalesmanPosition() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ salesmanId, position }: { salesmanId: string; position: SalesPosition }) => {
      // Get the salesman to find employee_id
      const { data: salesman } = await supabase
        .from('salesmen')
        .select('employee_id')
        .eq('id', salesmanId)
        .single();
      
      if (salesman?.employee_id) {
        // Update the employee position
        const { error } = await supabase
          .from('employees')
          .update({ position })
          .eq('id', salesman.employee_id);
        
        if (error) throw error;
      } else {
        // Create employee record with position
        const { data: newEmployee, error: empError } = await supabase
          .from('employees')
          .insert([{ position, status: 'active' }])
          .select()
          .single();
        
        if (empError) throw empError;
        
        // Link to salesman
        const { error: linkError } = await supabase
          .from('salesmen')
          .update({ employee_id: newEmployee.id })
          .eq('id', salesmanId);
        
        if (linkError) throw linkError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salesmen_with_roles'] });
      queryClient.invalidateQueries({ queryKey: ['salesmen'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Position updated - role changed accordingly');
    },
    onError: (error) => {
      toast.error('Failed to update position: ' + error.message);
    },
  });
}

export function useSalesmanPagePermissions(salesmanId?: string) {
  return useQuery({
    queryKey: ['salesman_page_permissions', salesmanId],
    queryFn: async () => {
      if (!salesmanId) return [];
      
      // Get employee_id from salesman
      const { data: salesman } = await supabase
        .from('salesmen')
        .select('employee_id')
        .eq('id', salesmanId)
        .single();
      
      if (!salesman?.employee_id) return [];
      
      // Get user_id from employee
      const { data: employee } = await supabase
        .from('employees')
        .select('user_id')
        .eq('id', salesman.employee_id)
        .single();
      
      if (!employee?.user_id) return [];
      
      const { data, error } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', employee.user_id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!salesmanId,
  });
}

export function useSetSalesmanPagePermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ salesmanId, pagePath, canAccess }: { salesmanId: string; pagePath: string; canAccess: boolean }) => {
      // Get salesman's employee and user
      const { data: salesman } = await supabase
        .from('salesmen')
        .select('employee_id')
        .eq('id', salesmanId)
        .single();
      
      if (!salesman?.employee_id) {
        throw new Error('Salesman has no linked employee record');
      }
      
      const { data: employee } = await supabase
        .from('employees')
        .select('user_id')
        .eq('id', salesman.employee_id)
        .single();
      
      if (!employee?.user_id) {
        throw new Error('Employee has no linked user account');
      }
      
      const { data: existing } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', employee.user_id)
        .eq('page_path', pagePath)
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from('page_permissions')
          .update({ can_access: canAccess })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_permissions')
          .insert([{ user_id: employee.user_id, page_path: pagePath, can_access: canAccess }]);
        if (error) throw error;
      }
    },
    onSuccess: (_, { salesmanId }) => {
      queryClient.invalidateQueries({ queryKey: ['salesman_page_permissions', salesmanId] });
      toast.success('Permission updated');
    },
    onError: (error) => {
      toast.error('Failed to update permission: ' + error.message);
    },
  });
}
