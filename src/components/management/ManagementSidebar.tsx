import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Building,
  LogOut,
  Home,
  Network,
  CheckSquare,
  Map,
  BarChart3,
  FileBarChart,
  FileText,
  Bot,
  MessageSquare,
  Lightbulb
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
  { title: 'Dashboard', url: '/management', icon: LayoutDashboard },
];

const managementItems = [
  { title: 'Users & Roles', url: '/management/users', icon: Shield },
  { title: 'Employees', url: '/management/employees', icon: Users },
  { title: 'Departments', url: '/management/departments', icon: Building },
];

const operationItems = [
  { title: 'Organization Tree', url: '/management/org-tree', icon: Network },
  { title: 'Tasks', url: '/management/tasks', icon: CheckSquare },
  { title: 'Roadmaps', url: '/management/roadmaps', icon: Map },
  { title: 'KPIs', url: '/management/kpis', icon: BarChart3 },
  { title: 'Reports', url: '/management/reports', icon: FileBarChart },
  { title: 'Documents', url: '/management/documents', icon: FileText },
];

const aiItems = [
  { title: 'AI Chat', url: '/crm/ai-chat', icon: MessageSquare },
  { title: 'AI Insights', url: '/crm/ai-insights', icon: Lightbulb },
  { title: 'AI Recommendations', url: '/crm/ai-recommendations', icon: Bot },
];

export function ManagementSidebar() {
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
              end={item.url === '/management'}
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          {!collapsed && <span className="font-display font-bold text-lg">Management</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(managementItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operation</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(operationItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(aiItems)}</SidebarGroupContent>
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
