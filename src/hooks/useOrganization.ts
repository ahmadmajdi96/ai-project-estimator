import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Organization {
  id: string;
  name: string;
  vision: string | null;
  mission: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Team {
  id: string;
  department_id: string;
  name: string;
  description: string | null;
  lead_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface StrategicGoal {
  id: string;
  scope: 'company' | 'department' | 'team';
  department_id: string | null;
  team_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  owner_employee_id: string | null;
  status: 'not_started' | 'in_progress' | 'at_risk' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  roadmap_id: string;
  strategic_goal_id: string | null;
  title: string;
  description: string | null;
  start_date: string | null;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'blocked' | 'completed';
  owner_team_id: string | null;
  owner_employee_id: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface PagePermission {
  id: string;
  user_id: string;
  page_path: string;
  can_access: boolean;
  created_at: string;
}

// Organization hooks
export function useOrganization() {
  return useQuery({
    queryKey: ['organization'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as Organization | null;
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (org: Partial<Organization> & { id?: string; name: string }) => {
      if (org.id) {
        const { data, error } = await supabase
          .from('organizations')
          .update(org as any)
          .eq('id', org.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('organizations')
          .insert(org as any)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization'] });
      toast.success('Organization updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

// Teams hooks
export function useTeams(departmentId?: string) {
  return useQuery({
    queryKey: ['teams', departmentId],
    queryFn: async () => {
      let query = supabase.from('teams').select('*').order('name');
      if (departmentId) query = query.eq('department_id', departmentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Team[];
    },
  });
}

export function useAddTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<Team>) => {
      const { data, error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('teams').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team deleted');
    },
    onError: (error) => toast.error(error.message),
  });
}

// Strategic Goals hooks
export function useStrategicGoals(scope?: string, departmentId?: string) {
  return useQuery({
    queryKey: ['strategic-goals', scope, departmentId],
    queryFn: async () => {
      let query = supabase.from('strategic_goals').select('*').order('created_at', { ascending: false });
      if (scope) query = query.eq('scope', scope);
      if (departmentId) query = query.eq('department_id', departmentId);
      const { data, error } = await query;
      if (error) throw error;
      return data as StrategicGoal[];
    },
  });
}

export function useAddStrategicGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (goal: Omit<StrategicGoal, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('strategic_goals')
        .insert(goal)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success('Strategic goal created');
    },
    onError: (error) => toast.error(error.message),
  });
}

export function useUpdateStrategicGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Partial<StrategicGoal>) => {
      const { data, error } = await supabase
        .from('strategic_goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['strategic-goals'] });
      toast.success('Strategic goal updated');
    },
    onError: (error) => toast.error(error.message),
  });
}

// Notifications hooks
export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Notification[];
    },
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

// Page Permissions hooks
export function usePagePermissions(userId?: string) {
  return useQuery({
    queryKey: ['page-permissions', userId],
    queryFn: async () => {
      let query = supabase.from('page_permissions').select('*');
      if (userId) query = query.eq('user_id', userId);
      const { data, error } = await query;
      if (error) throw error;
      return data as PagePermission[];
    },
    enabled: !!userId,
  });
}

export function useSetPagePermission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (permission: Omit<PagePermission, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('page_permissions')
        .upsert(permission, { onConflict: 'user_id,page_path' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page-permissions'] });
      toast.success('Permission updated');
    },
    onError: (error) => toast.error(error.message),
  });
}
