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
  Lightbulb,
  Scale,
  Settings,
  Calendar,
  Database,
  Award,
  Target,
  CheckCircle2,
  Bell,
  Workflow
} from 'lucide-react';
import coetanexLogo from '@/assets/coetanex-logo.png';
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
  { title: 'Organization Tree', url: '/management/org-tree', icon: Network },
  { title: 'Skills & Positions', url: '/management/skills-positions', icon: Award },
];

const strategyItems = [
  { title: 'Strategic Goals', url: '/management/strategic-goals', icon: Target },
  { title: 'OKRs', url: '/management/okrs', icon: CheckCircle2 },
  { title: 'Roadmaps', url: '/management/roadmaps', icon: Map },
];

const operationItems = [
  { title: 'Tasks', url: '/management/tasks', icon: CheckSquare },
  { title: 'KPIs', url: '/management/kpis', icon: BarChart3 },
  { title: 'Reports', url: '/management/reports', icon: FileBarChart },
  { title: 'Documents', url: '/management/documents', icon: FileText },
];

const aiItems = [
  { title: 'AI Chat', url: '/management/ai-chat', icon: MessageSquare },
  { title: 'AI Insights', url: '/management/ai-insights', icon: Lightbulb },
  { title: 'AI Recommendations', url: '/management/ai-recommendations', icon: Bot },
  { title: 'AI Decisions', url: '/management/ai-decisions', icon: Scale },
];

const toolItems = [
  { title: 'Notifications', url: '/management/notifications', icon: Bell },
  { title: 'Workflows', url: '/management/workflows', icon: Workflow },
  { title: 'Configuration', url: '/management/config', icon: Settings },
  { title: 'Calendar', url: '/management/calendar', icon: Calendar },
  { title: 'Traceability', url: '/management/traceability', icon: Database },
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
          <img src={coetanexLogo} alt="Coetanex AI Logo" className="w-8 h-8 object-contain" />
          {!collapsed && <span className="font-display font-bold text-lg">Management</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(mainItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Organization</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(managementItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Strategy</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(strategyItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Operations</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(operationItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(aiItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(toolItems)}</SidebarGroupContent>
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
