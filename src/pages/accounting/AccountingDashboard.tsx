import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertCircle, 
  LayoutDashboard, BarChart3, Receipt, FileText, 
  ArrowUpRight, Activity, PieChart, Calendar
} from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6'];

// Sample data
const monthlyData = Array.from({ length: 6 }, (_, i) => {
  const date = subMonths(new Date(), 5 - i);
  return {
    month: format(date, 'MMM'),
    revenue: Math.floor(Math.random() * 50000) + 30000,
    expenses: Math.floor(Math.random() * 30000) + 15000,
  };
});

const expenseCategories = [
  { name: 'Payroll', value: 45000 },
  { name: 'Operations', value: 15000 },
  { name: 'Marketing', value: 8000 },
  { name: 'Utilities', value: 3000 },
  { name: 'Other', value: 5000 },
];

const recentTransactions = [
  { id: 1, description: 'Invoice #1001 - ABC Corp', amount: 5000, type: 'income', date: '2024-01-15' },
  { id: 2, description: 'Office Supplies', amount: -250, type: 'expense', date: '2024-01-14' },
  { id: 3, description: 'Invoice #1002 - XYZ Ltd', amount: 3500, type: 'income', date: '2024-01-13' },
  { id: 4, description: 'Payroll - January', amount: -15000, type: 'expense', date: '2024-01-12' },
  { id: 5, description: 'Utility Bill', amount: -450, type: 'expense', date: '2024-01-11' },
];

const overdueInvoices = [
  { id: 1, customer: 'ABC Corp', amount: 2500, daysOverdue: 15 },
  { id: 2, customer: 'DEF Inc', amount: 1800, daysOverdue: 7 },
  { id: 3, customer: 'GHI LLC', amount: 3200, daysOverdue: 3 },
];

const upcomingBills = [
  { id: 1, vendor: 'Office Rent', amount: 5000, dueDate: '2024-01-20' },
  { id: 2, vendor: 'Insurance', amount: 1200, dueDate: '2024-01-25' },
  { id: 3, vendor: 'Internet Service', amount: 150, dueDate: '2024-01-28' },
];

export default function AccountingDashboard() {
  const totalRevenue = 125000;
  const totalExpenses = 76000;
  const netProfit = totalRevenue - totalExpenses;
  const cashBalance = 89500;
  const arBalance = 45000;
  const apBalance = 28000;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AccountingLayout title="Dashboard">
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500/10">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
                  <p className="text-xs text-muted-foreground">Expenses</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(netProfit)}</p>
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(cashBalance)}</p>
                  <p className="text-xs text-muted-foreground">Cash Balance</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Receipt className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(arBalance)}</p>
                  <p className="text-xs text-muted-foreground">A/R Balance</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{formatCurrency(apBalance)}</p>
                  <p className="text-xs text-muted-foreground">A/P Balance</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Expense Categories */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                {expenseCategories.map((cat, i) => (
                  <div key={cat.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm">{cat.name}</span>
                    </div>
                    <span className="font-medium">{formatCurrency(cat.value)}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Overdue Invoices */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Overdue Invoices</h3>
              {overdueInvoices.length > 0 ? (
                <div className="space-y-3">
                  {overdueInvoices.map(invoice => (
                    <div 
                      key={invoice.id} 
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer"
                    >
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{invoice.customer}</p>
                        <p className="text-xs text-muted-foreground">
                          {invoice.daysOverdue} days overdue
                        </p>
                      </div>
                      <span className="font-semibold text-sm text-red-500">
                        {formatCurrency(invoice.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No overdue invoices</p>
              )}
            </Card>

            {/* Upcoming Bills */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Upcoming Bills</h3>
              {upcomingBills.length > 0 ? (
                <div className="space-y-3">
                  {upcomingBills.map(bill => (
                    <div 
                      key={bill.id} 
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer"
                    >
                      <Calendar className="h-4 w-4 text-amber-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{bill.vendor}</p>
                        <p className="text-xs text-muted-foreground">
                          Due {format(new Date(bill.dueDate), 'MMM d, yyyy')}
                        </p>
                      </div>
                      <span className="font-semibold text-sm">
                        {formatCurrency(bill.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming bills</p>
              )}
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Transactions</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/accounting/gl/journals">View All</Link>
                </Button>
              </div>
              <div className="space-y-2">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">{tx.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold text-sm ${tx.amount >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.amount >= 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </p>
                      <Badge variant="secondary" className={
                        tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }>
                        {tx.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/accounting/ar/invoices">
                    <Receipt className="h-5 w-5" />
                    <span>New Invoice</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/accounting/ap/bills">
                    <FileText className="h-5 w-5" />
                    <span>Record Bill</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/accounting/gl/journals">
                    <DollarSign className="h-5 w-5" />
                    <span>Journal Entry</span>
                  </Link>
                </Button>
                <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" asChild>
                  <Link to="/accounting/reports">
                    <BarChart3 className="h-5 w-5" />
                    <span>View Reports</span>
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Revenue vs Expenses (6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      fill="#10b981" 
                      fillOpacity={0.2}
                      name="Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expenses" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.2}
                      name="Expenses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Expense Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={expenseCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name }) => `${name}`}
                    >
                      {expenseCategories.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Profit Margin</p>
                  <p className="text-2xl font-bold">{((netProfit / totalRevenue) * 100).toFixed(1)}%</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              </div>
              <Progress value={(netProfit / totalRevenue) * 100} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">A/R Collection</p>
                  <p className="text-2xl font-bold">85%</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              </div>
              <Progress value={85} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Used</p>
                  <p className="text-2xl font-bold">72%</p>
                </div>
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <Progress value={72} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">YTD Growth</p>
                  <p className="text-2xl font-bold">+12.5%</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-500" />
              </div>
              <Progress value={62} className="mt-2 h-1.5" />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AccountingLayout>
  );
}
