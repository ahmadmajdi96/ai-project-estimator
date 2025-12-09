import { NavLink, useNavigate } from 'react-router-dom';
import { useAccountingAuth } from '@/hooks/useAccountingAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calculator,
  LayoutDashboard,
  BookOpen,
  FileText,
  Receipt,
  Building2,
  CreditCard,
  Landmark,
  Users,
  Clock,
  DollarSign,
  TrendingUp,
  PieChart,
  Settings,
  LogOut,
  FileSpreadsheet,
  Package,
  Briefcase,
  Wallet,
  ArrowLeftRight,
} from 'lucide-react';

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
  { title: 'Invoices', url: '/accounting/ar/invoices', icon: FileText },
  { title: 'Payments', url: '/accounting/ar/payments', icon: CreditCard },
  { title: 'Aging Report', url: '/accounting/ar/aging', icon: Clock },
];

const apItems = [
  { title: 'Vendors', url: '/accounting/ap/vendors', icon: Building2 },
  { title: 'Bills', url: '/accounting/ap/bills', icon: Receipt },
  { title: 'Payments', url: '/accounting/ap/payments', icon: Wallet },
];

const bankingItems = [
  { title: 'Bank Accounts', url: '/accounting/banking/accounts', icon: Landmark },
  { title: 'Transactions', url: '/accounting/banking/transactions', icon: ArrowLeftRight },
  { title: 'Reconciliation', url: '/accounting/banking/reconciliation', icon: FileSpreadsheet },
];

const payrollItems = [
  { title: 'Employees', url: '/accounting/payroll/employees', icon: Users },
  { title: 'Payroll Runs', url: '/accounting/payroll/runs', icon: DollarSign },
  { title: 'Paystubs', url: '/accounting/payroll/paystubs', icon: FileText },
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
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut, canAccess, accountingUser, company } = useAccountingAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/accounting/auth');
  };

  const renderMenuItems = (items: typeof overviewItems, requiredFeature?: string) => {
    if (requiredFeature && !canAccess(requiredFeature)) return null;
    
    return items.map((item) => (
      <SidebarMenuItem key={item.title}>
        <SidebarMenuButton asChild>
          <NavLink
            to={item.url}
            end={item.url === '/accounting'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="h-4 w-4" />
            {!collapsed && <span>{item.title}</span>}
          </NavLink>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));
  };

  return (
    <Sidebar className="border-r border-slate-800 bg-slate-950">
      <SidebarHeader className="p-4 border-b border-slate-800">
        <NavLink to="/accounting" className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Calculator className="h-6 w-6 text-emerald-400" />
          </div>
          {!collapsed && (
            <div>
              <span className="text-lg font-bold text-white">AccountingPro</span>
              {company && (
                <p className="text-xs text-slate-500 truncate max-w-[150px]">{company.name}</p>
              )}
            </div>
          )}
        </NavLink>
      </SidebarHeader>

      <SidebarContent className="bg-slate-950">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'Overview'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(overviewItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'General Ledger'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(glItems, 'gl')}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'Receivables'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(arItems, 'ar')}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'Payables'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(apItems, 'ap')}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'Banking'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(bankingItems, 'banking')}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {canAccess('payroll') && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
                {!collapsed && 'Payroll'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenuItems(payrollItems, 'payroll')}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'Expenses'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(expenseItems, 'expenses')}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'Reports'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(reportsItems, 'reports')}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {canAccess('assets') && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
                {!collapsed && 'Assets'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenuItems(assetsItems, 'assets')}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {canAccess('projects') && (
            <SidebarGroup>
              <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
                {!collapsed && 'Projects'}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{renderMenuItems(projectItems, 'projects')}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-500 text-xs uppercase tracking-wider px-3">
              {!collapsed && 'System'}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderMenuItems(settingsItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </ScrollArea>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-slate-800 bg-slate-950">
        <Button
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!collapsed && 'Sign Out'}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
