import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  MessageSquare,
  Workflow,
  Plug,
  BarChart3,
  Bot,
  HeadphonesIcon,
  Settings,
  LogOut,
  Home,
  Users,
  Activity,
  FileText,
  Shield,
  Zap
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const mainItems = [
  { title: 'Dashboard', url: '/cortacentral', icon: LayoutDashboard },
];

const operationsItems = [
  { title: 'Conversations', url: '/cortacentral/conversations', icon: MessageSquare },
  { title: 'Contacts', url: '/cortacentral/contacts', icon: Users },
  { title: 'Queues', url: '/cortacentral/queues', icon: Zap },
];

const orchestrationItems = [
  { title: 'Workflows', url: '/cortacentral/workflows', icon: Workflow },
  { title: 'Connectors', url: '/cortacentral/connectors', icon: Plug },
  { title: 'Provider Health', url: '/cortacentral/health', icon: Activity },
];

const intelligenceItems = [
  { title: 'Analytics', url: '/cortacentral/analytics', icon: BarChart3 },
  { title: 'AI Center', url: '/cortacentral/ai', icon: Bot },
];

const supportItems = [
  { title: 'Support Tickets', url: '/cortacentral/support', icon: HeadphonesIcon },
  { title: 'Diagnostics', url: '/cortacentral/diagnostics', icon: FileText },
];

const adminItems = [
  { title: 'User Management', url: '/cortacentral/users', icon: Shield },
  { title: 'Settings', url: '/cortacentral/settings', icon: Settings },
];

export function CortaCentralSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleBackToPortal = () => {
    navigate('/');
  };

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink 
              to={item.url} 
              end={item.url === '/cortacentral'}
              className="flex items-center gap-2 hover:bg-muted/50 rounded-md px-2 py-1.5"
              activeClassName="bg-primary/10 text-primary font-medium"
            >
              <item.icon className="h-4 w-4" />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-display font-bold text-lg">CortaCentral</span>
              <p className="text-[10px] text-muted-foreground">CX Orchestrator</p>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(operationsItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Orchestration</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(orchestrationItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(intelligenceItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(supportItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Admin</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(adminItems)}</SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/50 space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start gap-2"
          onClick={handleBackToPortal}
        >
          <Home className="h-4 w-4" />
          {!collapsed && <span>Back to Portal</span>}
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full justify-start gap-2"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
