import { Link, useLocation } from "react-router-dom";
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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Clock,
  Calendar,
  DollarSign,
  Target,
  GraduationCap,
  Gift,
  FileText,
  Settings,
  Network,
  Briefcase,
  ClipboardList,
  BarChart3,
  MessageSquare,
  Home,
} from "lucide-react";
import logo from "@/assets/coetanex-logo.png";

const menuItems = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/hr", icon: LayoutDashboard },
      { title: "Employee Directory", url: "/hr/employees", icon: Users },
      { title: "Organization Chart", url: "/hr/org-chart", icon: Network },
    ],
  },
  {
    title: "Recruitment",
    items: [
      { title: "Job Postings", url: "/hr/jobs", icon: Briefcase },
      { title: "Candidates", url: "/hr/candidates", icon: UserPlus },
      { title: "Onboarding", url: "/hr/onboarding", icon: ClipboardList },
    ],
  },
  {
    title: "Time & Leave",
    items: [
      { title: "Attendance", url: "/hr/attendance", icon: Clock },
      { title: "Leave Management", url: "/hr/leave", icon: Calendar },
    ],
  },
  {
    title: "Compensation",
    items: [
      { title: "Payroll", url: "/hr/payroll", icon: DollarSign },
      { title: "Benefits", url: "/hr/benefits", icon: Gift },
    ],
  },
  {
    title: "Performance",
    items: [
      { title: "Reviews", url: "/hr/performance", icon: Target },
      { title: "OKRs", url: "/hr/okrs", icon: Target },
      { title: "Training", url: "/hr/training", icon: GraduationCap },
    ],
  },
  {
    title: "Reports & Settings",
    items: [
      { title: "Analytics", url: "/hr/analytics", icon: BarChart3 },
      { title: "Documents", url: "/hr/documents", icon: FileText },
      { title: "Settings", url: "/hr/settings", icon: Settings },
    ],
  },
  {
    title: "AI Assistant",
    items: [
      { title: "HR AI Chat", url: "/hr/ai-chat", icon: MessageSquare },
    ],
  },
];

export function HRSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <Link to="/hr" className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold text-foreground">HR Portal</h1>
            <p className="text-xs text-muted-foreground">Human Resources</p>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="pt-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  <Home className="h-4 w-4" />
                  <span>Back to Main</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.url}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
