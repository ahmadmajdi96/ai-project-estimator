import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type AccountingRole = 'admin' | 'accountant' | 'bookkeeper' | 'manager' | 'auditor' | 'employee';

interface AccountingUser {
  id: string;
  auth_user_id: string;
  company_id: string;
  role: AccountingRole;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  job_title?: string;
  avatar_url?: string;
  is_active: boolean;
  preferences?: Record<string, any>;
}

interface AccountingCompany {
  id: string;
  name: string;
  legal_name?: string;
  tax_id?: string;
  currency: string;
  fiscal_year_start: number;
  logo_url?: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  accountingUser: AccountingUser | null;
  company: AccountingCompany | null;
  loading: boolean;
}

export function useAccountingAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    accountingUser: null,
    company: null,
    loading: true,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setState(prev => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }));

        if (session?.user) {
          setTimeout(() => {
            fetchAccountingUser(session.user.id);
          }, 0);
        } else {
          setState(prev => ({ 
            ...prev, 
            accountingUser: null, 
            company: null 
          }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }));
      
      if (session?.user) {
        fetchAccountingUser(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchAccountingUser = async (authUserId: string) => {
    const { data: accountingUser, error: userError } = await supabase
      .from('accounting_users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();
    
    if (userError || !accountingUser) {
      setState(prev => ({ ...prev, accountingUser: null, company: null }));
      return;
    }

    const { data: company } = await supabase
      .from('accounting_companies')
      .select('*')
      .eq('id', accountingUser.company_id)
      .single();
    
    setState(prev => ({ 
      ...prev, 
      accountingUser: accountingUser as AccountingUser, 
      company: company as AccountingCompany | null 
    }));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (roles: AccountingRole | AccountingRole[]): boolean => {
    if (!state.accountingUser) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(state.accountingUser.role);
  };

  const canAccess = (feature: string): boolean => {
    if (!state.accountingUser) return false;
    
    const rolePermissions: Record<AccountingRole, string[]> = {
      admin: ['*'],
      accountant: ['gl', 'ar', 'ap', 'banking', 'payroll', 'tax', 'reports', 'budget', 'assets', 'inventory', 'projects'],
      bookkeeper: ['gl', 'ar', 'ap', 'banking', 'expenses', 'reports'],
      manager: ['reports', 'budget', 'expenses', 'projects', 'time'],
      auditor: ['gl', 'reports', 'audit'],
      employee: ['expenses', 'time'],
    };

    const permissions = rolePermissions[state.accountingUser.role];
    return permissions.includes('*') || permissions.includes(feature);
  };

  return {
    ...state,
    signOut,
    hasRole,
    canAccess,
    isAdmin: state.accountingUser?.role === 'admin',
    isAccountant: state.accountingUser?.role === 'accountant',
    fullName: state.accountingUser 
      ? `${state.accountingUser.first_name} ${state.accountingUser.last_name}` 
      : '',
  };
}
