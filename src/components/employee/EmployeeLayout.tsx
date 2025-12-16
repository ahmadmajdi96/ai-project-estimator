import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import coetanexLogo from '@/assets/coetanex-logo.png';
import {
  LayoutDashboard,
  ListTodo,
  FolderKanban,
  FileText,
  Calendar,
  Clock,
  DollarSign,
  Send,
  LogOut,
  ChevronLeft,
  User,
  Bot,
  Ticket,
} from 'lucide-react';

interface EmployeeLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/employee' },
  { id: 'schedule', label: 'My Schedule', icon: Calendar, path: '/employee/schedule' },
  { id: 'tasks', label: 'My Tasks', icon: ListTodo, path: '/employee/tasks' },
  { id: 'projects', label: 'My Projects', icon: FolderKanban, path: '/employee/projects' },
  { id: 'requests', label: 'My Requests', icon: Send, path: '/employee/requests' },
  { id: 'tickets', label: 'Support Tickets', icon: Ticket, path: '/employee/tickets' },
  { id: 'attendance', label: 'Attendance', icon: Clock, path: '/employee/attendance' },
  { id: 'leave', label: 'Leave', icon: Calendar, path: '/employee/leave' },
  { id: 'salary', label: 'Salary Slips', icon: DollarSign, path: '/employee/salary' },
  { id: 'ai-chat', label: 'AI Assistant', icon: Bot, path: '/employee/ai-chat' },
];

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Full-width Header */}
      <header className="w-full border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full px-4 lg:px-8">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src={coetanexLogo} alt="Logo" className="w-10 h-10 object-contain" />
                <div>
                  <h1 className="font-display font-bold text-xl">Employee Portal</h1>
                  <p className="text-xs text-muted-foreground">My Workspace</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border/50 bg-card/50 min-h-[calc(100vh-57px)] sticky top-[57px]">
          <ScrollArea className="h-full py-4">
            <nav className="space-y-1 px-3">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link key={item.id} to={item.path}>
                    <Button
                      variant={isActive ? 'secondary' : 'ghost'}
                      className={cn(
                        'w-full justify-start gap-3',
                        isActive && 'bg-primary/10 text-primary'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
