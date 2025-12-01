import { useState, useMemo, useEffect } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagementSidebar } from '@/components/management/ManagementSidebar';
import { useTasks, useAddTask, useUpdateTaskStatus, useDeleteTask, TaskPriority } from '@/hooks/useTasks';
import { useTaskStages } from '@/hooks/useTaskStages';
import { useDepartments } from '@/hooks/useDepartments';
import { useEmployees } from '@/hooks/useEmployees';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { CheckSquare, Plus, Trash2, Loader2, Clock, Search, LayoutGrid, List, Building } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const priorityColors: Record<TaskPriority, string> = {
  low: 'bg-slate-500/10 text-slate-500',
  medium: 'bg-blue-500/10 text-blue-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

export default function ManagementTasksPage() {
  const { data: tasks = [], isLoading } = useTasks();
  const { data: stages = [] } = useTaskStages();
  const { data: departments = [] } = useDepartments();
  const { data: employees = [] } = useEmployees();
  const addTask = useAddTask();
  const updateStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('__all__');
  const [isDragging, setIsDragging] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [departmentId, setDepartmentId] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState('');

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = selectedDepartment === '__all__' || task.department_id === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [tasks, searchQuery, selectedDepartment]);

  const tasksByStage = useMemo(() => {
    const grouped: Record<string, typeof tasks> = {};
    stages.forEach(stage => { grouped[stage.value] = []; });
    filteredTasks.forEach(task => {
      const stage = task.status || 'todo';
      if (grouped[stage]) grouped[stage].push(task);
      else if (grouped['todo']) grouped['todo'].push(task);
    });
    return grouped;
  }, [filteredTasks, stages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Task title is required'); return; }
    await addTask.mutateAsync({
      title,
      description: description || undefined,
      priority,
      department_id: departmentId || undefined,
      assigned_to: assignedTo || undefined,
      due_date: dueDate || undefined,
    });
    setTitle(''); setDescription(''); setPriority('medium'); setDepartmentId(''); setAssignedTo(''); setDueDate('');
    setDialogOpen(false);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId;
    await updateStatus.mutateAsync({ id: taskId, status: newStatus as any });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) await deleteTask.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <ManagementSidebar />
          <main className="flex-1 p-6 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold">Company Tasks</h1>
                <p className="text-muted-foreground">Manage tasks across all departments</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Task</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2"><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" required /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Priority</Label>
                        <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={departmentId || "__none__"} onValueChange={(v) => setDepartmentId(v === "__none__" ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">No Department</SelectItem>
                            {departments.map((dept) => <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Assign To</Label>
                        <Select value={assignedTo || "__none__"} onValueChange={(v) => setAssignedTo(v === "__none__" ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Unassigned</SelectItem>
                            {employees.map((emp) => <SelectItem key={emp.id} value={emp.id}>{emp.position || emp.employee_code}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={addTask.isPending}>{addTask.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Task'}</Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search tasks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Departments</SelectItem>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setViewMode('kanban')}><LayoutGrid className="h-4 w-4" /></Button>
                  <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-none border-l border-border" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
                </div>
              </div>
            </Card>

            {filteredTasks.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-4">Create your first task to get started</p>
                  <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Create Task</Button>
                </CardContent>
              </Card>
            ) : viewMode === 'kanban' ? (
              <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {stages.map(stage => (
                    <div key={stage.value} className={cn("flex-shrink-0 w-80 rounded-xl border transition-all", isDragging ? "border-dashed border-primary/50" : "border-border/50", "bg-gradient-to-b from-muted/30 to-muted/10")}>
                      <div className="p-4 rounded-t-xl border-b border-border/50" style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                            <h3 className="font-semibold">{stage.name}</h3>
                          </div>
                          <Badge variant="secondary" className="bg-background/30">{tasksByStage[stage.value]?.length || 0}</Badge>
                        </div>
                      </div>
                      <Droppable droppableId={stage.value}>
                        {(provided, snapshot) => (
                          <ScrollArea className={cn("h-[calc(100vh-380px)] p-2 transition-colors rounded-b-xl", snapshot.isDraggingOver && "bg-primary/5")}>
                            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[100px]">
                              {tasksByStage[stage.value]?.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided, snapshot) => (
                                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                      <Card className={cn("p-3 cursor-pointer transition-all hover:shadow-lg bg-card/80", snapshot.isDragging && "shadow-xl ring-2 ring-primary/30")}>
                                        <div className="flex items-start justify-between mb-2">
                                          <h4 className="font-medium text-sm">{task.title}</h4>
                                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDelete(task.id)}><Trash2 className="h-3 w-3" /></Button>
                                        </div>
                                        {task.departments && <p className="text-xs text-muted-foreground mb-2">{task.departments.name}</p>}
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge variant="secondary" className={priorityColors[task.priority]}>{task.priority}</Badge>
                                          {task.due_date && <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{format(new Date(task.due_date), 'MMM d')}</div>}
                                        </div>
                                      </Card>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </div>
                          </ScrollArea>
                        )}
                      </Droppable>
                    </div>
                  ))}
                </div>
              </DragDropContext>
            ) : (
              <Card className="bg-card/50 border-border/50">
                <div className="p-4 overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2 text-sm font-medium text-muted-foreground">Task</th>
                        <th className="text-left p-2 text-sm font-medium text-muted-foreground">Department</th>
                        <th className="text-left p-2 text-sm font-medium text-muted-foreground">Priority</th>
                        <th className="text-left p-2 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-2 text-sm font-medium text-muted-foreground">Due Date</th>
                        <th className="text-left p-2 text-sm font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map(task => {
                        const stage = stages.find(s => s.value === task.status);
                        return (
                          <tr key={task.id} className="border-b border-border/50 hover:bg-muted/20">
                            <td className="p-2 font-medium">{task.title}</td>
                            <td className="p-2 text-muted-foreground">{task.departments?.name || '-'}</td>
                            <td className="p-2"><Badge className={priorityColors[task.priority]}>{task.priority}</Badge></td>
                            <td className="p-2"><Badge style={{ backgroundColor: `${stage?.color}20`, color: stage?.color }}>{stage?.name}</Badge></td>
                            <td className="p-2 text-muted-foreground">{task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy') : '-'}</td>
                            <td className="p-2"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(task.id)}><Trash2 className="h-4 w-4" /></Button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
