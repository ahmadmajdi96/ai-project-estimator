import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useSalesmen } from '@/hooks/useSalesmen';
import { useTasks } from '@/hooks/useTasks';
import { useAuth } from '@/hooks/useAuth';
import { UserManagement } from '@/components/crm/UserManagement';
import { 
  Users, FileText, Calendar, TrendingUp, DollarSign, AlertCircle, Shield, 
  LayoutDashboard, Target, Activity, BarChart3, PieChart, ArrowUpRight
} from 'lucide-react';
import { CLIENT_STATUSES, SALES_STAGES } from '@/types/crm';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6'];

export default function CRMDashboard() {
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: events = [] } = useCalendarEvents();
  const { data: salesmen = [] } = useSalesmen();
  const { data: tasks = [] } = useTasks();
  const { role } = useAuth();
  const navigate = useNavigate();

  const isCEO = role === 'ceo';

  // Calculate metrics
  const activeClients = clients.filter(c => c.status === 'active').length;
  const prospectClients = clients.filter(c => c.status === 'prospect').length;
  const totalRevenue = clients.reduce((sum, c) => sum + (c.revenue_to_date || 0), 0);
  const totalContractValue = clients.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted');
  const pendingQuotes = quotes.filter(q => q.status === 'sent' || q.status === 'draft');
  const quotesTotal = quotes.reduce((sum, q) => sum + q.total, 0);
  const conversionRate = quotes.length > 0 ? (acceptedQuotes.length / quotes.length) * 100 : 0;

  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
  const followUps = clients.filter(c => c.follow_up_needed).length;

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

  const upcomingEvents = events
    .filter(e => new Date(e.start_datetime) >= new Date())
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    .slice(0, 5);

  const statusDistribution = CLIENT_STATUSES.map(s => ({
    ...s,
    count: clients.filter(c => c.status === s.value).length,
  }));

  return (
    <CRMLayout title="Dashboard">
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
          {isCEO && (
            <TabsTrigger value="user-management" className="gap-2">
              <Shield className="h-4 w-4" />
              User Management
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">${(totalRevenue / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">Total Revenue</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeClients}</p>
                  <p className="text-xs text-muted-foreground">Active Clients</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{prospectClients}</p>
                  <p className="text-xs text-muted-foreground">Prospects</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{conversionRate.toFixed(0)}%</p>
                  <p className="text-xs text-muted-foreground">Conversion</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{followUps + overdueTasks}</p>
                  <p className="text-xs text-muted-foreground">Actions Needed</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{pendingQuotes.length}</p>
                  <p className="text-xs text-muted-foreground">Pending Quotes</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Status Distribution */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Client Status</h3>
              <div className="space-y-3">
                {statusDistribution.map(s => (
                  <div key={s.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${s.color.split(' ')[0]}`} />
                      <span className="text-sm">{s.label}</span>
                    </div>
                    <span className="font-medium">{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Pipeline Distribution */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Sales Pipeline</h3>
              <div className="space-y-3">
                {salesByStage.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-sm">{s.name}</span>
                    </div>
                    <span className="font-medium">{s.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigate('/crm/calendar')}
                    >
                      <Calendar className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start_datetime), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
              )}
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Quotes</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/crm/sales">View All</Link>
                </Button>
              </div>
              <div className="space-y-2">
                {quotes.slice(0, 5).map((quote) => (
                  <div key={quote.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div>
                      <p className="font-medium text-sm">{quote.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">${quote.total.toLocaleString()}</p>
                      <Badge variant="secondary" className={
                        quote.status === 'accepted' ? 'bg-green-500/10 text-green-500' :
                        quote.status === 'rejected' ? 'bg-red-500/10 text-red-500' :
                        quote.status === 'sent' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-muted text-muted-foreground'
                      }>
                        {quote.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {quotes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No quotes yet</p>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Top Performers</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/crm/salesmen">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {salesmenWithStats.slice(0, 5).map((salesman, index) => (
                  <div key={salesman.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{salesman.name}</p>
                      <p className="text-xs text-muted-foreground">{salesman.clientCount} clients</p>
                    </div>
                    <span className="font-semibold text-sm">${salesman.revenue.toLocaleString()}</span>
                  </div>
                ))}
                {salesmenWithStats.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No salesmen yet</p>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Revenue Trend (6 Months)
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

          {/* Detailed Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contract Value</p>
                  <p className="text-2xl font-bold">${(totalContractValue / 1000).toFixed(0)}k</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={65} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Quote Value</p>
                  <p className="text-2xl font-bold">${(quotesTotal / 1000).toFixed(0)}k</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={45} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Salesmen</p>
                  <p className="text-2xl font-bold">{salesmen.filter(s => s.status === 'active').length}</p>
                </div>
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">of {salesmen.length} total</p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Accepted Quotes</p>
                  <p className="text-2xl font-bold">{acceptedQuotes.length}</p>
                </div>
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">of {quotes.length} total</p>
            </Card>
          </div>
        </TabsContent>

        {isCEO && (
          <TabsContent value="user-management">
            <UserManagement />
          </TabsContent>
        )}
      </Tabs>
    </CRMLayout>
  );
}
