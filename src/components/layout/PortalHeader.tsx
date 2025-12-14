import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import coetanexLogo from '@/assets/coetanex-logo.png';

interface PortalHeaderProps {
  portalName: string;
  portalColor?: string;
}

export function PortalHeader({ portalName, portalColor = 'from-primary to-primary/80' }: PortalHeaderProps) {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={coetanexLogo} alt="Coetanex AI Logo" className="h-8 w-8 object-contain" />
            <span className="font-display text-lg font-bold text-foreground hidden sm:inline">
              Coetanex<span className="text-primary">AI</span>
            </span>
          </Link>
          <div className="hidden sm:block h-6 w-px bg-border" />
          <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${portalColor} text-white text-sm font-medium`}>
            {portalName}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Main Dashboard</span>
          </Button>
          
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
            <User className="h-4 w-4 text-muted-foreground" />
            <div className="text-right">
              <p className="text-xs font-medium truncate max-w-[120px]">{user?.email}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{role?.replace('_', ' ')}</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
