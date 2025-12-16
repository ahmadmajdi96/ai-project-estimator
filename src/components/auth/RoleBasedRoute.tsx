import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole, AppRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: AppRole[];
  redirectTo?: string;
}

export function RoleBasedRoute({ children, allowedRoles, redirectTo }: RoleBasedRouteProps) {
  const { user, loading: authLoading } = useAuth();
  const { role, isLoading: roleLoading } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    // Redirect based on role
    const redirect = redirectTo || getDefaultRedirect(role);
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

function getDefaultRedirect(role: AppRole | null): string {
  switch (role) {
    case 'employee':
    case 'team_lead':
      return '/employee';
    case 'department_head':
    case 'ceo':
    case 'super_admin':
      return '/crm';
    default:
      return '/auth';
  }
}

// Component to show portal selection based on role
export function PortalRouter() {
  const { user, loading: authLoading } = useAuth();
  const { role, isLoading: roleLoading, canAccessCRM, canAccessEmployeePortal } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Auto-redirect based on role
  if (role === 'employee' || role === 'team_lead') {
    return <Navigate to="/employee" replace />;
  }
  
  if (role === 'department_head' || role === 'ceo' || role === 'super_admin') {
    return <Navigate to="/crm" replace />;
  }

  // Fallback - show portal selection if user has multiple access
  return <Navigate to="/employee" replace />;
}
