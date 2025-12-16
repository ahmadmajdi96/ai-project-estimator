import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { TaskDetailDialog } from '@/components/employee/TaskDetailDialog';
import { useAuth } from '@/hooks/useAuth';
import { useTasks, Task } from '@/hooks/useTasks';
import { useEmployeeRequests, useSalarySlips } from '@/hooks/useEmployeeDashboard';
import { useLeaveRequests, useHRAttendance } from '@/hooks/useHR';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  ListTodo,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  DollarSign,
  Send,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Target,
  Zap,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient, 
  onClick 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: any; 
  gradient: string; 
  onClick?: () => void 
}) => (
  <Card 
    className={cn(
      'relative overflow-hidden cursor-pointer group transition-all duration-300',
      'hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1',
      'border-0 bg-gradient-to-br',
      gradient
    )}
    onClick={onClick}
  >
    {/* Decorative elements */}
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12" />
    
    <CardContent className="p-5 relative">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-white/80">{title}</p>
          <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
          <p className="text-xs text-white/70 flex items-center gap-1">
            {subtitle}
          </p>
        </div>
        <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl group-hover:scale-110 transition-transform">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function EmployeeDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
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

  useEffect(() => {
    const fetchEmployeeName = async () => {
      if (user?.id) {
        const { data } = await supabase
          .from('employees')
          .select('full_name')
          .eq('user_id', user.id)
          .single();
        if (data?.full_name) {
          setEmployeeName(data.full_name);
        }
      }
    };
    fetchEmployeeName();
  }, [user?.id]);

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
  const currentMonthName = format(new Date(), 'MMMM yyyy');
  const thisMonthAttendance = attendance.filter(a => a.date?.startsWith(currentMonth));
  const presentDays = thisMonthAttendance.filter(a => a.status === 'present').length;
  const lateDays = thisMonthAttendance.filter(a => a.status === 'late').length;
  const absentDays = thisMonthAttendance.filter(a => a.status === 'absent').length;

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <EmployeeLayout>
        <div className="flex items-center justify-center h-64">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <EmployeeLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent p-6 lg:p-8">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,white)]" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
          
          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-4 ring-white/30">
                <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                  {employeeName?.slice(0, 2).toUpperCase() || user?.email?.slice(0, 2).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-white/80 text-sm font-medium">{greeting()}</p>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">
                  {employeeName || 'Welcome Back'}!
                </h1>
                <p className="text-white/70 text-sm mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                onClick={() => navigate('/employee/tasks')}
              >
                <Target className="h-4 w-4 mr-2" />
                View Tasks
              </Button>
              <Button 
                variant="secondary" 
                className="bg-white hover:bg-white/90 text-primary"
                onClick={() => navigate('/employee/ai-chat')}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="My Tasks"
            value={myTasks.length}
            subtitle={`${inProgressTasks.length} in progress`}
            icon={ListTodo}
            gradient="from-blue-500 to-blue-600"
            onClick={() => navigate('/employee/tasks')}
          />
          <StatCard
            title="Completed"
            value={completedTasks.length}
            subtitle={`${taskCompletionRate}% completion rate`}
            icon={CheckCircle}
            gradient="from-emerald-500 to-emerald-600"
            onClick={() => navigate('/employee/tasks')}
          />
          <StatCard
            title="To Do"
            value={pendingTasks.length}
            subtitle={overdueTasks.length > 0 ? `${overdueTasks.length} overdue` : 'All on track'}
            icon={overdueTasks.length > 0 ? AlertTriangle : Clock}
            gradient={overdueTasks.length > 0 ? "from-red-500 to-orange-500" : "from-amber-500 to-amber-600"}
            onClick={() => navigate('/employee/tasks')}
          />
          <StatCard
            title="Requests"
            value={requests.length}
            subtitle={`${pendingRequests.length} pending approval`}
            icon={Send}
            gradient="from-violet-500 to-purple-600"
            onClick={() => navigate('/employee/requests')}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Overview */}
          <Card className="lg:col-span-2 border-0 shadow-lg shadow-black/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  Recent Tasks
                </CardTitle>
                <CardDescription className="mt-1">Your latest assigned tasks</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/employee/tasks')} className="gap-1 text-primary">
                View All <ChevronRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[340px] pr-4">
                <div className="space-y-3">
                  {myTasks.slice(0, 6).map((task, index) => (
                    <div 
                      key={task.id} 
                      className={cn(
                        'group flex items-center gap-4 p-4 rounded-xl border bg-card/50',
                        'hover:bg-muted/50 hover:border-primary/20 cursor-pointer transition-all duration-200',
                        'animate-in fade-in-0 slide-in-from-bottom-2'
                      )}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        task.status === 'done' ? 'bg-emerald-500/10 text-emerald-500' :
                        task.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                        task.status === 'blocked' ? 'bg-red-500/10 text-red-500' :
                        'bg-slate-500/10 text-slate-500'
                      )}>
                        {task.status === 'done' ? <CheckCircle className="h-5 w-5" /> : 
                         task.status === 'in_progress' ? <Clock className="h-5 w-5" /> :
                         <ListTodo className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">{task.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {task.description || 'No description'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className={cn(
                          'text-[10px] font-semibold border',
                          task.priority === 'critical' ? 'border-red-500/50 text-red-600 bg-red-50' :
                          task.priority === 'high' ? 'border-orange-500/50 text-orange-600 bg-orange-50' :
                          task.priority === 'medium' ? 'border-blue-500/50 text-blue-600 bg-blue-50' :
                          'border-slate-500/50 text-slate-600 bg-slate-50'
                        )}>
                          {task.priority}
                        </Badge>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  ))}
                  {myTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                        <ListTodo className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-muted-foreground">No tasks assigned yet</p>
                      <p className="text-sm text-muted-foreground/70 mt-1">Tasks will appear here once assigned</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Task Progress */}
            <Card className="border-0 shadow-lg shadow-black/5 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  Task Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Completion Rate</span>
                  <span className="font-bold text-lg">{taskCompletionRate}%</span>
                </div>
                <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                    style={{ width: `${taskCompletionRate}%` }}
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[
                    { label: 'To Do', value: pendingTasks.length, color: 'bg-slate-500' },
                    { label: 'In Progress', value: inProgressTasks.length, color: 'bg-blue-500' },
                    { label: 'Done', value: completedTasks.length, color: 'bg-emerald-500' },
                  ].map((item) => (
                    <div key={item.label} className="text-center p-3 rounded-xl bg-muted/50">
                      <div className="flex items-center justify-center gap-1.5 mb-1">
                        <div className={cn('w-2 h-2 rounded-full', item.color)} />
                      </div>
                      <p className="font-bold text-xl">{item.value}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Attendance Summary */}
            <Card 
              className="border-0 shadow-lg shadow-black/5 cursor-pointer hover:shadow-xl transition-shadow"
              onClick={() => navigate('/employee/attendance')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  {currentMonthName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Present', value: presentDays, gradient: 'from-emerald-500/20 to-emerald-500/5', color: 'text-emerald-600' },
                    { label: 'Late', value: lateDays, gradient: 'from-amber-500/20 to-amber-500/5', color: 'text-amber-600' },
                    { label: 'Absent', value: absentDays, gradient: 'from-red-500/20 to-red-500/5', color: 'text-red-600' },
                  ].map((item) => (
                    <div key={item.label} className={cn('p-3 rounded-xl text-center bg-gradient-to-b', item.gradient)}>
                      <p className={cn('font-bold text-xl', item.color)}>{item.value}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{item.label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Latest Salary */}
            {latestSalary && (
              <Card 
                className="border-0 shadow-lg shadow-black/5 cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => navigate('/employee/salary')}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Latest Salary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Period</span>
                      <span className="font-medium">
                        {format(new Date(latestSalary.period_start), 'MMM d')} - {format(new Date(latestSalary.period_end), 'MMM d')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Gross</span>
                      <span className="font-medium">${latestSalary.gross_salary?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-red-500">
                      <span>Deductions</span>
                      <span>-${latestSalary.total_deductions?.toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Net Salary</span>
                      <span className="text-xl font-bold text-emerald-600">
                        ${latestSalary.net_salary?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </EmployeeLayout>
  );
}
