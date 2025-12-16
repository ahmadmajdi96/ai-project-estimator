import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'super_admin' | 'ceo' | 'department_head' | 'team_lead' | 'employee';

interface UserRoleData {
  role: AppRole | null;
  employeeId: string | null;
  managerId: string | null;
  departmentId: string | null;
  isLoading: boolean;
  canAccessCRM: boolean;
  canAccessEmployeePortal: boolean;
  canApproveRequests: boolean;
  canViewTeamData: boolean;
}

export function useUserRole(): UserRoleData {
  const { user } = useAuth();

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['user_role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      return data?.role as AppRole | null;
    },
    enabled: !!user?.id,
  });

  const { data: employeeData, isLoading: employeeLoading } = useQuery({
    queryKey: ['employee_by_user', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('employees')
        .select('id, manager_id, department_id')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user?.id,
  });

  const role = roleData || null;
  
  // Access permissions based on role
  const canAccessCRM = ['super_admin', 'ceo', 'department_head'].includes(role || '');
  const canAccessEmployeePortal = ['employee', 'team_lead', 'department_head', 'super_admin', 'ceo'].includes(role || '');
  const canApproveRequests = ['team_lead', 'department_head', 'super_admin', 'ceo'].includes(role || '');
  const canViewTeamData = ['team_lead', 'department_head', 'super_admin', 'ceo'].includes(role || '');

  return {
    role,
    employeeId: employeeData?.id || null,
    managerId: employeeData?.manager_id || null,
    departmentId: employeeData?.department_id || null,
    isLoading: roleLoading || employeeLoading,
    canAccessCRM,
    canAccessEmployeePortal,
    canApproveRequests,
    canViewTeamData,
  };
}

// Hook to get team members for a manager
export function useTeamMembers(managerId: string | null) {
  return useQuery({
    queryKey: ['team_members', managerId],
    queryFn: async () => {
      if (!managerId) return [];
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, email, position, user_id')
        .eq('manager_id', managerId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!managerId,
  });
}
