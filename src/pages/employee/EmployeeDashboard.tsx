import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { useAuth } from '@/hooks/useAuth';
import { useTasks } from '@/hooks/useTasks';
import { useEmployeeRequests, useSalarySlips } from '@/hooks/useEmployeeDashboard';
import { useLeaveRequests, useHRAttendance } from '@/hooks/useHR';
import {
  ListTodo,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  Send,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const { data: allTasks = [] } = useTasks();
  const { data: requests = [] } = useEmployeeRequests();
  const { data: salarySlips = [] } = useSalarySlips();
  const { data: leaveRequests = [] } = useLeaveRequests();
  const { data: attendance = [] } = useHRAttendance();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // For now, show all tasks - in production, filter by assigned_to = current employee
  const myTasks = allTasks;
  const pendingTasks = myTasks.filter(t => t.status === 'todo');
  const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
  const completedTasks = myTasks.filter(t => t.status === 'done');
  const overdueTasks = myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done');

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const latestSalary = salarySlips[0];

  const taskCompletionRate = myTasks.length > 0 
    ? Math.round((completedTasks.length / myTasks.length) * 100) 
    : 0;

  const currentMonth = format(new Date(), 'yyyy-MM');
  const thisMonthAttendance = attendance.filter(a => a.date?.startsWith(currentMonth));
  const presentDays = thisMonthAttendance.filter(a => a.status === 'present').length;
  const lateDays = thisMonthAttendance.filter(a => a.status === 'late').length;
  const absentDays = thisMonthAttendance.filter(a => a.status === 'absent').length;

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </EmployeeLayout>
    );
  }

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-muted-foreground">Here's an overview of your work and activities.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">My Tasks</p>
                  <p className="text-2xl font-bold">{myTasks.length}</p>
                  <p className="text-xs text-blue-600">{inProgressTasks.length} in progress</p>
                </div>
                <ListTodo className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedTasks.length}</p>
                  <p className="text-xs text-green-600">{taskCompletionRate}% completion rate</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className={`bg-gradient-to-br ${overdueTasks.length > 0 ? 'from-red-500/10 to-orange-500/10 border-red-500/20' : 'from-amber-500/10 to-yellow-500/10 border-amber-500/20'}`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{pendingTasks.length}</p>
                  <p className={`text-xs ${overdueTasks.length > 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {overdueTasks.length} overdue
                  </p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Requests</p>
                  <p className="text-2xl font-bold">{requests.length}</p>
                  <p className="text-xs text-purple-600">{pendingRequests.length} pending</p>
                </div>
                <Send className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Overview */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Tasks</CardTitle>
                <CardDescription>Your latest assigned tasks</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/employee/tasks')}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {myTasks.slice(0, 5).map((task) => (
                    <div 
                      key={task.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => navigate('/employee/tasks')}
                    >
                      <div className="flex-1">
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {task.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={
                          task.priority === 'critical' ? 'border-red-500 text-red-500' :
                          task.priority === 'high' ? 'border-orange-500 text-orange-500' :
                          task.priority === 'medium' ? 'border-blue-500 text-blue-500' :
                          'border-slate-500 text-slate-500'
                        }>
                          {task.priority}
                        </Badge>
                        <Badge className={
                          task.status === 'done' ? 'bg-green-500' :
                          task.status === 'in_progress' ? 'bg-blue-500' :
                          task.status === 'blocked' ? 'bg-red-500' :
                          'bg-slate-500'
                        }>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {myTasks.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No tasks assigned yet
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Task Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Completion Rate</span>
                  <span className="font-medium">{taskCompletionRate}%</span>
                </div>
                <Progress value={taskCompletionRate} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 rounded bg-slate-500/10">
                    <p className="font-bold text-lg">{pendingTasks.length}</p>
                    <p className="text-muted-foreground">To Do</p>
                  </div>
                  <div className="p-2 rounded bg-blue-500/10">
                    <p className="font-bold text-lg">{inProgressTasks.length}</p>
                    <p className="text-muted-foreground">In Progress</p>
                  </div>
                  <div className="p-2 rounded bg-green-500/10">
                    <p className="font-bold text-lg">{completedTasks.length}</p>
                    <p className="text-muted-foreground">Done</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  This Month Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded bg-green-500/10">
                    <p className="font-bold text-lg text-green-600">{presentDays}</p>
                    <p className="text-xs text-muted-foreground">Present</p>
                  </div>
                  <div className="p-2 rounded bg-amber-500/10">
                    <p className="font-bold text-lg text-amber-600">{lateDays}</p>
                    <p className="text-xs text-muted-foreground">Late</p>
                  </div>
                  <div className="p-2 rounded bg-red-500/10">
                    <p className="font-bold text-lg text-red-600">{absentDays}</p>
                    <p className="text-xs text-muted-foreground">Absent</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Latest Salary */}
            {latestSalary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Latest Salary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium">
                        {format(new Date(latestSalary.period_start), 'MMM d')} - {format(new Date(latestSalary.period_end), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gross</span>
                      <span>${latestSalary.gross_salary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-red-500">
                      <span>Deductions</span>
                      <span>-${latestSalary.total_deductions?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Net Salary</span>
                      <span className="text-green-600">${latestSalary.net_salary?.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </EmployeeLayout>
  );
}
