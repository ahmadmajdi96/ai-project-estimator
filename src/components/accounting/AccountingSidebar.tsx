import { NavLink } from '@/components/NavLink';
import { 
  LayoutDashboard, 
  BookOpen,
  FileText,
  Users,
  Receipt,
  Building2,
  CreditCard,
  Landmark,
  Clock,
  DollarSign,
  TrendingUp,
  PieChart,
  Settings,
  LogOut,
  Home,
  Package,
  Briefcase,
  Wallet,
  FileSpreadsheet
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';

const overviewItems = [
  { title: 'Dashboard', url: '/accounting', icon: LayoutDashboard },
];

const glItems = [
  { title: 'Chart of Accounts', url: '/accounting/gl/accounts', icon: BookOpen },
  { title: 'Journal Entries', url: '/accounting/gl/journals', icon: FileText },
  { title: 'Trial Balance', url: '/accounting/gl/trial-balance', icon: FileSpreadsheet },
];

const arItems = [
  { title: 'Customers', url: '/accounting/ar/customers', icon: Users },
  { title: 'Invoices', url: '/accounting/ar/invoices', icon: Receipt },
  { title: 'Payments', url: '/accounting/ar/payments', icon: CreditCard },
  { title: 'Aging Report', url: '/accounting/ar/aging', icon: Clock },
];

const apItems = [
  { title: 'Vendors', url: '/accounting/ap/vendors', icon: Building2 },
  { title: 'Bills', url: '/accounting/ap/bills', icon: FileText },
  { title: 'Payments', url: '/accounting/ap/payments', icon: Wallet },
];

const bankingItems = [
  { title: 'Bank Accounts', url: '/accounting/banking/accounts', icon: Landmark },
  { title: 'Transactions', url: '/accounting/banking/transactions', icon: CreditCard },
  { title: 'Reconciliation', url: '/accounting/banking/reconciliation', icon: FileSpreadsheet },
];

const payrollItems = [
  { title: 'Employees', url: '/accounting/payroll/employees', icon: Users },
  { title: 'Payroll Runs', url: '/accounting/payroll/runs', icon: DollarSign },
  { title: 'Paystubs', url: '/accounting/payroll/paystubs', icon: Receipt },
];

const expenseItems = [
  { title: 'Expenses', url: '/accounting/expenses', icon: Receipt },
];

const reportsItems = [
  { title: 'Financial Reports', url: '/accounting/reports', icon: PieChart },
  { title: 'Budgets', url: '/accounting/budgets', icon: TrendingUp },
];

const assetsItems = [
  { title: 'Fixed Assets', url: '/accounting/assets', icon: Briefcase },
  { title: 'Inventory', url: '/accounting/inventory', icon: Package },
];

const projectItems = [
  { title: 'Projects', url: '/accounting/projects', icon: Briefcase },
  { title: 'Time Entries', url: '/accounting/time', icon: Clock },
];

const settingsItems = [
  { title: 'Settings', url: '/accounting/settings', icon: Settings },
];

export function AccountingSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
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
              end={item.url === '/accounting'}
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          {!collapsed && <span className="font-display font-bold text-lg">Accounting</span>}
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(overviewItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>General Ledger</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(glItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Accounts Receivable</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(arItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Accounts Payable</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(apItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Banking</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(bankingItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Payroll</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(payrollItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Expenses</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(expenseItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(reportsItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Assets</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(assetsItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(projectItems)}</SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>{renderMenuItems(settingsItems)}</SidebarGroupContent>
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
