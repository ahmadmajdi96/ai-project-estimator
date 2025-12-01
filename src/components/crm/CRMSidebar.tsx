import { NavLink } from '@/components/NavLink';
import { 
  Users, 
  LayoutDashboard, 
  Kanban, 
  Calendar, 
  FileText, 
  Settings,
  TrendingUp,
  UserCheck,
  CheckSquare,
  Map,
  BarChart3,
  Bot,
  MessageSquare,
  LogOut,
  BadgeDollarSign,
  ShoppingCart,
  Database,
  Shield,
  PieChart,
  Lightbulb,
  Scale,
  Workflow,
  Bell,
  Code2,
  Target,
  Ticket,
  Package,
  Receipt,
  Building,
  Megaphone,
  Headphones,
  UserCog,
  Wallet,
  Banknote
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

const crmItems = [
  { title: 'Dashboard', url: '/crm', icon: LayoutDashboard },
  { title: 'Clients', url: '/crm/clients', icon: Users },
  { title: 'Status Board', url: '/crm/status', icon: Kanban },
];

const salesItems = [
  { title: 'Sales Dashboard', url: '/crm/sales', icon: ShoppingCart },
  { title: 'Salesmen', url: '/crm/salesmen', icon: BadgeDollarSign },
  { title: 'Opportunities', url: '/crm/opportunities', icon: Target },
  { title: 'Sales Pipeline', url: '/crm/pipeline', icon: TrendingUp },
];

const debitItems = [
  { title: 'Debit Dashboard', url: '/crm/debit', icon: Wallet },
  { title: 'Collectors', url: '/crm/debit-collectors', icon: Banknote },
  { title: 'Debit Cases', url: '/crm/debit-cases', icon: Target },
  { title: 'Debit Pipeline', url: '/crm/debit-pipeline', icon: TrendingUp },
];

const supportItems = [
  { title: 'Support Pipeline', url: '/crm/support-pipeline', icon: Headphones },
  { title: 'Support Tickets', url: '/crm/support-tickets', icon: Ticket },
  { title: 'Support Agents', url: '/crm/support-agents', icon: UserCog },
];

const financeItems = [
  { title: 'Invoices', url: '/crm/invoices', icon: Receipt },
  { title: 'Products', url: '/crm/products', icon: Package },
];

const intelligenceItems = [
  { title: 'Competitors', url: '/crm/competitors', icon: Building },
  { title: 'Marketing', url: '/crm/marketing', icon: Megaphone },
];

const managementItems = [
  { title: 'Users & Roles', url: '/crm/users', icon: Shield },
  { title: 'Departments', url: '/crm/departments', icon: LayoutDashboard },
  { title: 'Employees', url: '/crm/employees', icon: UserCheck },
  { title: 'Tasks', url: '/crm/tasks', icon: CheckSquare },
  { title: 'Roadmaps', url: '/crm/roadmaps', icon: Map },
  { title: 'KPIs', url: '/crm/kpis', icon: BarChart3 },
  { title: 'Reports', url: '/crm/reports', icon: PieChart },
];

const automationItems = [
  { title: 'Workflows', url: '/crm/workflows', icon: Workflow },
  { title: 'Reminders', url: '/crm/reminders', icon: Bell },
];

const aiItems = [
  { title: 'AI Insights', url: '/crm/ai-insights', icon: Bot },
  { title: 'AI Chat', url: '/crm/ai-chat', icon: MessageSquare },
  { title: 'AI Recommendations', url: '/crm/ai-recommendations', icon: Lightbulb },
  { title: 'AI Decisions', url: '/crm/ai-decisions', icon: Scale },
];

const toolItems = [
  { title: 'Configuration', url: '/crm/config', icon: Settings },
  { title: 'Calendar', url: '/crm/calendar', icon: Calendar },
  { title: 'Quotes & Estimator', url: '/crm/quotes', icon: FileText },
  { title: 'Traceability', url: '/crm/traceability', icon: Database },
  { title: 'Dev Tools', url: '/dev-tools', icon: Code2 },
];

export function CRMSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const renderMenuItems = (items: typeof crmItems) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink 
              to={item.url} 
              end={item.url === '/crm'}
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          {!collapsed && <span className="font-display font-bold text-lg">CEO Dashboard</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>CRM</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(crmItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Sales</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(salesItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Debit Collection</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(debitItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Support</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(supportItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Finance</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(financeItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Intelligence</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(intelligenceItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(managementItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Automation</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(automationItems)}</SidebarGroupContent>
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

      <SidebarFooter className="p-4 border-t border-border/50">
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
