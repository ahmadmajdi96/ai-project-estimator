import { NavLink } from '@/components/NavLink';
import { 
  Users, 
  LayoutDashboard, 
  Kanban, 
  Calendar, 
  FileText, 
  Settings,
  Calculator,
  TrendingUp
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
  useSidebar,
} from '@/components/ui/sidebar';

const mainItems = [
  { title: 'Dashboard', url: '/crm', icon: LayoutDashboard },
  { title: 'Clients', url: '/crm/clients', icon: Users },
  { title: 'Sales Pipeline', url: '/crm/pipeline', icon: TrendingUp },
  { title: 'Status Board', url: '/crm/status', icon: Kanban },
  { title: 'Calendar', url: '/crm/calendar', icon: Calendar },
  { title: 'Quotes', url: '/crm/quotes', icon: FileText },
];

const toolItems = [
  { title: 'Cost Estimator', url: '/', icon: Calculator },
  { title: 'Configuration', url: '/config', icon: Settings },
];

export function CRMSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarHeader className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">C</span>
          </div>
          {!collapsed && <span className="font-display font-bold text-lg">CRM</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
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
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
