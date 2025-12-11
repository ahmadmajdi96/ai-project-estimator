import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardList, User, Plus, CheckCircle, Clock, FileText, Laptop, GraduationCap } from "lucide-react";
import { useOnboardingTasks } from "@/hooks/useHR";
import { useEmployees } from "@/hooks/useEmployees";
import { format, differenceInDays } from "date-fns";

export default function HROnboardingPage() {
  const { data: tasks, isLoading: tasksLoading } = useOnboardingTasks();
  const { data: employees } = useEmployees();

  // Get new hires (hired in last 30 days)
  const newHires = employees?.filter((emp) => {
    const hireDate = new Date(emp.hire_date);
    const daysSinceHire = differenceInDays(new Date(), hireDate);
    return daysSinceHire <= 30;
  }) || [];

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      documents: <FileText className="h-4 w-4" />,
      it_setup: <Laptop className="h-4 w-4" />,
      training: <GraduationCap className="h-4 w-4" />,
      equipment: <ClipboardList className="h-4 w-4" />,
      orientation: <User className="h-4 w-4" />,
      general: <CheckCircle className="h-4 w-4" />,
    };
    return icons[category] || icons.general;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      pending: { variant: "secondary" },
      in_progress: { variant: "default", className: "bg-blue-500" },
      completed: { variant: "default", className: "bg-green-500" },
      cancelled: { variant: "outline" },
    };
    return (
      <Badge variant={config[status]?.variant || "default"} className={config[status]?.className}>
        {status?.replace("_", " ")}
      </Badge>
    );
  };

  const getEmployeeOnboardingProgress = (employeeId: string) => {
    const employeeTasks = tasks?.filter((t: any) => t.employee_id === employeeId) || [];
    if (employeeTasks.length === 0) return 0;
    const completedTasks = employeeTasks.filter((t: any) => t.status === 'completed').length;
    return Math.round((completedTasks / employeeTasks.length) * 100);
  };

  const getTasksByEmployee = (employeeId: string) => {
    return tasks?.filter((t: any) => t.employee_id === employeeId) || [];
  };

  const pendingTasks = tasks?.filter((t: any) => t.status === 'pending').length || 0;
  const completedTasks = tasks?.filter((t: any) => t.status === 'completed').length || 0;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Onboarding Center</h1>
            <p className="text-muted-foreground">Manage new employee onboarding</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Onboarding Task
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires</CardTitle>
              <User className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{newHires.length}</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks}</div>
              <p className="text-xs text-muted-foreground">Awaiting completion</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks done</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All onboarding tasks</p>
            </CardContent>
          </Card>
        </div>

        {/* New Hires List */}
        <Card>
          <CardHeader>
            <CardTitle>New Hire Onboarding</CardTitle>
            <CardDescription>Track onboarding progress for recent hires</CardDescription>
          </CardHeader>
          <CardContent>
            {newHires.length > 0 ? (
              <div className="space-y-6">
                {newHires.map((employee) => {
                  const progress = getEmployeeOnboardingProgress(employee.id);
                  const employeeTasks = getTasksByEmployee(employee.id);
                  
                  return (
                    <div key={employee.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium">{employee.employee_code || 'New Employee'}</h3>
                            <p className="text-sm text-muted-foreground">{employee.position}</p>
                            <p className="text-xs text-muted-foreground">
                              Hired: {format(new Date(employee.hire_date), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{progress}%</div>
                          <p className="text-xs text-muted-foreground">Complete</p>
                        </div>
                      </div>
                      
                      <Progress value={progress} className="h-2 mb-4" />
                      
                      {employeeTasks.length > 0 ? (
                        <div className="space-y-2">
                          {employeeTasks.map((task: any) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                            >
                              <Checkbox checked={task.status === 'completed'} disabled />
                              <div className="flex items-center gap-2 flex-1">
                                {getCategoryIcon(task.category)}
                                <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                  {task.task_name}
                                </span>
                              </div>
                              {getStatusBadge(task.status)}
                              {task.due_date && (
                                <span className="text-xs text-muted-foreground">
                                  Due: {format(new Date(task.due_date), "MMM d")}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-2">No onboarding tasks assigned</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No recent hires</h3>
                <p className="text-muted-foreground">New employees will appear here for onboarding</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Tasks */}
        {tasksLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>
        ) : tasks && tasks.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>All Onboarding Tasks</CardTitle>
              <CardDescription>Complete list of onboarding activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tasks.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-muted">
                      {getCategoryIcon(task.category)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{task.task_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.employees?.employee_code || 'Unassigned'} • {task.category}
                      </p>
                    </div>
                    {getStatusBadge(task.status)}
                    {task.due_date && (
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(task.due_date), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </HRLayout>
  );
}
