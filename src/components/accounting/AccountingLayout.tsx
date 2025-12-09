import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccountingAuth } from '@/hooks/useAccountingAuth';
import { AccountingSidebar } from './AccountingSidebar';
import { AccountingHeader } from './AccountingHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface AccountingLayoutProps {
  children: ReactNode;
}

export function AccountingLayout({ children }: AccountingLayoutProps) {
  const navigate = useNavigate();
  const { user, loading, accountingUser } = useAccountingAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/accounting/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || !accountingUser) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-900">
        <AccountingSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <AccountingHeader />
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
