import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { TaskDetailDialog } from '@/components/employee/TaskDetailDialog';
import { useTasks, Task, useUpdateTaskStatus } from '@/hooks/useTasks';
import { useTaskStages } from '@/hooks/useTaskStages';
import { Search, Filter, Calendar, Clock, GripVertical } from 'lucide-react';
import { format } from 'date-fns';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: tasks = [] } = useTasks();
  const { data: customStages = [] } = useTaskStages();
  const updateTaskStatus = useUpdateTaskStatus();

  // Use custom stages if defined, otherwise use default statuses
  const stages = customStages.length > 0 
    ? customStages.map(s => ({ id: s.value, name: s.name, color: s.color }))
    : defaultStatuses;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const taskId = result.draggableId;
    const newStatus = result.destination.droppableId as Task['status'];
    
    updateTaskStatus.mutate({ id: taskId, status: newStatus });
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
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[180px]">
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
                                        <div className="flex items-center gap-2 mt-2">
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
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                    </div>
                    <div className="flex items-center gap-3">
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
                {filteredTasks.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No tasks found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Task Detail Dialog */}
        <TaskDetailDialog
          task={selectedTask}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      </div>
    </EmployeeLayout>
  );
}
