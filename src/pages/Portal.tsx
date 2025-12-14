import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  LayoutDashboard, Users, Loader2, LogOut, Bot, Calculator, Truck, 
  Brain, TrendingUp, MessageSquare, Lightbulb, Scale, BarChart3,
  DollarSign, Package, UserCheck, Activity, AlertTriangle, CheckCircle,
  Target, FileText, Briefcase, HeadphonesIcon, Clock, Star, ArrowUpRight,
  ArrowDownRight, PieChart, Zap, Shield, RefreshCw, Building2
} from 'lucide-react';
import coetanexLogo from '@/assets/coetanex-logo.png';
import { useShipments, useCarriers, useDriverExpenses, useCarrierSettlements } from '@/hooks/useLogistics';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { useTasks } from '@/hooks/useTasks';
import { useInvoices } from '@/hooks/useInvoices';
import { useQuotes } from '@/hooks/useQuotes';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useDepartments } from '@/hooks/useDepartments';
import { useKPIDefinitions } from '@/hooks/useKPIs';
import { useStrategicGoals } from '@/hooks/useStrategicGoals';
import { useProducts } from '@/hooks/useProducts';
import { useEnterpriseAI } from '@/hooks/useEnterpriseAI';
import { useHRDashboardStats } from '@/hooks/useHR';
import { Textarea } from '@/components/ui/textarea';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { DashboardUserManagement } from '@/components/dashboard/DashboardUserManagement';
import { DashboardCharts } from '@/components/dashboard/DashboardCharts';

const portals = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard, path: '/dashboard', gradient: 'from-slate-500 to-zinc-600' },
  { id: 'crm', name: 'CRM', icon: Users, path: '/crm', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'management', name: 'Management', icon: UserCheck, path: '/management', gradient: 'from-purple-500 to-pink-500' },
  { id: 'hr', name: 'HR', icon: Building2, path: '/hr', gradient: 'from-teal-500 to-green-500' },
  { id: 'accounting', name: 'Accounting', icon: Calculator, path: '/accounting', gradient: 'from-amber-500 to-orange-500' },
  { id: 'logistics', name: 'Logistics', icon: Truck, path: '/logistics', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'chatflow', name: 'ChatFlow', icon: Bot, path: '/chatflow', gradient: 'from-rose-500 to-red-500' },
  { id: 'analytics', name: 'Analytics', icon: BarChart3, path: '/dashboard?tab=analytics', gradient: 'from-indigo-500 to-blue-600' },
  { id: 'ai', name: 'AI Center', icon: Brain, path: '/dashboard?tab=ai', gradient: 'from-violet-500 to-purple-600' },
];

