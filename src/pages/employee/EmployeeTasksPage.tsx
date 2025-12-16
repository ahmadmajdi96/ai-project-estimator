import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { CreateTaskDialog } from '@/components/employee/CreateTaskDialog';
import { useTasks, Task, useUpdateTaskStatus } from '@/hooks/useTasks';
import { useTaskStages } from '@/hooks/useTaskStages';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useEmployees } from '@/hooks/useEmployees';
import { useUserRole, useTeamMembers } from '@/hooks/useUserRole';
import { 
  Search, Filter, Calendar, GripVertical, FolderKanban, CalendarRange, 
  Plus, Users, LayoutGrid, List, AlertCircle, Clock, CheckCircle,
  Sparkles, ChevronRight, MoreHorizontal
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

const defaultStatuses = [
  { id: 'todo', name: 'To Do', color: '#64748b', icon: AlertCircle },
  { id: 'in_progress', name: 'In Progress', color: '#3b82f6', icon: Clock },
  { id: 'review', name: 'Review', color: '#a855f7', icon: Sparkles },
  { id: 'done', name: 'Done', color: '#22c55e', icon: CheckCircle },
  { id: 'blocked', name: 'Blocked', color: '#ef4444', icon: AlertCircle },
];

const priorityConfig: Record<string, { color: string; bg: string; border: string }> = {
  low: { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  medium: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

export default function EmployeeTasksPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: tasks = [], refetch } = useTasks();
  const { data: customStages = [] } = useTaskStages();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: employees = [] } = useEmployees();
  const updateTaskStatus = useUpdateTaskStatus();
  
  const { canViewTeamData, employeeId } = useUserRole();
  const { data: teamMembers = [] } = useTeamMembers(canViewTeamData ? employeeId : null);

  const stages = defaultStatuses;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || (task as any).roadmap_id === projectFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assigned_to === assigneeFilter;
      
      let matchesDate = true;
      if (dateRange?.from && task.due_date) {
        const dueDate = parseISO(task.due_date);
        matchesDate = isAfter(dueDate, startOfDay(dateRange.from)) || 
                      format(dueDate, 'yyyy-MM-dd') === format(dateRange.from, 'yyyy-MM-dd');
        if (dateRange.to) {
          matchesDate = matchesDate && (isBefore(dueDate, endOfDay(dateRange.to)) || 
                        format(dueDate, 'yyyy-MM-dd') === format(dateRange.to, 'yyyy-MM-dd'));
        }
      }
      
      return matchesSearch && matchesPriority && matchesProject && matchesAssignee && matchesDate;
    });
  }, [tasks, searchTerm, priorityFilter, projectFilter, assigneeFilter, dateRange]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const statusOrder: Record<string, number> = { todo: 0, in_progress: 1, review: 2, blocked: 3, done: 4 };
      const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      if (statusDiff !== 0) return statusDiff;
      
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }, [filteredTasks]);

  const getTasksByStatus = (status: string) => {
    return filteredTasks
      .filter(task => task.status === status)
      .sort((a, b) => {
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      });
  };

  const handleTaskClick = (task: Task) => {
    navigate(`/employee/tasks/${task.id}`);
  };

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    return employees.find(e => e.id === assignedTo)?.full_name || 'Unknown';
  };

  const assigneeOptions = canViewTeamData ? teamMembers : employees;

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];
    
    await updateTaskStatus.mutateAsync({ id: taskId, status: newStatus });
    refetch();
  };

  const getProjectName = (roadmapId: string | null) => {
    if (!roadmapId) return null;
    const project = roadmaps.find(r => r.id === roadmapId);
    return project?.title || null;
  };

  const clearDateFilter = () => {
    setDateRange(undefined);
  };

  const taskStats = {
    total: filteredTasks.length,
    todo: filteredTasks.filter(t => t.status === 'todo').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    done: filteredTasks.filter(t => t.status === 'done').length,
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              My Tasks
            </h1>
            <p className="text-muted-foreground mt-1">Manage and track your assigned tasks</p>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>
            <div className="flex rounded-lg border bg-muted/50 p-1">
              <Button
                variant={viewMode === 'kanban' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="gap-1.5"
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden md:inline">Kanban</span>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="gap-1.5"
              >
                <List className="h-4 w-4" />
                <span className="hidden md:inline">List</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Tasks', value: taskStats.total, color: 'from-slate-500 to-slate-600' },
            { label: 'To Do', value: taskStats.todo, color: 'from-amber-500 to-orange-500' },
            { label: 'In Progress', value: taskStats.inProgress, color: 'from-blue-500 to-cyan-500' },
            { label: 'Completed', value: taskStats.done, color: 'from-emerald-500 to-green-500' },
          ].map((stat) => (
            <div key={stat.label} className={cn(
              'relative overflow-hidden rounded-xl p-4 bg-gradient-to-br text-white',
              stat.color
            )}>
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
              <p className="text-white/80 text-xs font-medium">{stat.label}</p>
              <p className="text-2xl font-bold mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-muted/50 border-0 focus-visible:ring-primary/20"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px] bg-muted/50 border-0">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[160px] bg-muted/50 border-0">
                  <FolderKanban className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {roadmaps.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[160px] bg-muted/50 border-0">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.full_name || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[200px] justify-start bg-muted/50 border-0">
                    <CalendarRange className="mr-2 h-4 w-4 text-muted-foreground" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <span className="truncate">
                          {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}
                        </span>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span className="text-muted-foreground">Due date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="pointer-events-auto"
                  />
                  {dateRange && (
                    <div className="p-2 border-t">
                      <Button variant="ghost" size="sm" onClick={clearDateFilter} className="w-full">
                        Clear filter
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Kanban View */}
        {viewMode === 'kanban' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {stages.map((stage) => {
                const StatusIcon = stage.icon;
                const columnTasks = getTasksByStatus(stage.id);
                
                return (
                  <div key={stage.id} className="flex flex-col">
                    {/* Column Header */}
                    <div 
                      className="flex items-center gap-2 p-3 rounded-xl mb-3"
                      style={{ backgroundColor: `${stage.color}15` }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${stage.color}25` }}
                      >
                        <StatusIcon className="h-4 w-4" style={{ color: stage.color }} />
                      </div>
                      <span className="font-semibold text-sm flex-1">{stage.name}</span>
                      <Badge 
                        variant="secondary" 
                        className="h-6 px-2 font-bold"
                        style={{ backgroundColor: `${stage.color}20`, color: stage.color }}
                      >
                        {columnTasks.length}
                      </Badge>
                    </div>
                    
                    {/* Drop Zone */}
                    <Droppable droppableId={stage.id}>
                      {(provided, snapshot) => (
                        <ScrollArea 
                          className={cn(
                            'flex-1 min-h-[300px] max-h-[calc(100vh-400px)] rounded-xl p-2 transition-all duration-200',
                            snapshot.isDraggingOver 
                              ? 'bg-primary/5 ring-2 ring-primary/20 ring-dashed' 
                              : 'bg-muted/30'
                          )}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <div className="space-y-2">
                            {columnTasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <Card
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    className={cn(
                                      'cursor-pointer border-0 shadow-sm hover:shadow-md transition-all duration-200',
                                      'bg-card hover:bg-card/80',
                                      snapshot.isDragging && 'shadow-xl ring-2 ring-primary/20 rotate-2'
                                    )}
                                    onClick={() => handleTaskClick(task)}
                                  >
                                    <CardContent className="p-3">
                                      <div className="flex items-start gap-2">
                                        <div {...provided.dragHandleProps} className="mt-1 opacity-50 hover:opacity-100">
                                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className="font-medium text-sm line-clamp-2">{task.title}</p>
                                          {task.description && (
                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                              {task.description}
                                            </p>
                                          )}
                                          {getProjectName((task as any).roadmap_id) && (
                                            <div className="flex items-center gap-1 mt-2">
                                              <FolderKanban className="h-3 w-3 text-muted-foreground" />
                                              <span className="text-[10px] text-muted-foreground truncate">
                                                {getProjectName((task as any).roadmap_id)}
                                              </span>
                                            </div>
                                          )}
                                          <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
                                            <div className="flex items-center gap-1.5">
                                              <Badge 
                                                variant="outline" 
                                                className={cn(
                                                  'text-[10px] font-semibold h-5 px-1.5',
                                                  priorityConfig[task.priority]?.color,
                                                  priorityConfig[task.priority]?.bg,
                                                  priorityConfig[task.priority]?.border
                                                )}
                                              >
                                                {task.priority}
                                              </Badge>
                                              {task.due_date && (
                                                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                  <Calendar className="h-3 w-3" />
                                                  {format(new Date(task.due_date), 'MMM d')}
                                                </span>
                                              )}
                                            </div>
                                            {task.assigned_to && (
                                              <Avatar className="h-6 w-6 ring-2 ring-background">
                                                <AvatarFallback className="text-[10px] bg-gradient-to-br from-primary to-accent text-white">
                                                  {getAssigneeName(task.assigned_to).slice(0, 2).toUpperCase()}
                                                </AvatarFallback>
                                              </Avatar>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {columnTasks.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2">
                                  <StatusIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <p className="text-xs text-muted-foreground">No tasks</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card className="border-0 shadow-lg shadow-black/5">
            <CardContent className="p-0">
              <div className="divide-y">
                {sortedTasks.map((task, index) => {
                  const stage = stages.find(s => s.id === task.status);
                  const StatusIcon = stage?.icon || AlertCircle;
                  
                  return (
                    <div 
                      key={task.id}
                      className={cn(
                        'flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors',
                        'animate-in fade-in-0 slide-in-from-bottom-1'
                      )}
                      style={{ animationDelay: `${index * 30}ms` }}
                      onClick={() => handleTaskClick(task)}
                    >
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${stage?.color}15` }}
                      >
                        <StatusIcon className="h-5 w-5" style={{ color: stage?.color }} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{task.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              'text-[10px] font-semibold',
                              priorityConfig[task.priority]?.color,
                              priorityConfig[task.priority]?.bg,
                              priorityConfig[task.priority]?.border
                            )}
                          >
                            {task.priority}
                          </Badge>
                          {task.due_date && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(task.due_date), 'MMM d, yyyy')}
                            </span>
                          )}
                          {getProjectName((task as any).roadmap_id) && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              {getProjectName((task as any).roadmap_id)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {task.assigned_to && (
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-primary to-accent text-white">
                            {getAssigneeName(task.assigned_to).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    </div>
                  );
                })}
                
                {sortedTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="font-medium text-muted-foreground">No tasks found</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">Try adjusting your filters</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateTaskDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen} 
      />
    </EmployeeLayout>
  );
}
