import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useTasks } from '@/hooks/useTasks';
import { useKPIDefinitions } from '@/hooks/useKPIs';
import { Lightbulb, TrendingUp, Users, AlertTriangle, Target, Building } from 'lucide-react';

export default function ManagementAIInsightsPage() {
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: tasks } = useTasks();
  const { data: kpiDefinitions } = useKPIDefinitions();

  const activeEmployees = employees?.filter(e => e.status === 'active').length || 0;
  const totalEmployees = employees?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = tasks?.length || 0;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const insights = [
    {
      title: 'Employee Engagement',
      description: `${activeEmployees} out of ${totalEmployees} employees are currently active`,
      type: activeEmployees / totalEmployees > 0.8 ? 'positive' : 'warning',
      icon: Users,
      metric: `${Math.round((activeEmployees / totalEmployees) * 100) || 0}%`
    },
    {
      title: 'Task Completion Rate',
      description: `${completedTasks} of ${totalTasks} tasks completed`,
      type: taskCompletionRate > 70 ? 'positive' : taskCompletionRate > 40 ? 'neutral' : 'warning',
      icon: Target,
      metric: `${taskCompletionRate}%`
    },
    {
      title: 'Department Coverage',
      description: `${departments?.length || 0} departments configured`,
      type: (departments?.length || 0) > 0 ? 'positive' : 'warning',
      icon: Building,
      metric: departments?.length?.toString() || '0'
    },
    {
      title: 'KPI Tracking',
      description: `${kpiDefinitions?.length || 0} KPIs being monitored`,
      type: (kpiDefinitions?.length || 0) > 0 ? 'positive' : 'neutral',
      icon: TrendingUp,
      metric: kpiDefinitions?.length?.toString() || '0'
    }
  ];

  const recommendations = [
    {
      title: 'Optimize Task Distribution',
      description: 'Consider redistributing tasks among departments for better workload balance',
      priority: 'medium'
    },
    {
      title: 'Review KPI Targets',
      description: 'Some KPI targets may need adjustment based on recent performance data',
      priority: 'low'
    },
    {
      title: 'Employee Training',
      description: 'Identify skill gaps and plan targeted training programs',
      priority: 'high'
    }
  ];

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Insights</h1>
          <p className="text-muted-foreground">AI-powered organizational insights and recommendations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insights.map((insight, idx) => (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <insight.icon className={`h-5 w-5 ${
                    insight.type === 'positive' ? 'text-green-500' :
                    insight.type === 'warning' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <span className="text-2xl font-bold">{insight.metric}</span>
                </div>
                <CardTitle className="text-sm">{insight.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-amber-500" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Actionable suggestions based on your organizational data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    rec.priority === 'high' ? 'text-red-500' :
                    rec.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{rec.title}</h4>
                      <Badge variant={
                        rec.priority === 'high' ? 'destructive' :
                        rec.priority === 'medium' ? 'default' : 'secondary'
                      }>
                        {rec.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
