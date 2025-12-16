import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';
import { useUserRole } from './useUserRole';
import { EmployeeRequest } from './useEmployeeDashboard';

// Hook to get requests based on role
export function useRoleBasedRequests() {
  const { user } = useAuth();
  const { role, employeeId } = useUserRole();

  return useQuery({
    queryKey: ['role_based_requests', user?.id, role, employeeId],
    queryFn: async () => {
      if (!user?.id) return { myRequests: [], teamRequests: [] };

      // Get my requests
      let myQuery = supabase
        .from('employee_requests')
        .select('*, employees!employee_requests_employee_id_fkey(full_name)')
        .order('created_at', { ascending: false });

      if (employeeId) {
        myQuery = myQuery.eq('employee_id', employeeId);
      }

      const { data: myRequests = [] } = await myQuery;

      // Get team requests (for team lead and above)
      let teamRequests: any[] = [];
      if (role === 'team_lead' || role === 'department_head' || role === 'super_admin' || role === 'ceo') {
        // Get employees who report to this user
        const { data: teamMembers } = await supabase
          .from('employees')
          .select('id')
          .eq('manager_id', employeeId);

        if (teamMembers && teamMembers.length > 0) {
          const teamIds = teamMembers.map(m => m.id);
          const { data } = await supabase
            .from('employee_requests')
            .select('*, employees!employee_requests_employee_id_fkey(full_name)')
            .in('employee_id', teamIds)
            .order('created_at', { ascending: false });
          teamRequests = data || [];
        }
      }

      return { myRequests, teamRequests };
    },
    enabled: !!user?.id,
  });
}

// Hook to approve/reject requests
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      notes 
    }: { 
      requestId: string; 
      status: 'approved' | 'rejected' | 'in_review'; 
      notes?: string;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved' || status === 'rejected') {
        updateData.approved_by = user?.id;
        updateData.approved_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('employee_requests')
        .update(updateData)
        .eq('id', requestId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role_based_requests'] });
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
      toast.success('Request updated successfully');
    },
    onError: (error) => toast.error('Failed to update request: ' + error.message),
  });
}

// Hook to get tasks based on role
export function useRoleBasedTasks() {
  const { user } = useAuth();
  const { role, employeeId } = useUserRole();

  return useQuery({
    queryKey: ['role_based_tasks', user?.id, role, employeeId],
    queryFn: async (): Promise<{ myTasks: any[]; teamTasks: any[] }> => {
      if (!user?.id) return { myTasks: [], teamTasks: [] };

      // Get my tasks using raw query to avoid type issues
      const { data: myTasks } = await (supabase as any)
        .from('tasks')
        .select('id, title, description, status, priority, due_date, assignee_id, created_at')
        .eq('assignee_id', employeeId || '');

      // Get team tasks (for team lead and above)
      let teamTasks: any[] = [];
      if (role === 'team_lead' || role === 'department_head' || role === 'super_admin' || role === 'ceo') {
        const { data: teamMembers } = await supabase
          .from('employees')
          .select('id')
          .eq('manager_id', employeeId || '');

        if (teamMembers && teamMembers.length > 0) {
          const teamIds = teamMembers.map(m => m.id);
          const { data } = await (supabase as any)
            .from('tasks')
            .select('id, title, description, status, priority, due_date, assignee_id, created_at')
            .in('assignee_id', teamIds);
          teamTasks = data || [];
        }
      }

      return { myTasks: myTasks || [], teamTasks };
    },
    enabled: !!user?.id,
  });
}

// Hook to get tickets based on role
export function useRoleBasedTickets() {
  const { user } = useAuth();
  const { role, employeeId } = useUserRole();

  return useQuery({
    queryKey: ['role_based_tickets', user?.id, role, employeeId],
    queryFn: async () => {
      if (!user?.id) return { myTickets: [], teamTickets: [] };

      // Get my tickets
      const { data: myTickets = [] } = await supabase
        .from('employee_tickets')
        .select('*')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      // Get team tickets (for team lead and above)
      let teamTickets: any[] = [];
      if (role === 'team_lead' || role === 'department_head' || role === 'super_admin' || role === 'ceo') {
        const { data: teamMembers } = await supabase
          .from('employees')
          .select('id')
          .eq('manager_id', employeeId);

        if (teamMembers && teamMembers.length > 0) {
          const teamIds = teamMembers.map(m => m.id);
          const { data } = await supabase
            .from('employee_tickets')
            .select('*, employees!employee_tickets_employee_id_fkey(full_name)')
            .in('employee_id', teamIds)
            .order('created_at', { ascending: false });
          teamTickets = data || [];
        }
      }

      return { myTickets, teamTickets };
    },
    enabled: !!user?.id,
  });
}

// Hook to update ticket status
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      ticketId, 
      status, 
      resolution 
    }: { 
      ticketId: string; 
      status: string; 
      resolution?: string;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = user?.id;
        if (resolution) updateData.resolution = resolution;
      }

      const { data, error } = await supabase
        .from('employee_tickets')
        .update(updateData)
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role_based_tickets'] });
      queryClient.invalidateQueries({ queryKey: ['employee_tickets'] });
      toast.success('Ticket updated successfully');
    },
    onError: (error) => toast.error('Failed to update ticket: ' + error.message),
  });
}
