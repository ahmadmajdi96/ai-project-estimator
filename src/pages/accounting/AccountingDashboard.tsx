import { useAccountingAuth } from '@/hooks/useAccountingAuth';
import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Receipt,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

// Sample data
const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 32000 },
  { month: 'Feb', revenue: 52000, expenses: 35000 },
  { month: 'Mar', revenue: 48000, expenses: 31000 },
  { month: 'Apr', revenue: 61000, expenses: 38000 },
  { month: 'May', revenue: 55000, expenses: 34000 },
  { month: 'Jun', revenue: 67000, expenses: 42000 },
];

const cashFlowData = [
  { month: 'Jan', inflow: 65000, outflow: 45000 },
  { month: 'Feb', inflow: 72000, outflow: 52000 },
  { month: 'Mar', inflow: 58000, outflow: 48000 },
  { month: 'Apr', inflow: 81000, outflow: 55000 },
  { month: 'May', inflow: 75000, outflow: 51000 },
  { month: 'Jun', inflow: 87000, outflow: 58000 },
];

const expenseBreakdown = [
  { name: 'Payroll', value: 45, color: '#10b981' },
  { name: 'Operations', value: 25, color: '#3b82f6' },
  { name: 'Marketing', value: 15, color: '#8b5cf6' },
  { name: 'Utilities', value: 10, color: '#f59e0b' },
  { name: 'Other', value: 5, color: '#6b7280' },
];

const recentTransactions = [
  { id: 1, type: 'income', description: 'Payment from Acme Corp', amount: 5250, date: '2024-01-15', status: 'completed' },
  { id: 2, type: 'expense', description: 'Office supplies', amount: -342, date: '2024-01-14', status: 'completed' },
  { id: 3, type: 'income', description: 'Invoice #1042', amount: 12800, date: '2024-01-13', status: 'pending' },
  { id: 4, type: 'expense', description: 'Software subscription', amount: -299, date: '2024-01-12', status: 'completed' },
  { id: 5, type: 'expense', description: 'Vendor payment - SupplyCo', amount: -4500, date: '2024-01-11', status: 'processing' },
];

const upcomingPayables = [
  { vendor: 'SupplyCo Inc', amount: 8500, dueDate: '2024-01-20', daysUntil: 5 },
  { vendor: 'Tech Solutions', amount: 2400, dueDate: '2024-01-22', daysUntil: 7 },
  { vendor: 'Office Pro', amount: 1250, dueDate: '2024-01-25', daysUntil: 10 },
];

const overdueReceivables = [
  { customer: 'Beta Corp', amount: 15000, dueDate: '2024-01-05', daysOverdue: 10 },
  { customer: 'StartupXYZ', amount: 4200, dueDate: '2024-01-08', daysOverdue: 7 },
];

export default function AccountingDashboard() {
  const { fullName, accountingUser, company } = useAccountingAuth();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: company?.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {accountingUser?.first_name}!
            </h1>
            <p className="text-slate-400">
              Here's what's happening with your finances today.
            </p>
          </div>
          <div className="flex gap-3">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <FileText className="mr-2 h-4 w-4" />
              Create Invoice
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatCurrency(328000)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">12.5%</span>
                    <span className="text-sm text-slate-500">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Expenses</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatCurrency(212000)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowDownRight className="h-4 w-4 text-red-400" />
                    <span className="text-sm text-red-400">8.2%</span>
                    <span className="text-sm text-slate-500">vs last month</span>
                  </div>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full">
                  <Receipt className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Net Profit</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatCurrency(116000)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">35.4%</span>
                    <span className="text-sm text-slate-500">margin</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <TrendingUp className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Cash Balance</p>
                  <p className="text-2xl font-bold text-white mt-1">{formatCurrency(89500)}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">5.1%</span>
                    <span className="text-sm text-slate-500">vs last week</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <CreditCard className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue vs Expenses Chart */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Revenue vs Expenses</CardTitle>
              <CardDescription className="text-slate-400">Monthly comparison</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" tickFormatter={(value) => `$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      labelStyle={{ color: '#f8fafc' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" fillOpacity={1} fill="url(#colorExpenses)" name="Expenses" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Expense Breakdown</CardTitle>
              <CardDescription className="text-slate-400">By category this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                      formatter={(value: number) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {expenseBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-400">{item.name}</span>
                    <span className="text-sm text-white ml-auto">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions */}
          <Card className="bg-slate-800/50 border-slate-700 lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white">Recent Transactions</CardTitle>
                <CardDescription className="text-slate-400">Latest financial activity</CardDescription>
              </div>
              <Button variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${tx.type === 'income' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                        {tx.type === 'income' ? (
                          <ArrowUpRight className={`h-4 w-4 text-emerald-400`} />
                        ) : (
                          <ArrowDownRight className={`h-4 w-4 text-red-400`} />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{tx.description}</p>
                        <p className="text-xs text-slate-500">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          tx.status === 'completed' ? 'border-emerald-500/50 text-emerald-400' :
                          tx.status === 'pending' ? 'border-yellow-500/50 text-yellow-400' :
                          'border-blue-500/50 text-blue-400'
                        }`}
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & Tasks */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Alerts & Tasks</CardTitle>
              <CardDescription className="text-slate-400">Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Overdue Receivables */}
              {overdueReceivables.length > 0 && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">Overdue Invoices</span>
                  </div>
                  {overdueReceivables.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm mt-2">
                      <span className="text-slate-400">{item.customer}</span>
                      <span className="text-white">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming Payables */}
              <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm font-medium text-yellow-400">Upcoming Bills</span>
                </div>
                {upcomingPayables.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm mt-2">
                    <span className="text-slate-400">{item.vendor}</span>
                    <span className="text-white">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>

              {/* Quick Tasks */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-400">Quick Tasks</p>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
                  <div className="w-4 h-4 rounded border border-slate-600" />
                  <span className="text-sm text-slate-300">Reconcile bank statements</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-slate-500 line-through">Review pending approvals</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded bg-slate-800/50">
                  <div className="w-4 h-4 rounded border border-slate-600" />
                  <span className="text-sm text-slate-300">Submit Q4 tax filings</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AccountingLayout>
  );
}
