import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, TrendingUp, AlertTriangle, Lightbulb, Users, CheckSquare, Target } from 'lucide-react';
import { useTasks } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useKPIDefinitions, useKPIRecords } from '@/hooks/useKPIs';

export default function AIInsightsPage() {
  const { data: tasks = [] } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: kpis = [] } = useKPIDefinitions();
  const { data: kpiRecords = [] } = useKPIRecords();

  // Calculate insights
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  
  // KPI performance
  const kpisOnTrack = kpis.filter(kpi => {
    const latest = kpiRecords.find(r => r.kpi_id === kpi.id);
    if (!latest || !kpi.target_value) return false;
    return (latest.value / kpi.target_value) >= 0.75;
  }).length;

  const insights = [
    {
      icon: CheckSquare,
      title: 'Task Performance',
      value: `${taskCompletionRate}%`,
      description: `${completedTasks} of ${tasks.length} tasks completed`,
      trend: taskCompletionRate >= 70 ? 'positive' : 'warning',
    },
    {
      icon: AlertTriangle,
      title: 'Overdue Tasks',
      value: overdueTasks.toString(),
      description: overdueTasks > 0 ? 'Tasks need immediate attention' : 'All tasks on schedule',
      trend: overdueTasks === 0 ? 'positive' : 'negative',
    },
    {
      icon: Users,
      title: 'Active Workforce',
      value: activeEmployees.toString(),
      description: `Across ${departments.length} departments`,
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

  const recommendations = [
    {
      priority: 'high',
      title: 'Review Overdue Tasks',
      description: overdueTasks > 0 
        ? `You have ${overdueTasks} overdue tasks. Consider reassigning or adjusting deadlines.`
        : 'All tasks are on schedule. Great job managing deadlines!',
    },
    {
      priority: 'medium',
      title: 'Department Balance',
      description: departments.length > 0 
        ? `Monitor workload distribution across your ${departments.length} departments.`
        : 'Consider creating departments to organize your team structure.',
    },
    {
      priority: 'low',
      title: 'KPI Optimization',
      description: kpis.length > 0
        ? 'Regular KPI reviews help identify improvement opportunities early.'
        : 'Define KPIs to track and improve organizational performance.',
    },
  ];

  const trendColors = {
    positive: 'text-green-500 bg-green-500/10',
    negative: 'text-red-500 bg-red-500/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    neutral: 'text-blue-500 bg-blue-500/10',
  };

  const priorityColors = {
    high: 'border-l-red-500',
    medium: 'border-l-yellow-500',
    low: 'border-l-blue-500',
  };

  return (
    <CRMLayout title="AI Insights">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold">AI Insights</h2>
          <p className="text-muted-foreground">Automated analysis and recommendations for your organization</p>
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

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recommendations */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendations.map((rec, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-lg border-l-4 bg-muted/30 ${priorityColors[rec.priority]}`}
                >
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Executive Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm text-muted-foreground">
                <p>
                  Your organization currently has <strong>{employees.length} employees</strong> across{' '}
                  <strong>{departments.length} departments</strong>.
                </p>
                <p className="mt-3">
                  Task completion rate is at <strong>{taskCompletionRate}%</strong>, with{' '}
                  <strong>{tasks.filter(t => t.status === 'in_progress').length} tasks in progress</strong> and{' '}
                  <strong>{overdueTasks} overdue</strong>.
                </p>
                <p className="mt-3">
                  {kpis.length > 0 ? (
                    <>
                      <strong>{kpisOnTrack} of {kpis.length} KPIs</strong> are currently on track to meet targets.
                    </>
                  ) : (
                    <>No KPIs have been defined yet. Consider adding KPIs to track organizational performance.</>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
