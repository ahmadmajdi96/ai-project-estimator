import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useStrategicGoals } from '@/hooks/useStrategicGoals';
import { useObjectives } from '@/hooks/useObjectives';
import { useTasks } from '@/hooks/useTasks';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useActivityLogs } from '@/hooks/useActivityLogs';
import { useKPIDefinitions } from '@/hooks/useKPIs';
import { NotificationsBell } from '@/components/management/NotificationsBell';
import { 
  Users, Building, Target, CheckCircle2, ListTodo, TrendingUp, Activity, 
  LayoutDashboard, BarChart3, Shield, ArrowUpRight, AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { useNavigate, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPie, Pie, Cell
} from 'recharts';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#8b5cf6'];

export default function ManagementDashboard() {
  const { data: employees = [] } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const { data: strategicGoals = [] } = useStrategicGoals();
  const { data: objectives = [] } = useObjectives();
  const { data: tasks = [] } = useTasks();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: activityLogs = [] } = useActivityLogs();
  const { data: kpis = [] } = useKPIDefinitions();
  const navigate = useNavigate();

  // Calculate metrics
  const activeEmployees = employees.filter(e => e.status === 'active').length;
  const totalDepartments = departments.length;
  const activeGoals = strategicGoals.filter(g => g.status === 'in_progress').length;
  const activeObjectives = objectives.filter(o => o.status === 'in_progress').length;
  const activeTasks = tasks.filter(t => t.status !== 'done').length;
  const activeRoadmaps = roadmaps.length;
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length;

  // Goals by status
  const goalsByStatus = [
    { name: 'Not Started', value: strategicGoals.filter(g => g.status === 'not_started').length },
    { name: 'In Progress', value: strategicGoals.filter(g => g.status === 'in_progress').length },
    { name: 'At Risk', value: strategicGoals.filter(g => g.status === 'at_risk').length },
    { name: 'Completed', value: strategicGoals.filter(g => g.status === 'completed').length },
  ];

  // Monthly data for chart
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthGoals = strategicGoals.filter(g => {
      const created = new Date(g.created_at);
      return isWithinInterval(created, { start: monthStart, end: monthEnd });
    });
    
    const monthTasks = tasks.filter(t => {
      const created = new Date(t.created_at);
      return isWithinInterval(created, { start: monthStart, end: monthEnd });
    });

    return {
      month: format(date, 'MMM'),
      goals: monthGoals.length,
      tasks: monthTasks.length,
      employees: 0,
    };
  });

  const recentActivity = activityLogs.slice(0, 5);

  return (
    <ManagementLayout title="Dashboard">
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
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{employees.length}</p>
                  <p className="text-xs text-muted-foreground">Employees</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Building className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalDepartments}</p>
                  <p className="text-xs text-muted-foreground">Departments</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Target className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeGoals}</p>
                  <p className="text-xs text-muted-foreground">Active Goals</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeObjectives}</p>
                  <p className="text-xs text-muted-foreground">OKRs</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <ListTodo className="h-5 w-5 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeTasks}</p>
                  <p className="text-xs text-muted-foreground">Active Tasks</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{overdueTasks}</p>
                  <p className="text-xs text-muted-foreground">Needs Attention</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Goals Distribution */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Strategic Goals</h3>
              <div className="space-y-3">
                {goalsByStatus.map((s, i) => (
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

            {/* Department Overview */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Departments</h3>
              <div className="space-y-3">
                {departments.slice(0, 5).map((dept) => {
                  const deptEmployees = employees.filter(e => e.department_id === dept.id).length;
                  return (
                    <div key={dept.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-primary" />
                        <span className="text-sm truncate">{dept.name}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{deptEmployees}</Badge>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-4 bg-card/50 border-border/50">
              <h3 className="font-semibold mb-4">Recent Activity</h3>
              {recentActivity.length > 0 ? (
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div>
                        <p className="text-sm font-medium line-clamp-1">{activity.activity_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(activity.created_at || ''), 'MMM dd, HH:mm')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              )}
            </Card>
          </div>

          {/* Recent Items */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Recent Goals</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/management/strategic-goals">View All</Link>
                </Button>
              </div>
              <div className="space-y-2">
                {strategicGoals.slice(0, 5).map((goal) => (
                  <div key={goal.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{goal.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(goal.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <Badge variant={
                      goal.status === 'completed' ? 'default' :
                      goal.status === 'in_progress' ? 'secondary' :
                      goal.status === 'at_risk' ? 'destructive' :
                      'outline'
                    }>
                      {goal.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
                {strategicGoals.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No goals yet</p>
                )}
              </div>
            </Card>

            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Top Performers</h3>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/management/employees">View All</Link>
                </Button>
              </div>
              <div className="space-y-3">
                {employees.filter(e => e.status === 'active').slice(0, 5).map((employee, index) => {
                  const empTasks = tasks.filter(t => t.assigned_to === employee.id && t.status === 'done').length;
                  return (
                    <div key={employee.id} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">Employee {employee.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{empTasks} tasks completed</p>
                      </div>
                    </div>
                  );
                })}
                {employees.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No employees yet</p>
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
                  Growth Trend (6 Months)
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
                      dataKey="goals" 
                      stroke="hsl(var(--primary))" 
                      fill="hsl(var(--primary))" 
                      fillOpacity={0.2} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tasks" 
                      stroke="hsl(var(--accent))" 
                      fill="hsl(var(--accent))" 
                      fillOpacity={0.2} 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Goals Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsPie>
                    <Pie
                      data={goalsByStatus.filter(s => s.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {goalsByStatus.map((_, index) => (
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
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 text-green-500" />
              </div>
              <Progress value={65} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold">{activeRoadmaps}</p>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <Progress value={75} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Task Completion</p>
                  <p className="text-2xl font-bold">
                    {tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </div>
              <Progress value={tasks.length > 0 ? (tasks.filter(t => t.status === 'done').length / tasks.length) * 100 : 0} className="mt-2 h-1.5" />
            </Card>

            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">KPI Metrics</p>
                  <p className="text-2xl font-bold">{kpis.length}</p>
                </div>
                <Target className="h-5 w-5 text-amber-500" />
              </div>
              <Progress value={80} className="mt-2 h-1.5" />
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ManagementLayout>
  );
}
