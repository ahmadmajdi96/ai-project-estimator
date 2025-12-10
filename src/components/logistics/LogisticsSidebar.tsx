import { useLocation, useNavigate } from "react-router-dom";
import { useRef, useEffect } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Truck,
  Package,
  Users,
  MapPin,
  FileText,
  DollarSign,
  Settings,
  Building2,
  Route,
  Clock,
  BarChart3,
  Receipt,
  Fuel,
  LogOut,
  Calculator,
} from "lucide-react";
import coetanexLogo from '@/assets/coetanex-logo.png';
import { Button } from "@/components/ui/button";
import { useAccountingAuth } from "@/hooks/useAccountingAuth";

const menuGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/logistics", icon: LayoutDashboard },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Shipments", url: "/logistics/shipments", icon: Package },
      { title: "Dispatch Board", url: "/logistics/dispatch", icon: Route },
      { title: "Tracking", url: "/logistics/tracking", icon: MapPin },
      { title: "Load Planning", url: "/logistics/planning", icon: Clock },
    ],
  },
  {
    label: "Fleet & Carriers",
    items: [
      { title: "Carriers", url: "/logistics/carriers", icon: Truck },
      { title: "Equipment", url: "/logistics/equipment", icon: Building2 },
      { title: "Rate Contracts", url: "/logistics/rates", icon: FileText },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Customer Billing", url: "/logistics/billing", icon: Receipt },
      { title: "Carrier Settlements", url: "/logistics/settlements", icon: DollarSign },
      { title: "Driver Expenses", url: "/logistics/expenses", icon: Fuel },
    ],
  },
  {
    label: "Reports",
    items: [
      { title: "Analytics", url: "/logistics/analytics", icon: BarChart3 },
      { title: "P&L by Lane", url: "/logistics/pnl", icon: Calculator },
    ],
  },
  {
    label: "Settings",
    items: [
      { title: "Configuration", url: "/logistics/settings", icon: Settings },
    ],
  },
];

export function LogisticsSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, fullName, company } = useAccountingAuth();
  const activeRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [location.pathname]);

  const isActive = (url: string) => {
    if (url === "/logistics") {
      return location.pathname === "/logistics";
    }
    return location.pathname.startsWith(url);
  };

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={coetanexLogo} alt="Coetanex AI Logo" className="w-10 h-10 object-contain" />
          <div>
            <h2 className="font-semibold text-foreground">Logistics</h2>
            <p className="text-xs text-muted-foreground">{company?.name || 'Logistics Portal'}</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-180px)]">
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem 
                      key={item.title}
                      ref={isActive(item.url) ? activeRef : null}
                    >
                      <SidebarMenuButton
                        onClick={() => navigate(item.url)}
                        isActive={isActive(item.url)}
                        className="w-full"
                      >
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </ScrollArea>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <p className="font-medium text-foreground">{fullName || 'User'}</p>
            <p className="text-xs text-muted-foreground">Dispatcher</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
