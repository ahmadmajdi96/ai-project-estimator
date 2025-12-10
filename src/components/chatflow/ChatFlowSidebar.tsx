import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  BookOpen, 
  Puzzle, 
  Users, 
  Settings, 
  CreditCard, 
  LogOut,
  FileText,
  Zap,
  Globe,
  Shield,
  HelpCircle,
  Bell,
  Home,
  Key,
  Headphones
} from 'lucide-react';
import coetanexLogo from '@/assets/coetanex-logo.png';
import { useNavigate } from 'react-router-dom';
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
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const overviewItems = [
  { title: 'Dashboard', url: '/chatflow', icon: LayoutDashboard },
  { title: 'Chatbots', url: '/chatflow/chatbots', icon: Bot },
  { title: 'Conversations', url: '/chatflow/conversations', icon: MessageSquare },
  { title: 'Analytics', url: '/chatflow/analytics', icon: BarChart3 },
];

const contentItems = [
  { title: 'Knowledge Base', url: '/chatflow/knowledge-base', icon: BookOpen },
  { title: 'Templates', url: '/chatflow/templates', icon: FileText },
  { title: 'Integrations', url: '/chatflow/integrations', icon: Puzzle },
];

const customersItems = [
  { title: 'Users', url: '/chatflow/users', icon: Users },
  { title: 'Team', url: '/chatflow/team', icon: Headphones },
];

const billingItems = [
  { title: 'Billing', url: '/chatflow/billing', icon: CreditCard },
  { title: 'Notifications', url: '/chatflow/notifications', icon: Bell },
];

const developerItems = [
  { title: 'API & Webhooks', url: '/chatflow/api', icon: Key },
  { title: 'Security', url: '/chatflow/security', icon: Shield },
];

const supportItems = [
  { title: 'Settings', url: '/chatflow/settings', icon: Settings },
  { title: 'Help Center', url: '/chatflow/help', icon: HelpCircle },
];

export function ChatFlowSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleBackToPortal = () => {
    navigate('/');
  };

  const renderMenuItems = (items: typeof overviewItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink 
              to={item.url} 
              end={item.url === '/chatflow'}
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
          {!collapsed && <span className="font-display font-bold text-lg">ChatFlow</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(overviewItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(contentItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Customers</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(customersItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Billing</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(billingItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Developer</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(developerItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(supportItems)}</SidebarGroupContent>
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
