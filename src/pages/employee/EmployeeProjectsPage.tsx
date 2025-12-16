import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { TaskDetailDialog } from '@/components/employee/TaskDetailDialog';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useMilestones } from '@/hooks/useMilestones';
import { useTasks, Task } from '@/hooks/useTasks';
import { FolderKanban, Target, CheckCircle, Clock, Calendar, ArrowRight, ListTodo } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeeProjectsPage() {
  const navigate = useNavigate();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: milestones = [] } = useMilestones();
  const { data: tasks = [] } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // For now, show all roadmaps as projects - in production, filter by assigned employee
  const activeProjects = roadmaps.filter(r => r.status === 'active');
  const completedProjects = roadmaps.filter(r => r.status === 'completed');

  const getProjectProgress = (projectId: string) => {
    // Calculate based on tasks associated with project
    const projectTasks = tasks.filter((t: any) => t.roadmap_id === projectId);
    if (projectTasks.length === 0) {
      // Fallback to milestones
      const projectMilestones = milestones.filter(m => m.roadmap_id === projectId);
      if (projectMilestones.length === 0) return 0;
      const completed = projectMilestones.filter(m => m.status === 'completed').length;
      return Math.round((completed / projectMilestones.length) * 100);
    }
    const completed = projectTasks.filter(t => t.status === 'done').length;
    return Math.round((completed / projectTasks.length) * 100);
  };

  const getProjectTasks = (projectId: string) => {
    return tasks.filter((t: any) => t.roadmap_id === projectId).slice(0, 5);
  };

  const getProjectTaskCounts = (projectId: string) => {
    const projectTasks = tasks.filter((t: any) => t.roadmap_id === projectId);
    return {
      total: projectTasks.length,
      done: projectTasks.filter(t => t.status === 'done').length,
      inProgress: projectTasks.filter(t => t.status === 'in_progress').length,
      todo: projectTasks.filter(t => t.status === 'todo').length,
    };
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className="text-muted-foreground">Track your assigned projects and milestones</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/employee/tasks')}>
            <ListTodo className="h-4 w-4 mr-2" />
            View All Tasks
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{roadmaps.length}</p>
                  <p className="text-xs text-blue-600">
                    {activeProjects.length} active, {completedProjects.length} done
                  </p>
                </div>
                <FolderKanban className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-2xl font-bold text-amber-600">{activeProjects.length}</p>
                  <p className="text-xs text-amber-600">Currently in progress</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tasks Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
                  <p className="text-xs text-green-600">
                    {totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% of ${totalTasks} total` : 'No tasks yet'}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Milestones</p>
                  <p className="text-2xl font-bold">{milestones.length}</p>
                  <p className="text-xs text-muted-foreground">
                    {milestones.filter(m => m.status === 'completed').length} completed
                  </p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Projects */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          {activeProjects.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No active projects assigned to you
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeProjects.map((project) => {
                const progress = getProjectProgress(project.id);
                const projectTasks = getProjectTasks(project.id);
                const taskCounts = getProjectTaskCounts(project.id);
                
                return (
                  <Card key={project.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{project.title}</CardTitle>
                          <CardDescription>{project.description}</CardDescription>
                        </div>
                        <Badge className={
                          project.status === 'active' ? 'bg-blue-500' :
                          project.status === 'completed' ? 'bg-green-500' :
                          'bg-slate-500'
                        }>
                          {project.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span className="font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>

                      {/* Task breakdown */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="p-2 rounded bg-slate-500/10">
                          <p className="font-bold text-sm">{taskCounts.todo}</p>
                          <p className="text-muted-foreground">To Do</p>
                        </div>
                        <div className="p-2 rounded bg-blue-500/10">
                          <p className="font-bold text-sm">{taskCounts.inProgress}</p>
                          <p className="text-muted-foreground">In Progress</p>
                        </div>
                        <div className="p-2 rounded bg-green-500/10">
                          <p className="font-bold text-sm">{taskCounts.done}</p>
                          <p className="text-muted-foreground">Done</p>
                        </div>
                      </div>

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {project.start_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start: {format(new Date(project.start_date), 'MMM d, yyyy')}
                          </span>
                        )}
                        {project.end_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            End: {format(new Date(project.end_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>

                      {projectTasks.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Recent Tasks</p>
                          <div className="space-y-1">
                            {projectTasks.map((task) => (
                              <div 
                                key={task.id} 
                                className="flex items-center justify-between text-sm p-2 rounded bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
                                onClick={() => handleTaskClick(task)}
                              >
                                <span className="truncate flex-1">{task.title}</span>
                                <Badge variant="outline" className="text-xs ml-2">
                                  {(task.status || 'todo').replace('_', ' ')}
                                </Badge>
                              </div>
                            ))}
                          </div>
                          {taskCounts.total > 5 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full"
                              onClick={() => navigate('/employee/tasks')}
                            >
                              View all {taskCounts.total} tasks
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Completed Projects */}
        {completedProjects.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Completed Projects</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedProjects.map((project) => (
                <Card key={project.id} className="opacity-80">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{project.title}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <Badge className="bg-green-500">Completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Project completed successfully</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Dialog */}
      <TaskDetailDialog
        task={selectedTask}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </EmployeeLayout>
  );
}
