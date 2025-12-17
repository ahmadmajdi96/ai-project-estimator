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
        .select('*, employees!employee_requests_employee_id_fkey(full_name, email)')
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
            .select('*, employees!employee_requests_employee_id_fkey(full_name, email)')
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

// Hook to approve/reject requests with reason
export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      rejectionReason 
    }: { 
      requestId: string; 
      status: 'approved' | 'rejected' | 'in_review'; 
      rejectionReason?: string;
    }) => {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === 'approved' || status === 'rejected') {
        updateData.approved_by = user?.id;
        updateData.approved_at = new Date().toISOString();
      }

      if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role_based_requests'] });
      queryClient.invalidateQueries({ queryKey: ['employee_requests'] });
      toast.success(`Request ${variables.status} successfully`);
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
      if (!user?.id || !employeeId) return { myTasks: [], teamTasks: [] };

      // Get my tasks
      const { data: myTasks } = await supabase
        .from('tasks')
        .select('*, employees!tasks_assigned_to_fkey(full_name, email), departments(name)')
        .eq('assigned_to', employeeId)
        .order('created_at', { ascending: false });

      // Get team tasks (for team lead and above)
      let teamTasks: any[] = [];
      if (role === 'team_lead' || role === 'department_head' || role === 'super_admin' || role === 'ceo') {
        const { data: teamMembers } = await supabase
          .from('employees')
          .select('id')
          .eq('manager_id', employeeId);

        if (teamMembers && teamMembers.length > 0) {
          const teamIds = teamMembers.map(m => m.id);
          const { data } = await supabase
            .from('tasks')
            .select('*, employees!tasks_assigned_to_fkey(full_name, email), departments(name)')
            .in('assigned_to', teamIds)
            .order('created_at', { ascending: false });
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
      if (!user?.id || !employeeId) return { myTickets: [], teamTickets: [] };

      // Get my tickets
      const { data: myTickets = [] } = await supabase
        .from('employee_tickets')
        .select('*, employees!employee_tickets_employee_id_fkey(full_name, email)')
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
            .select('*, employees!employee_tickets_employee_id_fkey(full_name, email)')
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

// Hook to update ticket status with resolution
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

      if (status === 'resolved' || status === 'closed') {
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

// Hook to get leave requests based on role
export function useRoleBasedLeaveRequests() {
  const { user } = useAuth();
  const { role, employeeId } = useUserRole();

  return useQuery({
    queryKey: ['role_based_leave_requests', user?.id, role, employeeId],
    queryFn: async () => {
      if (!user?.id || !employeeId) return { myLeaves: [], teamLeaves: [] };

      // Get my leave requests
      const { data: myLeaves = [] } = await (supabase as any)
        .from('leave_requests')
        .select('*, leave_type:leave_types(name, color), employees(full_name, email)')
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });

      // Get team leave requests (for team lead and above)
      let teamLeaves: any[] = [];
      if (role === 'team_lead' || role === 'department_head' || role === 'super_admin' || role === 'ceo') {
        const { data: teamMembers } = await supabase
          .from('employees')
          .select('id')
          .eq('manager_id', employeeId);

        if (teamMembers && teamMembers.length > 0) {
          const teamIds = teamMembers.map(m => m.id);
          const { data } = await (supabase as any)
            .from('leave_requests')
            .select('*, leave_type:leave_types(name, color), employees(full_name, email)')
            .in('employee_id', teamIds)
            .order('created_at', { ascending: false });
          teamLeaves = data || [];
        }
      }

      return { myLeaves, teamLeaves };
    },
    enabled: !!user?.id,
  });
}

// Hook to update leave request status
export function useUpdateLeaveStatus() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      leaveId, 
      status, 
      rejectionReason 
    }: { 
      leaveId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      const updateData: any = {
        status,
        approved_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      if (status === 'rejected' && rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { data, error } = await (supabase as any)
        .from('leave_requests')
        .update(updateData)
        .eq('id', leaveId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['role_based_leave_requests'] });
      queryClient.invalidateQueries({ queryKey: ['leave_requests'] });
      toast.success(`Leave request ${variables.status} successfully`);
    },
    onError: (error: any) => toast.error('Failed to update leave request: ' + error.message),
  });
}

// Hook to get attendance based on role
export function useRoleBasedAttendance() {
  const { user } = useAuth();
  const { role, employeeId } = useUserRole();

  return useQuery({
    queryKey: ['role_based_attendance', user?.id, role, employeeId],
    queryFn: async () => {
      if (!user?.id || !employeeId) return { myAttendance: [], teamAttendance: [] };

      // Get my attendance
      const { data: myAttendance = [] } = await supabase
        .from('hr_attendance')
        .select('*, employees!hr_attendance_employee_id_fkey(full_name, email)')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false });

      // Get team attendance (for team lead and above)
      let teamAttendance: any[] = [];
      if (role === 'team_lead' || role === 'department_head' || role === 'super_admin' || role === 'ceo') {
        const { data: teamMembers } = await supabase
          .from('employees')
          .select('id, full_name')
          .eq('manager_id', employeeId);

        if (teamMembers && teamMembers.length > 0) {
          const teamIds = teamMembers.map(m => m.id);
          const { data } = await supabase
            .from('hr_attendance')
            .select('*, employees!hr_attendance_employee_id_fkey(full_name, email)')
            .in('employee_id', teamIds)
            .order('date', { ascending: false });
          teamAttendance = data || [];
        }
      }

      return { myAttendance, teamAttendance };
    },
    enabled: !!user?.id,
  });
}

// Hook to get projects based on role  
export function useRoleBasedProjects() {
  const { user } = useAuth();
  const { role, employeeId } = useUserRole();

  return useQuery({
    queryKey: ['role_based_projects', user?.id, role, employeeId],
    queryFn: async () => {
      if (!user?.id || !employeeId) return { myProjects: [], teamProjects: [] };

      // Get all roadmaps for now - filtering by task assignment would need schema changes
      const { data: myProjects } = await supabase
        .from('roadmaps')
        .select('*')
        .order('created_at', { ascending: false });

      let teamProjects: any[] = [];
      
      return { myProjects: myProjects || [], teamProjects };
    },
    enabled: !!user?.id,
  });
}
