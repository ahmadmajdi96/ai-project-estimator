import { 
  Home, 
  Bot, 
  MessageSquare, 
  BarChart3, 
  BookOpen, 
  Settings, 
  CreditCard,
  HelpCircle,
  Activity,
  Zap,
  FileText,
  GraduationCap,
  TestTube
} from "lucide-react";
import coetanexLogo from '@/assets/coetanex-logo.png';
import { NavLink, useLocation, useParams } from "react-router-dom";
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
} from "@/components/ui/sidebar";

const mainNavItems = [
  { title: "Dashboard", icon: Home, path: "/customer-portal" },
  { title: "My Chatbots", icon: Bot, path: "/customer-portal/chatbots" },
  { title: "Analytics", icon: BarChart3, path: "/customer-portal/analytics" },
  { title: "Activity Log", icon: Activity, path: "/customer-portal/activity" },
];

const chatbotNavItems = [
  { title: "Overview", icon: Home, path: "" },
  { title: "Answer Rules", icon: Zap, path: "/rules" },
  { title: "Knowledge Base", icon: BookOpen, path: "/knowledge-base" },
  { title: "Training", icon: GraduationCap, path: "/training" },
  { title: "Import Data", icon: FileText, path: "/import" },
  { title: "Test Chatbot", icon: TestTube, path: "/test" },
  { title: "Integrations", icon: MessageSquare, path: "/integrations" },
  { title: "Settings", icon: Settings, path: "/settings" },
];

const accountNavItems = [
  { title: "Profile", icon: Settings, path: "/customer-portal/profile" },
  { title: "Billing", icon: CreditCard, path: "/customer-portal/billing" },
  { title: "Help Center", icon: HelpCircle, path: "/customer-portal/help" },
];

export function CustomerPortalSidebar() {
  const location = useLocation();
  const { id: chatbotId } = useParams();
  const isChatbotPage = location.pathname.includes('/customer-portal/chatbots/') && chatbotId;

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={coetanexLogo} alt="Coetanex AI Logo" className="h-10 w-10 object-contain" />
          <div>
            <h2 className="font-bold text-foreground">Customer Portal</h2>
            <p className="text-xs text-muted-foreground">Manage your chatbots</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      end={item.path === "/customer-portal"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {isChatbotPage && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground">Chatbot Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {chatbotNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/customer-portal/chatbots/${chatbotId}${item.path}`}
                        end={item.path === ""}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                            isActive
                              ? "bg-primary/20 text-primary border-l-2 border-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-foreground"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        }`
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          ChatFlow Customer Portal v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
