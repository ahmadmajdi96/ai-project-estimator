import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: 'super_admin' | 'ceo' | 'department_head' | 'team_lead' | 'employee';
  created_at: string;
}

export interface PagePermission {
  id: string;
  user_id: string;
  page_path: string;
  can_access: boolean;
  created_at: string;
}

export interface UserInvitation {
  id: string;
  email: string;
  role: 'super_admin' | 'ceo' | 'department_head' | 'team_lead' | 'employee';
  invited_by: string | null;
  accepted: boolean;
  created_at: string;
  expires_at: string;
}

export function useUsersWithRoles() {
  return useQuery({
    queryKey: ['users_with_roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      return profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'employee',
        } as UserWithRole;
      });
    },
  });
}

export function useUserInvitations() {
  return useQuery({
    queryKey: ['user_invitations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_invitations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserInvitation[];
    },
  });
}

export function usePagePermissions(userId?: string) {
  return useQuery({
    queryKey: ['page_permissions', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return data as PagePermission[];
    },
    enabled: !!userId,
  });
}

type AppRole = 'super_admin' | 'ceo' | 'department_head' | 'team_lead' | 'employee';

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_with_roles'] });
      toast.success('User role updated');
    },
    onError: (error) => {
      toast.error('Failed to update role: ' + error.message);
    },
  });
}

export function useSetPagePermission() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, pagePath, canAccess }: { userId: string; pagePath: string; canAccess: boolean }) => {
      const { data: existing } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', userId)
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
          .insert([{ user_id: userId, page_path: pagePath, can_access: canAccess }]);
        if (error) throw error;
      }
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['page_permissions', userId] });
      toast.success('Permission updated');
    },
    onError: (error) => {
      toast.error('Failed to update permission: ' + error.message);
    },
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, role, department_id }: { email: string; role: AppRole; department_id?: string }) => {
      const { data, error } = await supabase
        .from('user_invitations')
        .insert([{ email, role }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_invitations'] });
      toast.success('Invitation sent');
    },
    onError: (error) => {
      toast.error('Failed to send invitation: ' + error.message);
    },
  });
}

export function useDeleteInvitation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('user_invitations').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_invitations'] });
      toast.success('Invitation deleted');
    },
    onError: (error) => {
      toast.error('Delete failed: ' + error.message);
    },
  });
}

export function useCreateUserFromEmployee() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ employee_id, role }: { employee_id: string; role: AppRole }) => {
      const { error } = await supabase
        .from('employees')
        .update({ user_id: employee_id })
        .eq('id', employee_id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users_with_roles'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('User account created');
    },
    onError: (error) => {
      toast.error('Failed to create user: ' + error.message);
    },
  });
}