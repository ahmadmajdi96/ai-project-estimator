import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from './useAuth';

interface PortalPermission {
  id: string;
  role: string;
  portal_path: string;
  can_access: boolean;
}

export function usePortalPermissions() {
  const { role } = useAuth();
  
  return useQuery({
    queryKey: ['portal_permissions', role],
    queryFn: async () => {
      if (!role) return [];
      const { data, error } = await supabase
        .from('portal_permissions')
        .select('*')
        .eq('role', role);
      
      if (error) throw error;
      return data as PortalPermission[];
    },
    enabled: !!role,
  });
}

export function useCanAccessPortal(portalPath: string) {
  const { role } = useAuth();
  const { data: permissions = [], isLoading } = usePortalPermissions();
  
  // Super admin and CEO can access everything
  if (role === 'super_admin' || role === 'ceo') {
    return { canAccess: true, isLoading: false };
  }
  
  const permission = permissions.find(p => 
    p.portal_path === portalPath || 
    portalPath.startsWith(p.portal_path + '/')
  );
  
  return { 
    canAccess: permission?.can_access ?? false, 
    isLoading 
  };
}

export function useAllowedPortals() {
  const { role } = useAuth();
  const { data: permissions = [], isLoading } = usePortalPermissions();
  
  // Super admin and CEO can access everything
  if (role === 'super_admin' || role === 'ceo') {
    return { 
      allowedPaths: ['/crm', '/management', '/hr', '/accounting', '/logistics', '/chatflow', '/employee'],
      isLoading: false 
    };
  }
  
  const allowedPaths = permissions
    .filter(p => p.can_access)
    .map(p => p.portal_path);
  
  return { allowedPaths, isLoading };
}
