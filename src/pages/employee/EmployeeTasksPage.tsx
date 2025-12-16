import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { EnhancedTaskDetailSheet } from '@/components/employee/EnhancedTaskDetailSheet';
import { CreateTaskDialog } from '@/components/employee/CreateTaskDialog';
import { useTasks, Task, useUpdateTaskStatus } from '@/hooks/useTasks';
import { useTaskStages } from '@/hooks/useTaskStages';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useEmployees } from '@/hooks/useEmployees';
import { useUserRole, useTeamMembers } from '@/hooks/useUserRole';
import { Search, Filter, Calendar, GripVertical, FolderKanban, CalendarRange, Plus, Users } from 'lucide-react';
import { format, parseISO, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';

const defaultStatuses = [
  { id: 'todo', name: 'To Do', color: '#64748b' },
  { id: 'in_progress', name: 'In Progress', color: '#3b82f6' },
  { id: 'review', name: 'Review', color: '#a855f7' },
  { id: 'done', name: 'Done', color: '#22c55e' },
  { id: 'blocked', name: 'Blocked', color: '#ef4444' },
];

const priorityColors: Record<string, string> = {
  low: 'border-slate-500 text-slate-500',
  medium: 'border-blue-500 text-blue-500',
  high: 'border-orange-500 text-orange-500',
  critical: 'border-red-500 text-red-500',
};

export default function EmployeeTasksPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const { data: tasks = [], refetch } = useTasks();
  const { data: customStages = [] } = useTaskStages();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: employees = [] } = useEmployees();
  const updateTaskStatus = useUpdateTaskStatus();
  
  const { canViewTeamData, employeeId } = useUserRole();
  const { data: teamMembers = [] } = useTeamMembers(canViewTeamData ? employeeId : null);

  // Use default statuses only (not pipeline stages - they are different)
  const stages = defaultStatuses;

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'all' || (task as any).roadmap_id === projectFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assigned_to === assigneeFilter;
      
      // Date range filter
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

  // Sort tasks by due date for list view
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      // First sort by status priority
      const statusOrder: Record<string, number> = { todo: 0, in_progress: 1, review: 2, blocked: 3, done: 4 };
      const statusDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      if (statusDiff !== 0) return statusDiff;
      
      // Then sort by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      if (a.due_date) return -1;
      if (b.due_date) return 1;
      
      // Then by priority
      const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
      return (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2);
    });
  }, [filteredTasks]);

  const getTasksByStatus = (status: string) => {
    return filteredTasks
      .filter(task => task.status === status)
      .sort((a, b) => {
        // Sort by due date within each column
        if (a.due_date && b.due_date) {
          return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
        }
        if (a.due_date) return -1;
        if (b.due_date) return 1;
        return 0;
      });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setSheetOpen(true);
  };

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    return employees.find(e => e.id === assignedTo)?.full_name || 'Unknown';
  };

  // Get list of assignees for filter (team members for team leads, all employees otherwise)
  const assigneeOptions = canViewTeamData ? teamMembers : employees;

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];
    const destinationIndex = result.destination.index;
    
    // Update the task status
    await updateTaskStatus.mutateAsync({ id: taskId, status: newStatus });
    
    // Refetch to get updated data
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

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Tasks</h1>
            <p className="text-muted-foreground">Manage and track your assigned tasks</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('kanban')}
            >
              Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <FolderKanban className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {roadmaps.map(r => (
                    <SelectItem key={r.id} value={r.id}>{r.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Assignee Filter */}
              <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                <SelectTrigger className="w-[200px]">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">
                      {assigneeFilter === 'all' 
                        ? 'All Assignees' 
                        : getAssigneeName(assigneeFilter)}
                    </span>
                  </div>
                </SelectTrigger>
                <SelectContent className="w-[250px]">
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <span>All Assignees</span>
                    </div>
                  </SelectItem>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {(emp.full_name || emp.email || 'U').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm">{emp.full_name || 'Unknown'}</span>
                          {emp.email && emp.full_name && (
                            <span className="text-xs text-muted-foreground">{emp.email}</span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[220px] justify-start text-left font-normal">
                    <CalendarRange className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd')} - {format(dateRange.to, 'LLL dd')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Due date range</span>
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
              {stages.map((stage) => (
                <div key={stage.id} className="space-y-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: `${stage.color}20` }}>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <span className="font-medium text-sm">{stage.name}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {getTasksByStatus(stage.id).length}
                    </Badge>
                  </div>
                  
                  <Droppable droppableId={stage.id}>
                    {(provided, snapshot) => (
                      <ScrollArea 
                        className={`h-[calc(100vh-350px)] rounded-lg p-2 transition-colors ${
                          snapshot.isDraggingOver ? 'bg-muted/50' : 'bg-muted/20'
                        }`}
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        <div className="space-y-2">
                          {getTasksByStatus(stage.id).map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                  onClick={() => handleTaskClick(task)}
                                >
                                  <CardContent className="p-3">
                                    <div className="flex items-start gap-2">
                                      <div {...provided.dragHandleProps} className="mt-1">
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
                                          <div className="flex items-center gap-1 mt-1">
                                            <FolderKanban className="h-3 w-3 text-muted-foreground" />
                                            <span className="text-xs text-muted-foreground truncate">
                                              {getProjectName((task as any).roadmap_id)}
                                            </span>
                                          </div>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`text-xs ${priorityColors[task.priority]}`}>
                                              {task.priority}
                                            </Badge>
                                            {task.due_date && (
                                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(task.due_date), 'MMM d')}
                                              </span>
                                            )}
                                          </div>
                                          {task.assigned_to && (
                                            <Avatar className="h-6 w-6">
                                              <AvatarFallback className="text-[10px]">
                                                {getAssigneeName(task.assigned_to).slice(0, 2).toUpperCase()}
                                              </AvatarFallback>
                                            </Avatar>
                                          )}
                                        </div>
                                        {task.estimated_hours && (
                                          <p className="text-xs text-muted-foreground mt-1">
                                            Est: {Math.floor(task.estimated_hours)}h
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
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
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {sortedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="line-clamp-1">{task.description}</span>
                        {getProjectName((task as any).roadmap_id) && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <FolderKanban className="h-3 w-3" />
                              {getProjectName((task as any).roadmap_id)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {task.estimated_hours && (
                        <span className="text-sm text-muted-foreground">
                          {Math.floor(task.estimated_hours)}h
                        </span>
                      )}
                      {task.due_date && (
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(task.due_date), 'MMM d, yyyy')}
                        </span>
                      )}
                      <Badge variant="outline" className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>
                      <Badge 
                        style={{ 
                          backgroundColor: stages.find(s => s.id === task.status)?.color || '#64748b',
                          color: 'white'
                        }}
                      >
                        {(task.status || 'todo').replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
                {sortedTasks.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Task Detail Sheet */}
        <EnhancedTaskDetailSheet
          task={selectedTask}
          open={sheetOpen}
          onOpenChange={(open) => {
            setSheetOpen(open);
            if (!open) {
              refetch();
            }
          }}
          onTaskUpdate={() => refetch()}
        />

        {/* Create Task Dialog */}
        <CreateTaskDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={() => refetch()}
        />
      </div>
    </EmployeeLayout>
  );
}
