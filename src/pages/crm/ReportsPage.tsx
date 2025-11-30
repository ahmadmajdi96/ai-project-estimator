import { useState, useRef } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useSalesmen } from '@/hooks/useSalesmen';
import { useKPIDefinitions, useKPIRecords } from '@/hooks/useKPIs';
import { useTasks } from '@/hooks/useTasks';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { 
  Download, TrendingUp, Users, DollarSign, Target, FileText, 
  BarChart3, PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from 'date-fns';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ReportsPage() {
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: salesmen = [] } = useSalesmen();
  const { data: kpis = [] } = useKPIDefinitions();
  const { data: kpiRecords = [] } = useKPIRecords();
  const { data: tasks = [] } = useTasks();
  const [period, setPeriod] = useState<string>('6');
  const chartRef = useRef<HTMLDivElement>(null);

  const monthsCount = parseInt(period);

  // Generate monthly data
  const monthlyData = Array.from({ length: monthsCount }, (_, i) => {
    const date = subMonths(new Date(), monthsCount - 1 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const monthClients = clients.filter(c => {
      const created = new Date(c.created_at);
      return isWithinInterval(created, { start: monthStart, end: monthEnd });
    });

    const monthQuotes = quotes.filter(q => {
      const created = new Date(q.created_at);
      return isWithinInterval(created, { start: monthStart, end: monthEnd });
    });

    const acceptedQuotes = monthQuotes.filter(q => q.status === 'accepted');

    return {
      month: format(date, 'MMM yyyy'),
      shortMonth: format(date, 'MMM'),
      newClients: monthClients.length,
      revenue: monthClients.reduce((sum, c) => sum + (c.contract_value || 0), 0),
      quotes: monthQuotes.length,
      acceptedQuotes: acceptedQuotes.length,
      quoteValue: monthQuotes.reduce((sum, q) => sum + q.total, 0),
    };
  });

  // Client acquisition by status
  const clientsByStatus = [
    { name: 'Active', value: clients.filter(c => c.status === 'active').length, color: '#10b981' },
    { name: 'Prospect', value: clients.filter(c => c.status === 'prospect').length, color: '#3b82f6' },
    { name: 'Inactive', value: clients.filter(c => c.status === 'inactive').length, color: '#f59e0b' },
    { name: 'Former', value: clients.filter(c => c.status === 'former').length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Clients by industry
  const industryData = Object.entries(
    clients.reduce((acc, c) => {
      const industry = c.industry || 'Other';
      acc[industry] = (acc[industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Salesman performance
  const salesmenPerformance = salesmen.map(s => {
    const salesmanClients = clients.filter((c: any) => c.salesman_id === s.id);
    return {
      name: s.name.split(' ')[0],
      clients: salesmanClients.length,
      revenue: salesmanClients.reduce((sum, c: any) => sum + (c.revenue_to_date || 0), 0),
      contractValue: salesmanClients.reduce((sum, c: any) => sum + (c.contract_value || 0), 0),
      target: s.target_monthly || 0,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Quote conversion
  const quotesByStatus = [
    { name: 'Accepted', value: quotes.filter(q => q.status === 'accepted').length, color: '#10b981' },
    { name: 'Sent', value: quotes.filter(q => q.status === 'sent').length, color: '#3b82f6' },
    { name: 'Draft', value: quotes.filter(q => q.status === 'draft').length, color: '#94a3b8' },
    { name: 'Rejected', value: quotes.filter(q => q.status === 'rejected').length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Task completion
  const tasksByStatus = [
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#10b981' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Todo', value: tasks.filter(t => t.status === 'todo').length, color: '#f59e0b' },
    { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#8b5cf6' },
    { name: 'Blocked', value: tasks.filter(t => t.status === 'blocked').length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Summary metrics
  const totalRevenue = clients.reduce((sum, c) => sum + (c.revenue_to_date || 0), 0);
  const totalContractValue = clients.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  const conversionRate = quotes.length > 0 
    ? (quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100 
    : 0;

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}.csv`);
  };

  return (
    <CRMLayout title="Reports">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Reports & Analytics</h2>
            <p className="text-muted-foreground">Comprehensive business performance insights</p>
          </div>
          <div className="flex gap-3">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">Last 3 months</SelectItem>
                <SelectItem value="6">Last 6 months</SelectItem>
                <SelectItem value="12">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalRevenue / 1000000).toFixed(2)}M</p>
                <p className="text-xs text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{clients.length}</p>
                <p className="text-xs text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quotes.length}</p>
                <p className="text-xs text-muted-foreground">Total Quotes</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">Conversion Rate</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="revenue" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="revenue" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Revenue
            </TabsTrigger>
            <TabsTrigger value="clients" className="gap-2">
              <Users className="h-4 w-4" />
              Clients
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Sales Team
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <Activity className="h-4 w-4" />
              Operations
            </TabsTrigger>
          </TabsList>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Revenue Trend</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(monthlyData, 'revenue_trend')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="shortMonth" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000)}k`} />
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                        contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quote Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={quotesByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {quotesByStatus.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Monthly Quote Value</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportToCSV(monthlyData, 'quote_value')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="shortMonth" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000)}k`} />
                    <Tooltip 
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Quote Value']}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="quoteValue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Client Acquisition</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => exportToCSV(monthlyData, 'client_acquisition')}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="shortMonth" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Line type="monotone" dataKey="newClients" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Clients by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={clientsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {clientsByStatus.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Clients by Industry</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportToCSV(industryData, 'clients_by_industry')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={industryData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" width={100} />
                    <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Team Tab */}
          <TabsContent value="sales" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Salesman Performance</CardTitle>
                <Button variant="outline" size="sm" onClick={() => exportToCSV(salesmenPerformance, 'salesman_performance')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={salesmenPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `$${(v/1000)}k`} />
                    <Tooltip 
                      formatter={(value: number, name: string) => [`$${value.toLocaleString()}`, name === 'revenue' ? 'Revenue' : 'Contract Value']}
                      contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Bar dataKey="revenue" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="contractValue" name="Contract Value" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Team Leaderboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {salesmenPerformance.slice(0, 8).map((s, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        i === 0 ? 'bg-amber-500 text-white' : 
                        i === 1 ? 'bg-gray-400 text-white' : 
                        i === 2 ? 'bg-amber-700 text-white' : 
                        'bg-muted text-muted-foreground'
                      }`}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.clients} clients</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${s.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={tasksByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {tasksByStatus.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quotes vs Accepted Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="shortMonth" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                      <Legend />
                      <Line type="monotone" dataKey="quotes" name="Total Quotes" stroke="hsl(var(--primary))" strokeWidth={2} />
                      <Line type="monotone" dataKey="acceptedQuotes" name="Accepted" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Active Clients</p>
                    <p className="text-2xl font-bold">{clients.filter(c => c.status === 'active').length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Pending Tasks</p>
                    <p className="text-2xl font-bold">{tasks.filter(t => t.status !== 'done').length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Active Salesmen</p>
                    <p className="text-2xl font-bold">{salesmen.filter(s => s.status === 'active').length}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <p className="text-sm text-muted-foreground">Avg Contract Value</p>
                    <p className="text-2xl font-bold">${clients.length > 0 ? Math.round(totalContractValue / clients.length).toLocaleString() : 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
