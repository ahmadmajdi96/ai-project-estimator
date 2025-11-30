import { useState, useEffect } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, TrendingUp, AlertTriangle, Lightbulb, Users, CheckSquare, Target, 
  RefreshCw, Loader2, DollarSign, BarChart3, PieChart
} from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useKPIDefinitions, useKPIRecords } from '@/hooks/useKPIs';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useSalesmen } from '@/hooks/useSalesmen';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { toast } from 'sonner';

export default function AIInsightsPage() {
  const { data: tasks = [] } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: kpis = [] } = useKPIDefinitions();
  const { data: kpiRecords = [] } = useKPIRecords();
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: salesmen = [] } = useSalesmen();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate metrics
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalRevenue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0);
  const activeClients = clients.filter(c => c.status === 'active').length;
  const activeSalesmen = salesmen.filter(s => s.status === 'active').length;

  const kpisOnTrack = kpis.filter(kpi => {
    const latest = kpiRecords.find(r => r.kpi_id === kpi.id);
    if (!latest || !kpi.target_value) return false;
    return (latest.value / kpi.target_value) >= 0.75;
  }).length;

  const runAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis('');

    try {
      const analysisPrompt = `You are analyzing CRM data for an AI and software engineering company. Provide a comprehensive executive analysis.

## Current Data Summary:

### Team & Organization
- Total Employees: ${employees.length} (${activeEmployees} active)
- Departments: ${departments.length}
- Active Salesmen: ${activeSalesmen}

### Tasks & Performance
- Total Tasks: ${tasks.length}
- Completed: ${completedTasks} (${taskCompletionRate}% completion rate)
- Overdue: ${overdueTasks}
- In Progress: ${tasks.filter(t => t.status === 'in_progress').length}

### Sales & Revenue
- Total Quotes: ${quotes.length}
- Accepted Quotes: ${quotes.filter(q => q.status === 'accepted').length}
- Draft Quotes: ${quotes.filter(q => q.status === 'draft').length}
- Total Accepted Revenue: $${totalRevenue.toLocaleString()}
- Average Deal Size: $${quotes.length > 0 ? Math.round(totalRevenue / Math.max(quotes.filter(q => q.status === 'accepted').length, 1)).toLocaleString() : 0}

### Clients
- Total Clients: ${clients.length}
- Active Clients: ${activeClients}
- Prospects: ${clients.filter(c => c.status === 'prospect').length}
- By Sales Stage:
  - Pre-Sales: ${clients.filter(c => c.sales_stage === 'pre_sales').length}
  - Negotiation: ${clients.filter(c => c.sales_stage === 'negotiation').length}
  - Closed Won: ${clients.filter(c => (c.sales_stage as string) === 'closed_won').length}
  - Closed Lost: ${clients.filter(c => (c.sales_stage as string) === 'closed_lost').length}

### KPIs
- Defined KPIs: ${kpis.length}
- KPIs On Track: ${kpisOnTrack}

Please provide:
1. **Executive Summary** - High-level overview of organizational health
2. **Key Insights** - 4-5 bullet points of critical observations
3. **Performance Analysis** - Detailed breakdown by area (sales, team, operations)
4. **Risk Factors** - Potential concerns that need attention
5. **Opportunities** - Growth opportunities identified from the data
6. **Recommendations** - Prioritized action items (High/Medium/Low priority)

Use markdown formatting with headers, bullet points, and emphasis where appropriate.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: analysisPrompt }],
          context: {
            tasks: tasks.slice(0, 20),
            clients: clients.slice(0, 20),
            departments,
            kpis,
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
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate AI analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-run analysis on first load
  useEffect(() => {
    if (tasks.length > 0 || clients.length > 0) {
      runAIAnalysis();
    }
  }, []);

  const insights = [
    {
      icon: CheckSquare,
      title: 'Task Performance',
      value: `${taskCompletionRate}%`,
      description: `${completedTasks} of ${tasks.length} tasks completed`,
      trend: taskCompletionRate >= 70 ? 'positive' : 'warning',
    },
    {
      icon: DollarSign,
      title: 'Revenue',
      value: `$${(totalRevenue / 1000).toFixed(0)}k`,
      description: `From ${quotes.filter(q => q.status === 'accepted').length} accepted quotes`,
      trend: 'positive',
    },
    {
      icon: Users,
      title: 'Active Clients',
      value: activeClients.toString(),
      description: `${clients.filter(c => c.status === 'prospect').length} prospects in pipeline`,
      trend: 'neutral',
    },
    {
      icon: Target,
      title: 'KPIs On Track',
      value: `${kpisOnTrack}/${kpis.length}`,
      description: kpisOnTrack === kpis.length ? 'All KPIs meeting targets' : 'Some KPIs need attention',
      trend: kpisOnTrack === kpis.length ? 'positive' : 'warning',
    },
  ];

  const trendColors: Record<string, string> = {
    positive: 'text-green-500 bg-green-500/10',
    negative: 'text-red-500 bg-red-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    neutral: 'text-blue-500 bg-blue-500/10',
  };

  return (
    <CRMLayout title="AI Insights">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">AI Insights</h2>
            <p className="text-muted-foreground">AI-powered analysis of your organization's performance</p>
          </div>
          <Button onClick={runAIAnalysis} disabled={isAnalyzing} className="gap-2">
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
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${trendColors[insight.trend]}`}>
                    <insight.icon className="h-5 w-5" />
                  </div>
                  <span className="text-2xl font-bold">{insight.value}</span>
                </div>
                <h3 className="font-medium mt-3">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">AI Analysis</TabsTrigger>
            <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  AI Executive Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing && !aiAnalysis ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
                      <p className="text-muted-foreground">Generating comprehensive analysis...</p>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <MarkdownRenderer content={aiAnalysis} />
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Click "Refresh Analysis" to generate AI insights</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metrics" className="mt-4">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Sales Metrics */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Sales Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Quotes</span>
                    <span className="font-semibold">{quotes.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Accepted</span>
                    <span className="font-semibold text-green-500">{quotes.filter(q => q.status === 'accepted').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Pending</span>
                    <span className="font-semibold text-yellow-500">{quotes.filter(q => q.status === 'sent').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Conversion Rate</span>
                    <span className="font-semibold">
                      {quotes.length > 0 ? Math.round((quotes.filter(q => q.status === 'accepted').length / quotes.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Total Revenue</span>
                    <span className="font-bold text-lg">${totalRevenue.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Team Metrics */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-500" />
                    Team Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Employees</span>
                    <span className="font-semibold">{employees.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-semibold text-green-500">{activeEmployees}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Departments</span>
                    <span className="font-semibold">{departments.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Salesmen</span>
                    <span className="font-semibold">{salesmen.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Active Salesmen</span>
                    <span className="font-semibold text-green-500">{activeSalesmen}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Task Metrics */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare className="h-5 w-5 text-purple-500" />
                    Task Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Tasks</span>
                    <span className="font-semibold">{tasks.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Completed</span>
                    <span className="font-semibold text-green-500">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-semibold text-blue-500">{tasks.filter(t => t.status === 'in_progress').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Overdue</span>
                    <span className="font-semibold text-red-500">{overdueTasks}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Completion Rate</span>
                    <span className="font-bold text-lg">{taskCompletionRate}%</span>
                  </div>
                </CardContent>
              </Card>

              {/* Client Metrics */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-500" />
                    Client Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Total Clients</span>
                    <span className="font-semibold">{clients.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Active</span>
                    <span className="font-semibold text-green-500">{activeClients}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Prospects</span>
                    <span className="font-semibold text-yellow-500">{clients.filter(c => c.status === 'prospect').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Won Deals</span>
                    <span className="font-semibold text-green-500">{clients.filter(c => (c.sales_stage as string) === 'closed_won').length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Lost Deals</span>
                    <span className="font-semibold text-red-500">{clients.filter(c => (c.sales_stage as string) === 'closed_lost').length}</span>
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
