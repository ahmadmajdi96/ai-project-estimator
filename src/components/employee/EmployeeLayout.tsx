import { ReactNode, useState } from 'react';
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
  Calendar,
  Clock,
  DollarSign,
  Send,
  LogOut,
  ChevronLeft,
  User,
  Bot,
  Ticket,
  Menu,
  X,
  ChevronRight,
  Bell,
  Search,
  Settings,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmployeeLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/employee', badge: null },
  { id: 'schedule', label: 'My Schedule', icon: Calendar, path: '/employee/schedule', badge: null },
  { id: 'tasks', label: 'My Tasks', icon: ListTodo, path: '/employee/tasks', badge: '5' },
  { id: 'projects', label: 'My Projects', icon: FolderKanban, path: '/employee/projects', badge: null },
  { id: 'requests', label: 'My Requests', icon: Send, path: '/employee/requests', badge: '2' },
  { id: 'tickets', label: 'Support Tickets', icon: Ticket, path: '/employee/tickets', badge: null },
  { id: 'attendance', label: 'Attendance', icon: Clock, path: '/employee/attendance', badge: null },
  { id: 'leave', label: 'Leave', icon: Calendar, path: '/employee/leave', badge: null },
  { id: 'salary', label: 'Salary Slips', icon: DollarSign, path: '/employee/salary', badge: null },
  { id: 'ai-chat', label: 'AI Assistant', icon: Bot, path: '/employee/ai-chat', badge: 'New' },
];

function NavItem({ item, isActive, isCollapsed }: { item: typeof menuItems[0]; isActive: boolean; isCollapsed?: boolean }) {
  const Icon = item.icon;
  
  const content = (
    <Link to={item.path} className="block">
      <div
        className={cn(
          'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300',
          'hover:bg-gradient-to-r hover:from-primary/10 hover:to-accent/5',
          isActive && 'bg-gradient-to-r from-primary/15 to-accent/10 shadow-sm',
          isCollapsed && 'justify-center px-2'
        )}
      >
        {/* Active indicator */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full" />
        )}
        
        <div className={cn(
          'relative flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-300',
          isActive 
            ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/25' 
            : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        
        {!isCollapsed && (
          <>
            <span className={cn(
              'flex-1 font-medium text-sm transition-colors',
              isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
            )}>
              {item.label}
            </span>
            
            {item.badge && (
              <Badge 
                variant={item.badge === 'New' ? 'default' : 'secondary'}
                className={cn(
                  'h-5 px-1.5 text-[10px] font-semibold',
                  item.badge === 'New' && 'bg-gradient-to-r from-primary to-accent border-0'
                )}
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </div>
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function EmployeeLayout({ children }: EmployeeLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const userInitials = user?.email?.slice(0, 2).toUpperCase() || 'U';

  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className={cn(
        'flex items-center gap-3 px-4 py-5 border-b border-border/50',
        sidebarCollapsed && !isMobile && 'justify-center px-2'
      )}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl blur-lg" />
          <img 
            src={coetanexLogo} 
            alt="Logo" 
            className="relative w-10 h-10 object-contain rounded-xl"
          />
        </div>
        {(!sidebarCollapsed || isMobile) && (
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Employee
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-wide uppercase">
              Portal
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-4">
        <nav className={cn('space-y-1', sidebarCollapsed && !isMobile ? 'px-2' : 'px-3')}>
          {menuItems.map((item) => (
            <NavItem 
              key={item.id} 
              item={item} 
              isActive={location.pathname === item.path}
              isCollapsed={sidebarCollapsed && !isMobile}
            />
          ))}
        </nav>
      </ScrollArea>

      {/* User Section */}
      <div className={cn(
        'border-t border-border/50 p-4',
        sidebarCollapsed && !isMobile && 'p-2'
      )}>
        <div className={cn(
          'flex items-center gap-3 p-2 rounded-xl bg-muted/30',
          sidebarCollapsed && !isMobile && 'justify-center'
        )}>
          <Avatar className="h-9 w-9 ring-2 ring-primary/20">
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Employee</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Header */}
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6">
            {/* Left Section */}
            <div className="flex items-center gap-3">
              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0">
                  <SidebarContent isMobile />
                </SheetContent>
              </Sheet>

              {/* Back Button */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="hidden lg:flex hover:bg-primary/10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              {/* Page Title */}
              <div className="hidden sm:block">
                <h1 className="font-display font-semibold text-lg">Employee Portal</h1>
                <p className="text-xs text-muted-foreground">Manage your work & activities</p>
              </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-primary/10">
                <Search className="h-4 w-4" />
              </Button>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
              </Button>

              {/* Settings */}
              <Button variant="ghost" size="icon" className="hidden md:flex hover:bg-primary/10">
                <Settings className="h-4 w-4" />
              </Button>

              {/* Divider */}
              <div className="w-px h-6 bg-border mx-2 hidden sm:block" />

              {/* User */}
              <div className="hidden sm:flex items-center gap-3">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-xs font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block">
                  <p className="text-sm font-medium">{user?.email?.split('@')[0]}</p>
                </div>
              </div>

              {/* Sign Out */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleSignOut}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Desktop Sidebar */}
          <aside 
            className={cn(
              'hidden lg:flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-sm transition-all duration-300',
              'sticky top-16 h-[calc(100vh-4rem)]',
              sidebarCollapsed ? 'w-[72px]' : 'w-64'
            )}
          >
            <SidebarContent />
            
            {/* Collapse Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-3 top-6 h-6 w-6 rounded-full border bg-background shadow-md hover:bg-primary hover:text-primary-foreground"
            >
              <ChevronRight className={cn('h-3 w-3 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </Button>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-h-[calc(100vh-4rem)] w-full">
            <div className="p-4 lg:p-6 xl:p-8 w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
