import { useState, useEffect } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, TrendingUp, Users, CheckSquare, Target, 
  RefreshCw, Loader2, DollarSign, BarChart3, Clock, Sparkles,
  ArrowUpRight, ArrowDownRight, Briefcase
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useKPIDefinitions, useKPIRecords } from '@/hooks/useKPIs';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useSalesmen } from '@/hooks/useSalesmen';
import { useSalesPerformance } from '@/hooks/useSalesPerformance';
import { InsightMetricCard } from '@/components/insights/InsightMetricCard';
import { AIAnalysisCard } from '@/components/insights/AIAnalysisCard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const REFRESH_COOLDOWN_KEY = 'ai_insights_last_refresh';
const COOLDOWN_HOURS = 24;

export default function AIInsightsPage() {
  const { data: tasks = [] } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: kpis = [] } = useKPIDefinitions();
  const { data: kpiRecords = [] } = useKPIRecords();
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: salesmen = [] } = useSalesmen();
  const { data: salesPerformance = [] } = useSalesPerformance();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const [lastRefresh, setLastRefresh] = useState<string | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);
  const [timeUntilRefresh, setTimeUntilRefresh] = useState<string>('');

  // Check cooldown on mount
  useEffect(() => {
    const stored = localStorage.getItem(REFRESH_COOLDOWN_KEY);
    if (stored) {
      const lastRefreshTime = new Date(stored).getTime();
      const now = Date.now();
      const hoursPassed = (now - lastRefreshTime) / (1000 * 60 * 60);
      
      if (hoursPassed < COOLDOWN_HOURS) {
        setCanRefresh(false);
        setLastRefresh(stored);
        
        // Load cached analysis
        const cachedAnalysis = localStorage.getItem('ai_insights_cached_analysis');
        if (cachedAnalysis) {
          setAiAnalysis(cachedAnalysis);
        }
      } else {
        setCanRefresh(true);
      }
    }
  }, []);

  // Update countdown timer
  useEffect(() => {
    if (!canRefresh && lastRefresh) {
      const interval = setInterval(() => {
        const lastRefreshTime = new Date(lastRefresh).getTime();
        const now = Date.now();
        const msRemaining = (lastRefreshTime + COOLDOWN_HOURS * 60 * 60 * 1000) - now;
        
        if (msRemaining <= 0) {
          setCanRefresh(true);
          setTimeUntilRefresh('');
          clearInterval(interval);
        } else {
          const hours = Math.floor(msRemaining / (1000 * 60 * 60));
          const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
          setTimeUntilRefresh(`${hours}h ${minutes}m`);
        }
      }, 60000);
      
      // Initial calculation
      const lastRefreshTime = new Date(lastRefresh).getTime();
      const now = Date.now();
      const msRemaining = (lastRefreshTime + COOLDOWN_HOURS * 60 * 60 * 1000) - now;
      if (msRemaining > 0) {
        const hours = Math.floor(msRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((msRemaining % (1000 * 60 * 60)) / (1000 * 60));
        setTimeUntilRefresh(`${hours}h ${minutes}m`);
      }
      
      return () => clearInterval(interval);
    }
  }, [canRefresh, lastRefresh]);

  // Calculate metrics
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalRevenue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeSalesmen = salesmen.filter(s => s.status === 'active').length;

  // Sales performance metrics
  const totalDeals = salesPerformance.reduce((sum, p) => sum + (p.deals_closed || 0), 0);
  const totalSalesRevenue = salesPerformance.reduce((sum, p) => sum + (p.revenue_generated || 0), 0);
  const avgConversionRate = salesPerformance.length > 0 
    ? Math.round(salesPerformance.reduce((sum, p) => sum + (p.conversion_rate || 0), 0) / salesPerformance.length)
    : 0;

  const kpisOnTrack = kpis.filter(kpi => {
    const latest = kpiRecords.find(r => r.kpi_id === kpi.id);
    if (!latest || !kpi.target_value) return false;
    return (latest.value / kpi.target_value) >= 0.75;
  }).length;

  const runAIAnalysis = async () => {
    if (!canRefresh) {
      toast.error(`Please wait ${timeUntilRefresh} before refreshing`);
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      const analysisPrompt = `You are analyzing comprehensive CRM data for an AI and software engineering company. Provide a detailed executive analysis.

## Current Data Summary:

### Team & Organization
- Total Employees: ${employees.length} (${activeEmployees} active)
- Departments: ${departments.length}
- Department breakdown: ${departments.map(d => d.name).join(', ')}
- Active Salesmen: ${activeSalesmen}

### Tasks & Performance
- Total Tasks: ${tasks.length}
- Completed: ${completedTasks} (${taskCompletionRate}% completion rate)
- Overdue: ${overdueTasks}
- In Progress: ${tasks.filter(t => t.status === 'in_progress').length}
- Blocked: ${tasks.filter(t => t.status === 'blocked').length}

### Sales & Revenue
- Total Quotes: ${quotes.length}
- Accepted Quotes: ${quotes.filter(q => q.status === 'accepted').length}
- Draft Quotes: ${quotes.filter(q => q.status === 'draft').length}
- Sent (Pending): ${quotes.filter(q => q.status === 'sent').length}
- Rejected: ${quotes.filter(q => q.status === 'rejected').length}
- Total Accepted Revenue: $${totalRevenue.toLocaleString()}
- Average Deal Size: $${quotes.filter(q => q.status === 'accepted').length > 0 ? Math.round(totalRevenue / quotes.filter(q => q.status === 'accepted').length).toLocaleString() : 0}

### Sales Team Performance (Last 3 Months)
- Total Deals Closed: ${totalDeals}
- Total Revenue Generated: $${totalSalesRevenue.toLocaleString()}
- Average Conversion Rate: ${avgConversionRate}%
- Total Leads Contacted: ${salesPerformance.reduce((sum, p) => sum + (p.leads_contacted || 0), 0)}
- Total Meetings Held: ${salesPerformance.reduce((sum, p) => sum + (p.meetings_held || 0), 0)}
- Total Proposals Sent: ${salesPerformance.reduce((sum, p) => sum + (p.proposals_sent || 0), 0)}

### Clients
- Total Clients: ${clients.length}
- Active Clients: ${activeClients}
- Prospects: ${clients.filter(c => c.status === 'prospect').length}
- Inactive: ${clients.filter(c => c.status === 'inactive').length}
- By Sales Stage:
  - Pre-Sales: ${clients.filter(c => c.sales_stage === 'pre_sales').length}
  - Negotiation: ${clients.filter(c => c.sales_stage === 'negotiation').length}
  - Closing: ${clients.filter(c => c.sales_stage === 'closing').length}
  - Post-Sales: ${clients.filter(c => c.sales_stage === 'post_sales').length}
  - Support: ${clients.filter(c => c.sales_stage === 'support').length}

### KPIs
- Defined KPIs: ${kpis.length}
- KPIs On Track (≥75% target): ${kpisOnTrack}
- KPIs Needing Attention: ${kpis.length - kpisOnTrack}

Please provide a comprehensive analysis with:

## Executive Summary
A 2-3 paragraph overview of organizational health, highlighting the most critical findings.

## Key Performance Indicators
- 5-6 bullet points of the most important metrics and what they indicate

## Sales Analysis
- Revenue trends and performance
- Deal pipeline health
- Sales team effectiveness
- Quote conversion analysis

## Operational Efficiency
- Task management effectiveness
- Team productivity indicators
- Resource utilization

## Risk Assessment
- **High Risk**: Critical issues requiring immediate attention
- **Medium Risk**: Concerns that should be addressed soon
- **Low Risk**: Minor issues to monitor

## Strategic Opportunities
- Growth opportunities identified from the data
- Areas for optimization
- Competitive advantages

## Prioritized Recommendations
### High Priority (This Week)
- Action items needing immediate attention

### Medium Priority (This Month)
- Important improvements to implement

### Low Priority (This Quarter)
- Long-term enhancements to consider

Use clear markdown formatting with headers, bullet points, bold text for emphasis, and organize information for easy scanning.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: analysisPrompt }],
          context: {
            tasks: tasks.slice(0, 30),
            clients: clients.slice(0, 30),
            departments,
            kpis,
            salesPerformance: salesPerformance.slice(0, 20),
            salesmen: salesmen.map(s => ({ id: s.id, name: s.name, status: s.status })),
          },
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.');
          return;
        }
        throw new Error('AI analysis failed');
      }

      const reader = response.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let analysisText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content || '';
                analysisText += content;
                setAiAnalysis(analysisText);
              } catch {}
            }
          }
        }

        // Cache the analysis and update refresh time
        const now = new Date().toISOString();
        localStorage.setItem(REFRESH_COOLDOWN_KEY, now);
        localStorage.setItem('ai_insights_cached_analysis', analysisText);
        setLastRefresh(now);
        setCanRefresh(false);
        toast.success('Analysis complete! Next refresh available in 24 hours.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis on first load if no cached analysis
  useEffect(() => {
    const cachedAnalysis = localStorage.getItem('ai_insights_cached_analysis');
    if (!cachedAnalysis && canRefresh && (tasks.length > 0 || clients.length > 0)) {
      runAIAnalysis();
    }
  }, [tasks.length, clients.length]);

  const insights = [
    {
      icon: DollarSign,
      title: 'Total Revenue',
      value: `$${(totalRevenue / 1000).toFixed(0)}k`,
      description: `From ${quotes.filter(q => q.status === 'accepted').length} accepted quotes`,
      trend: 'positive' as const,
    },
    {
      icon: Briefcase,
      title: 'Deals Closed',
      value: totalDeals.toString(),
      description: `$${(totalSalesRevenue / 1000).toFixed(0)}k generated by sales team`,
      trend: totalDeals > 0 ? 'positive' as const : 'warning' as const,
    },
    {
      icon: CheckSquare,
      title: 'Task Completion',
      value: `${taskCompletionRate}%`,
      description: `${completedTasks} of ${tasks.length} tasks completed`,
      trend: taskCompletionRate >= 70 ? 'positive' as const : 'warning' as const,
    },
    {
      icon: Users,
      title: 'Active Pipeline',
      value: `${activeClients}`,
      description: `${clients.filter(c => c.status === 'prospect').length} prospects in funnel`,
      trend: 'neutral' as const,
    },
  ];

  return (
    <CRMLayout title="AI Insights">
      <div className="space-y-6">
        {/* Header with gradient */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border border-border/50">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                  <Sparkles className="h-5 w-5 text-primary-foreground" />
                </div>
                <h2 className="font-display text-2xl font-bold">AI Insights</h2>
              </div>
              <p className="text-muted-foreground max-w-md">
                Comprehensive AI-powered analysis of your organization's performance, sales pipeline, and operational metrics.
              </p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Button 
                onClick={runAIAnalysis} 
                disabled={isAnalyzing || !canRefresh}
                className={cn(
                  "gap-2 shadow-lg",
                  canRefresh ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70" : ""
                )}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Refresh Analysis
                  </>
                )}
              </Button>
              
              {!canRefresh && timeUntilRefresh && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Next refresh in {timeUntilRefresh}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Metrics with staggered animation */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, i) => (
            <InsightMetricCard key={i} {...insight} index={i} />
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background data-[state=active]:shadow">
              <Bot className="h-4 w-4 mr-2" />
              AI Analysis
            </TabsTrigger>
            <TabsTrigger value="metrics" className="data-[state=active]:bg-background data-[state=active]:shadow">
              <BarChart3 className="h-4 w-4 mr-2" />
              Detailed Metrics
            </TabsTrigger>
            <TabsTrigger value="sales" className="data-[state=active]:bg-background data-[state=active]:shadow">
              <TrendingUp className="h-4 w-4 mr-2" />
              Sales Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 animate-fade-in">
            <AIAnalysisCard 
              isAnalyzing={isAnalyzing} 
              aiAnalysis={aiAnalysis} 
              lastRefresh={lastRefresh}
            />
          </TabsContent>

          <TabsContent value="metrics" className="mt-4 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sales Metrics */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    Sales Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="Total Quotes" value={quotes.length} />
                  <MetricRow label="Accepted" value={quotes.filter(q => q.status === 'accepted').length} color="text-emerald-500" />
                  <MetricRow label="Pending" value={quotes.filter(q => q.status === 'sent').length} color="text-amber-500" />
                  <MetricRow label="Conversion Rate" value={`${quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100) : 0}%`} />
                  <div className="pt-2 border-t">
                    <MetricRow label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} large />
                  </div>
                </CardContent>
              </Card>

              {/* Team Metrics */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    Team Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="Total Employees" value={employees.length} />
                  <MetricRow label="Active" value={activeEmployees} color="text-emerald-500" />
                  <MetricRow label="Departments" value={departments.length} />
                  <MetricRow label="Salesmen" value={salesmen.length} />
                  <MetricRow label="Active Salesmen" value={activeSalesmen} color="text-emerald-500" />
                </CardContent>
              </Card>

              {/* Task Metrics */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <CheckSquare className="h-4 w-4 text-purple-500" />
                    </div>
                    Task Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="Total Tasks" value={tasks.length} />
                  <MetricRow label="Completed" value={completedTasks} color="text-emerald-500" />
                  <MetricRow label="In Progress" value={tasks.filter(t => t.status === 'in_progress').length} color="text-blue-500" />
                  <MetricRow label="Overdue" value={overdueTasks} color="text-red-500" />
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Completion Rate</span>
                      <span className="font-bold">{taskCompletionRate}%</span>
                    </div>
                    <Progress value={taskCompletionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Client Metrics */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 text-orange-500" />
                    </div>
                    Client Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricRow label="Total Clients" value={clients.length} />
                  <MetricRow label="Active" value={activeClients} color="text-emerald-500" />
                  <MetricRow label="Prospects" value={clients.filter(c => c.status === 'prospect').length} color="text-amber-500" />
                  <MetricRow label="In Negotiation" value={clients.filter(c => c.sales_stage === 'negotiation').length} color="text-blue-500" />
                  <MetricRow label="In Closing" value={clients.filter(c => c.sales_stage === 'closing').length} color="text-purple-500" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="sales" className="mt-4 animate-fade-in">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Overall Sales Performance */}
              <Card className="lg:col-span-2 border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    Sales Team Performance (Last 3 Months)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <p className="text-3xl font-bold text-emerald-500">{totalDeals}</p>
                      <p className="text-sm text-muted-foreground">Deals Closed</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <p className="text-3xl font-bold">${(totalSalesRevenue / 1000).toFixed(0)}k</p>
                      <p className="text-sm text-muted-foreground">Revenue Generated</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-muted/30">
                      <p className="text-3xl font-bold text-blue-500">{avgConversionRate}%</p>
                      <p className="text-sm text-muted-foreground">Avg Conversion</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">Activity Metrics</h4>
                    <MetricRow label="Leads Contacted" value={salesPerformance.reduce((sum, p) => sum + (p.leads_contacted || 0), 0)} />
                    <MetricRow label="Meetings Held" value={salesPerformance.reduce((sum, p) => sum + (p.meetings_held || 0), 0)} />
                    <MetricRow label="Proposals Sent" value={salesPerformance.reduce((sum, p) => sum + (p.proposals_sent || 0), 0)} />
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers */}
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-amber-500" />
                    </div>
                    KPI Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5">
                      <span className="text-2xl font-bold">{kpisOnTrack}/{kpis.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">KPIs On Track</p>
                  </div>
                  
                  <Progress value={(kpisOnTrack / Math.max(kpis.length, 1)) * 100} className="h-2 mb-4" />
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Meeting Target</span>
                      <span className="text-emerald-500 font-medium">{kpisOnTrack}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Needs Attention</span>
                      <span className="text-amber-500 font-medium">{kpis.length - kpisOnTrack}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}

// Helper component for metric rows
function MetricRow({ label, value, color, large }: { label: string; value: string | number; color?: string; large?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn(
        large ? "font-bold text-lg" : "font-semibold",
        color || "text-foreground"
      )}>
        {value}
      </span>
    </div>
  );
}
