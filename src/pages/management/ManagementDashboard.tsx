import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, Target, CheckCircle2, ListTodo, TrendingUp, Activity } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useStrategicGoals } from '@/hooks/useStrategicGoals';
import { useObjectives } from '@/hooks/useObjectives';
import { useTasks } from '@/hooks/useTasks';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { NotificationsBell } from '@/components/management/NotificationsBell';
import { format } from 'date-fns';

export default function ManagementDashboard() {
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: strategicGoals } = useStrategicGoals();
  const { data: objectives } = useObjectives();
  const { data: tasks } = useTasks();
  const { data: roadmaps } = useRoadmaps();
  const { data: activityLogs } = useActivityLogs();

  const activeEmployees = employees?.filter(e => e.status === 'active').length || 0;
  const totalDepartments = departments?.length || 0;
  const activeGoals = strategicGoals?.filter(g => g.status === 'in_progress').length || 0;
  const activeObjectives = objectives?.filter(o => o.status === 'in_progress').length || 0;
  const activeTasks = tasks?.filter(t => t.status !== 'done').length || 0;
  const activeRoadmaps = roadmaps?.length || 0;
  const recentActivity = activityLogs?.slice(0, 5) || [];

  const stats = [
    {
      title: 'Total Employees',
      value: employees?.length || 0,
      subtitle: `${activeEmployees} active`,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Departments',
      value: totalDepartments,
      subtitle: 'Organization units',
      icon: Building,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'Strategic Goals',
      value: strategicGoals?.length || 0,
      subtitle: `${activeGoals} in progress`,
      icon: Target,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Active OKRs',
      value: activeObjectives,
      subtitle: 'Current objectives',
      icon: CheckCircle2,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Active Tasks',
      value: activeTasks,
      subtitle: 'Tasks in progress',
      icon: ListTodo,
      gradient: 'from-rose-500 to-pink-500',
    },
    {
      title: 'Roadmaps',
      value: activeRoadmaps,
      subtitle: 'Strategic plans',
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-purple-500',
    },
  ];

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Management Portal</h1>
            <p className="text-muted-foreground">Employee and organization management</p>
          </div>
          <NotificationsBell />
        </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  <CardTitle>Recent Activity</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-border/50 last:border-0">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.activity_type}</p>
                          <p className="text-xs text-muted-foreground">{activity.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(activity.created_at || ''), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No recent activity to display.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </ManagementLayout>
      );
    }
