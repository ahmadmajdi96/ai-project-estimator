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
  ArrowLeft,
  FileText,
  Zap,
  Globe,
  Shield,
  HelpCircle,
  Bell
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/hooks/useAuth';

const mainItems = [
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

const managementItems = [
  { title: 'Team', url: '/chatflow/team', icon: Users },
  { title: 'Billing', url: '/chatflow/billing', icon: CreditCard },
  { title: 'Notifications', url: '/chatflow/notifications', icon: Bell },
];

const settingsItems = [
  { title: 'Settings', url: '/chatflow/settings', icon: Settings },
  { title: 'API & Webhooks', url: '/chatflow/api', icon: Zap },
  { title: 'Security', url: '/chatflow/security', icon: Shield },
  { title: 'Help', url: '/chatflow/help', icon: HelpCircle },
];

export function ChatFlowSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleBackToPortal = () => {
    navigate('/portal');
  };

  const renderMenuItems = (items: typeof mainItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <NavLink to={item.url} end={item.url === '/chatflow'}>
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-border/50 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-display font-bold text-sm">ChatFlow AI</span>
              <span className="text-xs text-muted-foreground">Chatbot Platform</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(mainItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(contentItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(managementItems)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            {renderMenuItems(settingsItems)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/50 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleBackToPortal}
            >
              <ArrowLeft className="h-4 w-4" />
              {!isCollapsed && <span>Back to Portal</span>}
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!isCollapsed && <span>Sign Out</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
