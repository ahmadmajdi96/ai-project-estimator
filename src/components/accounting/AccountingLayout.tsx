import { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AccountingSidebar } from './AccountingSidebar';
import { Button } from '@/components/ui/button';
import { Home, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import coetanexLogo from '@/assets/coetanex-logo.png';

interface AccountingLayoutProps {
  children?: ReactNode;
  title?: string;
}

export function AccountingLayout({ children, title }: AccountingLayoutProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AccountingSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 h-14 flex items-center justify-between gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <Link to="/" className="flex items-center gap-2 group">
                <img src={coetanexLogo} alt="Logo" className="h-7 w-7 object-contain" />
              </Link>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium">
                Accounting
              </div>
              {title && <h1 className="font-display font-semibold text-lg hidden md:block">{title}</h1>}
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate('/')}>
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Main Dashboard</span>
              </Button>
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <div className="text-right">
                  <p className="text-[11px] font-medium truncate max-w-[100px]">{user?.email}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{role?.replace('_', ' ')}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
