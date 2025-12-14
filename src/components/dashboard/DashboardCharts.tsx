import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useInvoices } from '@/hooks/useInvoices';
import { useShipments } from '@/hooks/useLogistics';
import { useTasks } from '@/hooks/useTasks';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useHRDashboardStats } from '@/hooks/useHR';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell, BarChart, Bar, LineChart, Line, Legend
} from 'recharts';
import { TrendingUp, PieChart, BarChart3, Activity } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export function DashboardCharts() {
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: invoices = [] } = useInvoices();
  const { data: shipments = [] } = useShipments();
  const { data: tasks = [] } = useTasks();
  const { data: supportTickets = [] } = useSupportTickets();
  const { data: hrStats } = useHRDashboardStats();

  // Monthly trend data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
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

    const monthShipments = shipments.filter(s => {
      const created = new Date(s.created_at);
      return isWithinInterval(created, { start: monthStart, end: monthEnd });
    });

    const monthInvoices = invoices.filter(inv => {
      const created = new Date(inv.created_at);
      return isWithinInterval(created, { start: monthStart, end: monthEnd });
    });

    return {
      month: format(date, 'MMM'),
      clients: monthClients.length,
      quotes: monthQuotes.length,
      revenue: monthInvoices.reduce((sum, i) => sum + (i.total_amount || 0), 0) + 
               monthShipments.reduce((sum, s) => sum + ((s.total_revenue || 0) / 100), 0),
      shipments: monthShipments.length,
    };
  });

  // Portal activity distribution
  const portalDistribution = [
    { name: 'CRM', value: clients.length + quotes.length },
    { name: 'Logistics', value: shipments.length },
    { name: 'Accounting', value: invoices.length },
    { name: 'HR', value: hrStats?.totalEmployees || 0 },
    { name: 'Support', value: supportTickets.length },
    { name: 'Tasks', value: tasks.length },
  ].filter(d => d.value > 0);

  // Task status breakdown
  const taskStatusData = [
    { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, fill: '#f59e0b' },
    { name: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, fill: '#3b82f6' },
    { name: 'Done', value: tasks.filter(t => t.status === 'done').length, fill: '#10b981' },
  ];

  // Performance metrics
  const performanceData = [
    { 
      metric: 'Quotes',
      total: quotes.length,
      converted: quotes.filter(q => q.status === 'accepted').length,
    },
    { 
      metric: 'Shipments',
      total: shipments.length,
      converted: shipments.filter(s => s.status === 'delivered').length,
    },
    { 
      metric: 'Invoices',
      total: invoices.length,
      converted: invoices.filter(i => i.status === 'paid').length,
    },
    { 
      metric: 'Tickets',
      total: supportTickets.length,
      converted: supportTickets.filter(t => t.status === 'resolved').length,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Revenue Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portal Distribution */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <PieChart className="h-5 w-5 text-primary" />
              Activity by Portal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPie>
                <Pie
                  data={portalDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {portalDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="middle" 
                  align="right" 
                  layout="vertical"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Activity */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-5 w-5 text-primary" />
              Monthly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="clients" fill="hsl(var(--primary))" name="Clients" radius={[4, 4, 0, 0]} />
                <Bar dataKey="quotes" fill="#10b981" name="Quotes" radius={[4, 4, 0, 0]} />
                <Bar dataKey="shipments" fill="#f59e0b" name="Shipments" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Conversion Rates */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />
              Conversion Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={performanceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis dataKey="metric" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="total" fill="hsl(var(--muted))" name="Total" radius={[0, 4, 4, 0]} />
                <Bar dataKey="converted" fill="#10b981" name="Completed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Task Status Summary */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Task Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {taskStatusData.map((status) => (
              <div key={status.name} className="text-center p-4 rounded-lg bg-muted/30">
                <div 
                  className="w-3 h-3 rounded-full mx-auto mb-2" 
                  style={{ backgroundColor: status.fill }} 
                />
                <p className="text-2xl font-bold">{status.value}</p>
                <p className="text-sm text-muted-foreground">{status.name}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
