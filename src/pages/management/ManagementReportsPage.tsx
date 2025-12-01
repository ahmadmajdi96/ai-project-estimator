import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagementSidebar } from '@/components/management/ManagementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDepartments } from '@/hooks/useDepartments';
import { useEmployees } from '@/hooks/useEmployees';
import { useTasks } from '@/hooks/useTasks';
import { useKPIDefinitions, useKPIRecords } from '@/hooks/useKPIs';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Download, Users, CheckSquare, Target, Building, Loader2 } from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { toast } from 'sonner';

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function ManagementReportsPage() {
  const { data: departments = [], isLoading: loadingDepts } = useDepartments();
  const { data: employees = [], isLoading: loadingEmps } = useEmployees();
  const { data: tasks = [], isLoading: loadingTasks } = useTasks();
  const { data: kpis = [] } = useKPIDefinitions();
  const { data: kpiRecords = [] } = useKPIRecords();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('__all__');
  const [period, setPeriod] = useState<string>('6');

  const filteredEmployees = employees.filter(e => selectedDepartment === '__all__' || e.department_id === selectedDepartment);
  const filteredTasks = tasks.filter(t => selectedDepartment === '__all__' || t.department_id === selectedDepartment);
  const filteredKPIs = kpis.filter(k => selectedDepartment === '__all__' || k.department_id === selectedDepartment);

  const monthsCount = parseInt(period);
  const monthlyData = Array.from({ length: monthsCount }, (_, i) => {
    const date = subMonths(new Date(), monthsCount - 1 - i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthTasks = filteredTasks.filter(t => t.created_at && isWithinInterval(new Date(t.created_at), { start: monthStart, end: monthEnd }));
    const completedTasks = monthTasks.filter(t => t.status === 'done');
    return {
      month: format(date, 'MMM'),
      tasks: monthTasks.length,
      completed: completedTasks.length,
    };
  });

  const tasksByStatus = [
    { name: 'Done', value: filteredTasks.filter(t => t.status === 'done').length, color: '#10b981' },
    { name: 'In Progress', value: filteredTasks.filter(t => t.status === 'in_progress').length, color: '#3b82f6' },
    { name: 'Todo', value: filteredTasks.filter(t => t.status === 'todo').length, color: '#f59e0b' },
    { name: 'Review', value: filteredTasks.filter(t => t.status === 'review').length, color: '#8b5cf6' },
  ].filter(s => s.value > 0);

  const employeesByStatus = [
    { name: 'Active', value: filteredEmployees.filter(e => e.status === 'active').length, color: '#10b981' },
    { name: 'Inactive', value: filteredEmployees.filter(e => e.status === 'inactive').length, color: '#ef4444' },
    { name: 'On Leave', value: filteredEmployees.filter(e => e.status === 'on_leave').length, color: '#f59e0b' },
  ].filter(s => s.value > 0);

  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) { toast.error('No data to export'); return; }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => Object.values(row).join(',')).join('\n');
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filename}.csv`);
  };

  const isLoading = loadingDepts || loadingEmps || loadingTasks;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold">Reports & Analytics</h1>
                <p className="text-muted-foreground">Company-wide performance insights</p>
              </div>
              <div className="flex gap-3">
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">Last 3 months</SelectItem>
                    <SelectItem value="6">Last 6 months</SelectItem>
                    <SelectItem value="12">Last 12 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="p-4 bg-card/50">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10"><Building className="h-5 w-5 text-primary" /></div>
                      <div><p className="text-2xl font-bold">{departments.length}</p><p className="text-xs text-muted-foreground">Departments</p></div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/10"><Users className="h-5 w-5 text-green-500" /></div>
                      <div><p className="text-2xl font-bold">{filteredEmployees.length}</p><p className="text-xs text-muted-foreground">Employees</p></div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/10"><CheckSquare className="h-5 w-5 text-blue-500" /></div>
                      <div><p className="text-2xl font-bold">{filteredTasks.length}</p><p className="text-xs text-muted-foreground">Tasks</p></div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10"><Target className="h-5 w-5 text-amber-500" /></div>
                      <div><p className="text-2xl font-bold">{filteredKPIs.length}</p><p className="text-xs text-muted-foreground">KPIs</p></div>
                    </div>
                  </Card>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>Task Trends</CardTitle>
                      <Button variant="outline" size="sm" onClick={() => exportToCSV(monthlyData, 'task_trends')}><Download className="h-4 w-4 mr-2" />Export</Button>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Area type="monotone" dataKey="tasks" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.2} name="Created" />
                          <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Completed" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Tasks by Status</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie data={tasksByStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                            {tasksByStatus.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Employees by Status</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={employeesByStatus}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                          <YAxis stroke="hsl(var(--muted-foreground))" />
                          <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {employeesByStatus.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader><CardTitle>Department Overview</CardTitle></CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {departments.map(dept => {
                          const deptEmps = employees.filter(e => e.department_id === dept.id);
                          const deptTasks = tasks.filter(t => t.department_id === dept.id);
                          return (
                            <div key={dept.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color || 'hsl(var(--primary))' }} />
                                <span className="font-medium">{dept.name}</span>
                              </div>
                              <div className="flex gap-4 text-sm text-muted-foreground">
                                <span>{deptEmps.length} employees</span>
                                <span>{deptTasks.length} tasks</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