export default function Portal() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInput, setAiInput] = useState('');
  const [aiSubTab, setAiSubTab] = useState('chat');

  // CRM Data
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: supportTickets = [] } = useSupportTickets();
  const { data: opportunities = [] } = useOpportunities();
  const { data: products = [] } = useProducts();

  // Management Data
  const { data: employees = [] } = useEmployees();
  const { data: tasks = [] } = useTasks();
  const { data: departments = [] } = useDepartments();
  const { data: kpis = [] } = useKPIDefinitions();
  const { data: strategicGoals = [] } = useStrategicGoals();

  // Accounting Data
  const { data: invoices = [] } = useInvoices();

  // Logistics Data
  const { data: shipments = [] } = useShipments();
  const { data: carriers = [] } = useCarriers();
  const { data: driverExpenses = [] } = useDriverExpenses();
  const { data: settlements = [] } = useCarrierSettlements();

  // HR Data
  const { data: hrStats } = useHRDashboardStats();

  // Comprehensive AI Context with ALL data
  const aiContext = useMemo(() => ({
    // CRM Portal Data
    crm: {
      clients: {
        total: clients.length,
        byStatus: clients.reduce((acc, c) => {
          acc[c.status || 'unknown'] = (acc[c.status || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        recentClients: clients.slice(0, 5).map(c => ({ name: c.client_name, status: c.status })),
      },
      quotes: {
        total: quotes.length,
        totalValue: quotes.reduce((sum, q) => sum + (q.subtotal || 0), 0),
        byStatus: quotes.reduce((acc, q) => {
          acc[q.status || 'draft'] = (acc[q.status || 'draft'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      opportunities: {
        total: opportunities.length,
        totalValue: opportunities.reduce((sum, o) => sum + (o.value || 0), 0),
        byStage: opportunities.reduce((acc, o) => {
          acc[o.sales_stage || 'unknown'] = (acc[o.sales_stage || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      supportTickets: {
        total: supportTickets.length,
        open: supportTickets.filter(t => t.status === 'open').length,
        inProgress: supportTickets.filter(t => t.status === 'in_progress').length,
        resolved: supportTickets.filter(t => t.status === 'resolved').length,
        byPriority: supportTickets.reduce((acc, t) => {
          acc[t.priority || 'medium'] = (acc[t.priority || 'medium'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      products: {
        total: products.length,
        active: products.filter(p => p.is_active).length,
      },
    },
    // Management Portal Data
    management: {
      employees: {
        total: employees.length,
        byDepartment: employees.reduce((acc, e) => {
          acc[e.departments?.name || 'unassigned'] = (acc[e.departments?.name || 'unassigned'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
      tasks: {
        total: tasks.length,
        byStatus: tasks.reduce((acc, t) => {
          acc[t.status || 'todo'] = (acc[t.status || 'todo'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        byPriority: tasks.reduce((acc, t) => {
          acc[t.priority || 'medium'] = (acc[t.priority || 'medium'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
      },
      departments: {
        total: departments.length,
        list: departments.map(d => d.name),
      },
      kpis: {
        total: kpis.length,
        list: kpis.slice(0, 10).map(k => ({ name: k.name, target: k.target_value })),
      },
      strategicGoals: {
        total: strategicGoals.length,
        byStatus: strategicGoals.reduce((acc, g) => {
          acc[g.status || 'active'] = (acc[g.status || 'active'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      },
    },
    // Accounting Portal Data
    accounting: {
      invoices: {
        total: invoices.length,
        totalValue: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
        byStatus: invoices.reduce((acc, i) => {
          acc[i.status || 'draft'] = (acc[i.status || 'draft'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        overdue: invoices.filter(i => i.due_date && new Date(i.due_date) < new Date() && i.status !== 'paid').length,
      },
    },
    // Logistics Portal Data
    logistics: {
      shipments: {
        total: shipments.length,
        byStatus: shipments.reduce((acc, s) => {
          acc[s.status || 'pending'] = (acc[s.status || 'pending'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalRevenue: shipments.reduce((sum, s) => sum + (s.total_revenue || 0), 0),
        totalMargin: shipments.reduce((sum, s) => sum + (s.margin || 0), 0),
        avgMarginPercent: shipments.length > 0 && shipments.reduce((sum, s) => sum + (s.total_revenue || 0), 0) > 0
          ? ((shipments.reduce((sum, s) => sum + (s.margin || 0), 0) / shipments.reduce((sum, s) => sum + (s.total_revenue || 0), 0)) * 100).toFixed(1)
          : 0,
      },
      carriers: {
        total: carriers.length,
        active: carriers.filter(c => c.is_active).length,
        avgPerformance: carriers.length > 0
          ? (carriers.reduce((sum, c) => sum + (c.performance_score || 0), 0) / carriers.length).toFixed(1)
          : 0,
      },
      expenses: {
        total: driverExpenses.length,
        totalAmount: driverExpenses.reduce((sum, e) => sum + (e.amount || 0), 0),
        pending: driverExpenses.filter(e => e.status === 'pending').length,
      },
      settlements: {
        total: settlements.length,
        totalAmount: settlements.reduce((sum, s) => sum + (s.total_amount || 0), 0),
        pending: settlements.filter(s => s.status === 'pending').length,
      },
    },
    // HR Portal Data
    hr: {
      totalEmployees: hrStats?.totalEmployees || 0,
      activeEmployees: hrStats?.activeEmployees || 0,
      newHires: hrStats?.newHires || 0,
      attendance: hrStats?.attendance || { present: 0, absent: 0, late: 0 },
      pendingLeaves: hrStats?.pendingLeaves || 0,
      openJobs: hrStats?.openJobs || 0,
      candidatesByStage: hrStats?.candidatesByStage || {},
    },
    // Summary metrics
    summary: {
      totalRevenue: shipments.reduce((sum, s) => sum + (s.total_revenue || 0), 0) + 
                    invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0) +
                    quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + (q.subtotal || 0), 0),
      totalClients: clients.length,
      totalEmployees: hrStats?.totalEmployees || employees.length,
      openTickets: supportTickets.filter(t => t.status === 'open').length,
      pendingTasks: tasks.filter(t => t.status === 'todo').length,
      activeShipments: shipments.filter(s => ['dispatched', 'in_transit'].includes(s.status || '')).length,
    },
  }), [clients, quotes, opportunities, supportTickets, products, employees, tasks, departments, kpis, strategicGoals, invoices, shipments, carriers, driverExpenses, settlements, hrStats]);

  const { messages, isLoading: aiLoading, sendMessage, clearMessages } = useEnterpriseAI({ context: aiContext });

  // Parse URL for tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handlePortalClick = (portal: typeof portals[0]) => {
    if (portal.id === 'overview') {
      setActiveTab('overview');
      navigate('/dashboard');
    } else if (portal.id === 'ai') {
      setActiveTab('ai');
      navigate('/dashboard?tab=ai');
    } else if (portal.id === 'analytics') {
      setActiveTab('analytics');
      navigate('/dashboard?tab=analytics');
    } else {
      navigate(portal.path);
    }
  };

  const handleAISend = () => {
    if (aiInput.trim() && !aiLoading) {
      sendMessage(aiInput);
      setAiInput('');
    }
  };

  // Calculate comprehensive metrics
  const totalRevenue = (shipments.reduce((sum, s) => sum + (s.total_revenue || 0), 0) / 100) + 
                       invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const totalMargin = shipments.reduce((sum, s) => sum + (s.margin || 0), 0) / 100;
  const activeShipments = shipments.filter(s => ['dispatched', 'in_transit'].includes(s.status || '')).length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const openTickets = supportTickets.filter(t => t.status === 'open').length;
  const totalQuoteValue = quotes.reduce((sum, q) => sum + (q.subtotal || 0), 0);
  const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
  const opportunityValue = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);

  // AI-generated insights based on data
  const generateInsights = useMemo(() => {
    const insights: { type: 'positive' | 'warning' | 'info' | 'critical'; title: string; message: string; metric?: string }[] = [];
    
    // Revenue insights
    if (totalRevenue > 0) {
      insights.push({ type: 'positive', title: 'Revenue Growth', message: `Total revenue of $${totalRevenue.toLocaleString()} across all operations`, metric: `$${totalRevenue.toLocaleString()}` });
    }
    
    // Task insights
    if (pendingTasks > 5) {
      insights.push({ type: 'warning', title: 'Task Backlog', message: `${pendingTasks} tasks are pending. Consider prioritizing or delegating.`, metric: `${pendingTasks} tasks` });
    } else if (completedTasks > pendingTasks) {
      insights.push({ type: 'positive', title: 'Task Progress', message: `Great progress! ${completedTasks} tasks completed vs ${pendingTasks} pending.`, metric: `${Math.round((completedTasks / (completedTasks + pendingTasks)) * 100)}%` });
    }
    
    // Support ticket insights
    if (openTickets > 3) {
      insights.push({ type: 'critical', title: 'Support Queue', message: `${openTickets} open support tickets require attention.`, metric: `${openTickets} open` });
    }
    
    // Logistics insights
    if (activeShipments > 0) {
      insights.push({ type: 'info', title: 'Active Shipments', message: `${activeShipments} shipments currently in transit.`, metric: `${activeShipments} active` });
    }
    
    // Sales insights
    if (acceptedQuotes > 0) {
      insights.push({ type: 'positive', title: 'Sales Performance', message: `${acceptedQuotes} quotes accepted worth $${totalQuoteValue.toLocaleString()}`, metric: `${acceptedQuotes} won` });
    }
    
    // Opportunity insights
    if (opportunityValue > 0) {
      insights.push({ type: 'info', title: 'Pipeline Value', message: `$${opportunityValue.toLocaleString()} in opportunity pipeline`, metric: `$${opportunityValue.toLocaleString()}` });
    }
    
    // Carrier insights
    const inactiveCarriers = carriers.filter(c => !c.is_active).length;
    if (inactiveCarriers > 0) {
      insights.push({ type: 'warning', title: 'Inactive Carriers', message: `${inactiveCarriers} carriers are inactive. Review for optimization.`, metric: `${inactiveCarriers} inactive` });
    }

    return insights;
  }, [totalRevenue, pendingTasks, completedTasks, openTickets, activeShipments, acceptedQuotes, totalQuoteValue, opportunityValue, carriers]);

  // AI Recommendations based on data analysis
  const generateRecommendations = useMemo(() => {
    const recommendations: { priority: 'high' | 'medium' | 'low'; title: string; description: string; action: string }[] = [];
    
    if (pendingTasks > 5) {
      recommendations.push({
        priority: 'high',
        title: 'Reduce Task Backlog',
        description: `You have ${pendingTasks} pending tasks. This may impact team productivity and deadlines.`,
        action: 'Review and prioritize tasks, delegate where possible'
      });
    }
    
    if (openTickets > 3) {
      recommendations.push({
        priority: 'high',
        title: 'Address Support Tickets',
        description: `${openTickets} support tickets are waiting. Customer satisfaction may be affected.`,
        action: 'Assign agents to resolve open tickets'
      });
    }
    
    if (quotes.filter(q => q.status === 'sent').length > 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Follow Up on Quotes',
        description: `${quotes.filter(q => q.status === 'sent').length} quotes are awaiting customer response.`,
        action: 'Schedule follow-up calls with prospects'
      });
    }
    
    if (carriers.filter(c => !c.is_active).length > 2) {
      recommendations.push({
        priority: 'low',
        title: 'Optimize Carrier Network',
        description: `${carriers.filter(c => !c.is_active).length} carriers are inactive in your network.`,
        action: 'Review and either reactivate or remove unused carriers'
      });
    }
    
    if (opportunities.length > 0 && opportunities.filter(o => o.status === 'won').length === 0) {
      recommendations.push({
        priority: 'medium',
        title: 'Close Opportunities',
        description: `You have ${opportunities.length} opportunities but none have closed yet.`,
        action: 'Focus on moving opportunities through the pipeline'
      });
    }

    return recommendations;
  }, [pendingTasks, openTickets, quotes, carriers, opportunities]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <img src={coetanexLogo} alt="Coetanex AI Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="font-display font-bold text-xl">Coetanex AI</h1>
                <p className="text-xs text-muted-foreground">Enterprise Suite</p>
              </div>
            </div>
            
            {/* Portal Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {portals.map((portal) => {
                const Icon = portal.icon;
                const isActive = activeTab === portal.id || 
                  (portal.id !== 'overview' && portal.id !== 'ai' && location.pathname.startsWith(portal.path));
                return (
                  <Button
                    key={portal.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${isActive ? `bg-gradient-to-r ${portal.gradient}` : ''}`}
                    onClick={() => handlePortalClick(portal)}
                  >
                    <Icon className="h-4 w-4" />
                    {portal.name}
                  </Button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role?.replace('_', ' ')}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-b border-border/50 bg-background/80 overflow-x-auto">
        <div className="flex items-center gap-1 p-2 min-w-max">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isActive = activeTab === portal.id;
            return (
              <Button
                key={portal.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`gap-1 text-xs ${isActive ? `bg-gradient-to-r ${portal.gradient}` : ''}`}
                onClick={() => handlePortalClick(portal)}
              >
                <Icon className="h-3 w-3" />
                {portal.name}
              </Button>
            );
          })}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Users className="h-3 w-3" />
                    <span className="text-xs font-medium">Clients</span>
                  </div>
                  <p className="text-xl font-bold">{clients.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-emerald-600 mb-1">
                    <Truck className="h-3 w-3" />
                    <span className="text-xs font-medium">Shipments</span>
                  </div>
                  <p className="text-xl font-bold">{shipments.length}</p>
                  <p className="text-xs text-muted-foreground">{activeShipments} active</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-amber-600 mb-1">
                    <DollarSign className="h-3 w-3" />
                    <span className="text-xs font-medium">Revenue</span>
                  </div>
                  <p className="text-xl font-bold">${totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-lime-500/10 border-green-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-green-600 mb-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs font-medium">Margin</span>
                  </div>
                  <p className="text-xl font-bold">${totalMargin.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <UserCheck className="h-3 w-3" />
                    <span className="text-xs font-medium">Employees</span>
                  </div>
                  <p className="text-xl font-bold">{hrStats?.totalEmployees || employees.length}</p>
                  <p className="text-xs text-muted-foreground">{hrStats?.newHires || 0} new</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-rose-600 mb-1">
                    <Activity className="h-3 w-3" />
                    <span className="text-xs font-medium">Tasks</span>
                  </div>
                  <p className="text-xl font-bold">{tasks.length}</p>
                  <p className="text-xs text-muted-foreground">{pendingTasks} pending</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-orange-600 mb-1">
                    <HeadphonesIcon className="h-3 w-3" />
                    <span className="text-xs font-medium">Tickets</span>
                  </div>
                  <p className="text-xl font-bold">{supportTickets.length}</p>
                  <p className="text-xs text-muted-foreground">{openTickets} open</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-indigo-600 mb-1">
                    <Target className="h-3 w-3" />
                    <span className="text-xs font-medium">Pipeline</span>
                  </div>
                  <p className="text-xl font-bold">${(opportunityValue / 1000).toFixed(0)}k</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <DashboardCharts />

            {/* User Management Section */}
            {(role === 'ceo' || role === 'super_admin') && (
              <DashboardUserManagement />
            )}

            {/* Portal Overview Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CRM Overview */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">CRM</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/crm')}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Clients</p>
                      <p className="font-semibold">{clients.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Opportunities</p>
                      <p className="font-semibold">{opportunities.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Quotes</p>
                      <p className="font-semibold">{quotes.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Products</p>
                      <p className="font-semibold">{products.length}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span>Quote Conversion</span>
                      <span>{quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Management Overview */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <UserCheck className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Management</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/management')}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employees</p>
                      <p className="font-semibold">{employees.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Departments</p>
                      <p className="font-semibold">{departments.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Tasks</p>
                      <p className="font-semibold">{tasks.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">KPIs</p>
                      <p className="font-semibold">{kpis.length}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span>Task Completion</span>
                      <span>{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Accounting Overview */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Calculator className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Accounting</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/accounting')}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Invoices</p>
                      <p className="font-semibold">{invoices.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Value</p>
                      <p className="font-semibold">${invoices.reduce((s, i) => s + (i.total_amount || 0), 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Paid</p>
                      <p className="font-semibold text-green-600">{invoices.filter(i => i.status === 'paid').length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pending</p>
                      <p className="font-semibold text-amber-600">{invoices.filter(i => i.status === 'sent').length}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span>Collection Rate</span>
                      <span>{invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100 : 0} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Logistics Overview */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Logistics</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/logistics')}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Shipments</p>
                      <p className="font-semibold">{shipments.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Carriers</p>
                      <p className="font-semibold">{carriers.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">In Transit</p>
                      <p className="font-semibold text-blue-600">{activeShipments}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Delivered</p>
                      <p className="font-semibold text-green-600">{shipments.filter(s => s.status === 'delivered').length}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span>On-Time Delivery</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Support Overview */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                        <HeadphonesIcon className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">Support</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/crm/support-tickets')}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Tickets</p>
                      <p className="font-semibold">{supportTickets.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Open</p>
                      <p className="font-semibold text-amber-600">{openTickets}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">In Progress</p>
                      <p className="font-semibold text-blue-600">{supportTickets.filter(t => t.status === 'in_progress').length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Resolved</p>
                      <p className="font-semibold text-green-600">{supportTickets.filter(t => t.status === 'resolved').length}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span>Resolution Rate</span>
                      <span>{supportTickets.length > 0 ? Math.round((supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={supportTickets.length > 0 ? (supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100 : 0} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* HR Overview */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
                        <Building2 className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">HR</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate('/hr')}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Employees</p>
                      <p className="font-semibold">{hrStats?.totalEmployees || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">New Hires</p>
                      <p className="font-semibold text-green-600">{hrStats?.newHires || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Present Today</p>
                      <p className="font-semibold text-blue-600">{hrStats?.attendance?.present || 0}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Open Jobs</p>
                      <p className="font-semibold text-amber-600">{hrStats?.openJobs || 0}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-xs">
                      <span>Attendance Rate</span>
                      <span>{hrStats?.totalEmployees ? Math.round(((hrStats?.attendance?.present || 0) / hrStats.totalEmployees) * 100) : 0}%</span>
                    </div>
                    <Progress value={hrStats?.totalEmployees ? ((hrStats?.attendance?.present || 0) / hrStats.totalEmployees) * 100 : 0} className="h-1 mt-1" />
                  </div>
                </CardContent>
              </Card>

              {/* AI Center Quick Access */}
              <Card className="hover:shadow-lg transition-shadow bg-gradient-to-br from-violet-500/5 to-purple-600/5 border-violet-500/20">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                      <CardTitle className="text-base">AI Center</CardTitle>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => { setActiveTab('ai'); navigate('/?tab=ai'); }}>
                      <ArrowUpRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-muted-foreground">Insights</p>
                      <p className="font-semibold">{generateInsights.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Recommendations</p>
                      <p className="font-semibold">{generateRecommendations.length}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 mt-2"
                    size="sm"
                    onClick={() => { setActiveTab('ai'); navigate('/?tab=ai'); }}
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Open AI Center
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* AI Insights Preview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-violet-500" />
                      AI Insights
                    </CardTitle>
                    <CardDescription>Real-time analysis across all business data</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setActiveTab('ai'); navigate('/?tab=ai'); }}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  {generateInsights.slice(0, 4).map((insight, i) => (
                    <div 
                      key={i}
                      className={`p-3 rounded-lg border ${
                        insight.type === 'positive' ? 'bg-green-500/10 border-green-500/20' :
                        insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                        insight.type === 'critical' ? 'bg-red-500/10 border-red-500/20' :
                        'bg-blue-500/10 border-blue-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {insight.type === 'positive' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600" />}
                        {insight.type === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                        {insight.type === 'info' && <Lightbulb className="h-4 w-4 text-blue-600" />}
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{insight.message}</p>
                      {insight.metric && (
                        <Badge variant="secondary" className="mt-2 text-xs">{insight.metric}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Brain className="h-6 w-6 text-violet-500" />
                  AI Center
                </h2>
                <p className="text-muted-foreground">Intelligent analysis powered by CortaneX AI</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Connected to all portals
              </Badge>
            </div>

            <Tabs value={aiSubTab} onValueChange={setAiSubTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="decisions" className="gap-2">
                  <Scale className="h-4 w-4" />
                  Decisions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-violet-500" />
                          CortaneX AI Assistant
                        </CardTitle>
                        <CardDescription>Ask anything about your business data across all portals</CardDescription>
                      </div>
                      {messages.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearMessages}>Clear Chat</Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-4">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p className="font-medium">Ask me anything about your business!</p>
                            <p className="text-sm mt-1">I have access to all your CRM, Management, Accounting, and Logistics data.</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                              {[
                                "Analyze my revenue trends",
                                "Show task completion rates",
                                "Summarize support tickets",
                                "Compare carrier performance",
                                "What's my pipeline value?",
                                "Identify bottlenecks"
                              ].map(suggestion => (
                                <Button
                                  key={suggestion}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {msg.role === 'assistant' ? (
                                <MarkdownRenderer content={msg.content} />
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {aiLoading && (
                          <div className="flex justify-start">
                            <div className="bg-muted rounded-lg p-3">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Textarea
                        placeholder="Ask about your business data..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAISend();
                          }
                        }}
                        className="min-h-[60px] resize-none"
                      />
                      <Button 
                        onClick={handleAISend} 
                        disabled={aiLoading || !aiInput.trim()}
                        className="bg-gradient-to-r from-violet-500 to-purple-600"
                      >
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="mt-4 space-y-4">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {generateInsights.map((insight, i) => (
                    <Card key={i} className={`${
                      insight.type === 'positive' ? 'border-green-500/30' :
                      insight.type === 'warning' ? 'border-amber-500/30' :
                      insight.type === 'critical' ? 'border-red-500/30' :
                      'border-blue-500/30'
                    }`}>
                      <CardContent className="p-4">
                        <div className={`p-3 rounded-lg mb-3 ${
                          insight.type === 'positive' ? 'bg-green-500/10' :
                          insight.type === 'warning' ? 'bg-amber-500/10' :
                          insight.type === 'critical' ? 'bg-red-500/10' :
                          'bg-blue-500/10'
                        }`}>
                          <div className="flex items-center gap-2">
                            {insight.type === 'positive' && <CheckCircle className="h-5 w-5 text-green-600" />}
                            {insight.type === 'warning' && <AlertTriangle className="h-5 w-5 text-amber-600" />}
                            {insight.type === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                            {insight.type === 'info' && <Lightbulb className="h-5 w-5 text-blue-600" />}
                            <span className="font-semibold">{insight.title}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.message}</p>
                        {insight.metric && (
                          <div className="mt-3 pt-3 border-t">
                            <Badge className={`${
                              insight.type === 'positive' ? 'bg-green-500' :
                              insight.type === 'warning' ? 'bg-amber-500' :
                              insight.type === 'critical' ? 'bg-red-500' :
                              'bg-blue-500'
                            }`}>{insight.metric}</Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Data Summary Cards */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-500" />
                        Business Health Score
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Task Completion</span>
                            <span className="text-sm font-medium">{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</span>
                          </div>
                          <Progress value={tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Support Resolution</span>
                            <span className="text-sm font-medium">{supportTickets.length > 0 ? Math.round((supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100) : 0}%</span>
                          </div>
                          <Progress value={supportTickets.length > 0 ? (supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100 : 0} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Quote Conversion</span>
                            <span className="text-sm font-medium">{quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0}%</span>
                          </div>
                          <Progress value={quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0} />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">Invoice Collection</span>
                            <span className="text-sm font-medium">{invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100) : 0}%</span>
                          </div>
                          <Progress value={invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100 : 0} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Key Metrics Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span>Total Revenue</span>
                          <span className="font-bold text-green-600">${totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span>Gross Margin</span>
                          <span className="font-bold">${totalMargin.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span>Pipeline Value</span>
                          <span className="font-bold text-blue-600">${opportunityValue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                          <span>Active Shipments</span>
                          <span className="font-bold">{activeShipments}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="mt-4">
                <div className="space-y-4">
                  {generateRecommendations.length > 0 ? (
                    generateRecommendations.map((rec, i) => (
                      <Card key={i} className={`border-l-4 ${
                        rec.priority === 'high' ? 'border-l-red-500' :
                        rec.priority === 'medium' ? 'border-l-amber-500' :
                        'border-l-blue-500'
                      }`}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={rec.priority === 'high' ? 'destructive' : rec.priority === 'medium' ? 'default' : 'secondary'}>
                                  {rec.priority} priority
                                </Badge>
                                <h3 className="font-semibold">{rec.title}</h3>
                              </div>
                              <p className="text-sm text-muted-foreground">{rec.description}</p>
                              <div className="flex items-center gap-2 pt-2">
                                <Lightbulb className="h-4 w-4 text-amber-500" />
                                <span className="text-sm font-medium">{rec.action}</span>
                              </div>
                            </div>
                            <Button size="sm" variant="outline">
                              Take Action
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                        <h3 className="font-semibold text-lg">All Clear!</h3>
                        <p className="text-muted-foreground">No critical recommendations at this time. Your operations are running smoothly.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="decisions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-violet-500" />
                      Decision Support System
                    </CardTitle>
                    <CardDescription>AI-powered analysis to help you make better business decisions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Quick Decision Analysis</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Describe a business decision you need to make and get AI-powered analysis.
                        </p>
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setAiSubTab('chat');
                            setAiInput("I need help deciding: ");
                          }}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start Analysis
                        </Button>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Data-Driven Decisions</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-green-500" />
                            <span>Access to {clients.length + employees.length + shipments.length}+ data points</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4 text-blue-500" />
                            <span>Real-time analysis across all portals</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-violet-500" />
                            <span>AI-powered recommendations</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-indigo-500" />
                  Enterprise Analytics
                </h2>
                <p className="text-muted-foreground">Comprehensive analytics across all portals</p>
              </div>
              <Badge variant="outline" className="gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Live Data
              </Badge>
            </div>

            {/* Key Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs font-medium">Total Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">All sources</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium">Gross Margin</span>
                  </div>
                  <p className="text-2xl font-bold">${totalMargin.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">Logistics margin</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <Target className="h-4 w-4" />
                    <span className="text-xs font-medium">Pipeline</span>
                  </div>
                  <p className="text-2xl font-bold">${(opportunityValue / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground mt-1">{opportunities.length} opportunities</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <FileText className="h-4 w-4" />
                    <span className="text-xs font-medium">Quotes</span>
                  </div>
                  <p className="text-2xl font-bold">${totalQuoteValue.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground mt-1">{quotes.length} total</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-teal-500/10 to-green-500/10 border-teal-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-teal-600 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-medium">Workforce</span>
                  </div>
                  <p className="text-2xl font-bold">{hrStats?.totalEmployees || employees.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{hrStats?.activeEmployees || 0} active</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-rose-600 mb-2">
                    <HeadphonesIcon className="h-4 w-4" />
                    <span className="text-xs font-medium">Support</span>
                  </div>
                  <p className="text-2xl font-bold">{supportTickets.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{openTickets} open</p>
                </CardContent>
              </Card>
            </div>

            {/* Portal Performance Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* CRM Analytics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Users className="h-3 w-3 text-white" />
                    </div>
                    CRM Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Quote Conversion</span>
                      <span className="font-medium">{quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Clients</p>
                      <p className="font-semibold">{clients.length}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Products</p>
                      <p className="font-semibold">{products.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Management Analytics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <UserCheck className="h-3 w-3 text-white" />
                    </div>
                    Management Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Task Completion</span>
                      <span className="font-medium">{tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Departments</p>
                      <p className="font-semibold">{departments.length}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">KPIs</p>
                      <p className="font-semibold">{kpis.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* HR Analytics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-teal-500 to-green-500 flex items-center justify-center">
                      <Building2 className="h-3 w-3 text-white" />
                    </div>
                    HR Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance Rate</span>
                      <span className="font-medium">{hrStats?.totalEmployees ? Math.round(((hrStats?.attendance?.present || 0) / hrStats.totalEmployees) * 100) : 0}%</span>
                    </div>
                    <Progress value={hrStats?.totalEmployees ? ((hrStats?.attendance?.present || 0) / hrStats.totalEmployees) * 100 : 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Pending Leaves</p>
                      <p className="font-semibold">{hrStats?.pendingLeaves || 0}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Open Jobs</p>
                      <p className="font-semibold">{hrStats?.openJobs || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Accounting Analytics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <Calculator className="h-3 w-3 text-white" />
                    </div>
                    Accounting Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Collection Rate</span>
                      <span className="font-medium">{invoices.length > 0 ? Math.round((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Total Invoices</p>
                      <p className="font-semibold">${invoices.reduce((s, i) => s + (i.total_amount || 0), 0).toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Paid</p>
                      <p className="font-semibold text-green-600">{invoices.filter(i => i.status === 'paid').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Logistics Analytics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Truck className="h-3 w-3 text-white" />
                    </div>
                    Logistics Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Delivery Rate</span>
                      <span className="font-medium">{shipments.length > 0 ? Math.round((shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={shipments.length > 0 ? (shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Carriers</p>
                      <p className="font-semibold">{carriers.length}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Active</p>
                      <p className="font-semibold text-blue-600">{activeShipments}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Analytics */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center">
                      <HeadphonesIcon className="h-3 w-3 text-white" />
                    </div>
                    Support Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Resolution Rate</span>
                      <span className="font-medium">{supportTickets.length > 0 ? Math.round((supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={supportTickets.length > 0 ? (supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Open</p>
                      <p className="font-semibold text-amber-600">{openTickets}</p>
                    </div>
                    <div className="p-2 bg-muted/50 rounded">
                      <p className="text-muted-foreground">Resolved</p>
                      <p className="font-semibold text-green-600">{supportTickets.filter(t => t.status === 'resolved').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Business Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-indigo-500" />
                  Business Health Overview
                </CardTitle>
                <CardDescription>Cross-portal performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Efficiency</span>
                      <span className="font-medium">
                        {Math.round(
                          (
                            (tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0) +
                            (supportTickets.length > 0 ? (supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100 : 0) +
                            (quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0) +
                            (invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100 : 0)
                          ) / 4
                        )}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.round(
                        (
                          (tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0) +
                          (supportTickets.length > 0 ? (supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100 : 0) +
                          (quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0) +
                          (invoices.length > 0 ? (invoices.filter(i => i.status === 'paid').length / invoices.length) * 100 : 0)
                        ) / 4
                      )} 
                      className="h-2" 
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Customer Satisfaction</span>
                      <span className="font-medium">{supportTickets.length > 0 ? Math.round((supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100) : 100}%</span>
                    </div>
                    <Progress value={supportTickets.length > 0 ? (supportTickets.filter(t => t.status === 'resolved').length / supportTickets.length) * 100 : 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sales Performance</span>
                      <span className="font-medium">{quotes.length > 0 ? Math.round((acceptedQuotes / quotes.length) * 100) : 0}%</span>
                    </div>
                    <Progress value={quotes.length > 0 ? (acceptedQuotes / quotes.length) * 100 : 0} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Operational Health</span>
                      <span className="font-medium">{shipments.length > 0 ? Math.round((shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100) : 100}%</span>
                    </div>
                    <Progress value={shipments.length > 0 ? (shipments.filter(s => s.status === 'delivered').length / shipments.length) * 100 : 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
