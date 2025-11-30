import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useSalesmen } from '@/hooks/useSalesmen';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, Users, FileText, DollarSign, Target, Calendar,
  ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Activity
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart as RechartsPie, Pie, Cell
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--muted))', '#10b981', '#f59e0b'];

export default function SalesPage() {
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: salesmen = [] } = useSalesmen();
  const { data: events = [] } = useCalendarEvents();
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  // Calculate metrics
  const activeClients = clients.filter(c => c.status === 'active').length;
  const prospectClients = clients.filter(c => c.status === 'prospect').length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.revenue_to_date || 0), 0);
  const totalContractValue = clients.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
  const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'draft');
  const quotesTotal = quotes.reduce((sum, q) => sum + q.total, 0);
  const conversionRate = quotes.length > 0 ? (acceptedQuotes.length / quotes.length) * 100 : 0;

  // Sales by stage
  const salesByStage = [
    { name: 'Pre-Sales', value: clients.filter(c => c.sales_stage === 'pre_sales').length },
    { name: 'Negotiation', value: clients.filter(c => c.sales_stage === 'negotiation').length },
    { name: 'Closing', value: clients.filter(c => c.sales_stage === 'closing').length },
    { name: 'Post-Sales', value: clients.filter(c => c.sales_stage === 'post_sales').length },
    { name: 'Support', value: clients.filter(c => c.sales_stage === 'support').length },
  ];

  // Monthly data for chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - i));
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

    return {
      month: format(date, 'MMM'),
      clients: monthClients.length,
      quotes: monthQuotes.length,
      revenue: monthClients.reduce((sum, c) => sum + (c.contract_value || 0), 0),
    };
  });

  // Top salesmen
  const salesmenWithStats = salesmen.map(s => ({
    ...s,
    clientCount: clients.filter((c: any) => c.salesman_id === s.id).length,
    revenue: clients.filter((c: any) => c.salesman_id === s.id).reduce((sum, c: any) => sum + (c.revenue_to_date || 0), 0),
  })).sort((a, b) => b.revenue - a.revenue);

  return (
    <CRMLayout title="Sales">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Sales Overview</h2>
            <p className="text-muted-foreground">Comprehensive view of all sales activities</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/crm/clients">View Clients</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/crm/quotes">View Quotes</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/crm/pipeline">Pipeline</Link>
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 text-sm text-green-500">
                <ArrowUpRight className="h-3 w-3" />
                <span>12% vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                  <p className="text-2xl font-bold">{activeClients}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-accent" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{prospectClients} prospects</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Quotes</p>
                  <p className="text-2xl font-bold">{pendingQuotes.length}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-yellow-500" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">${quotesTotal.toLocaleString()} total</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Conversion Rate</p>
                  <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
              </div>
              <Progress value={conversionRate} className="mt-2 h-1.5" />
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Sales Trend
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
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.2} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Pipeline Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <RechartsPie>
                  <Pie
                    data={salesByStage.filter(s => s.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {salesByStage.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPie>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Salesmen Performance */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesmenWithStats.slice(0, 5).map((salesman, index) => (
                <div key={salesman.id} className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <Link to={`/crm/salesmen`} className="font-medium hover:underline">
                        {salesman.name}
                      </Link>
                      <span className="font-semibold">${salesman.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{salesman.clientCount} clients</span>
                      <span>•</span>
                      <span>{salesman.territory || 'No territory'}</span>
                    </div>
                  </div>
                  <Progress value={(salesman.revenue / (salesmenWithStats[0]?.revenue || 1)) * 100} className="w-24 h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quotes.slice(0, 5).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium">{quote.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${quote.total.toLocaleString()}</p>
                      <Badge variant="secondary" className={
                        quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                        quote.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        quote.status === 'sent' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-gray-500/10 text-gray-500'
                      }>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {events.filter(e => new Date(e.start_datetime) > new Date()).slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.start_datetime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Badge variant="secondary">{event.event_type}</Badge>
                  </div>
                ))}
                {events.filter(e => new Date(e.start_datetime) > new Date()).length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No upcoming events</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
