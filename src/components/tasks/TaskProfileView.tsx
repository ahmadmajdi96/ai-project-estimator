import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, CheckCircle, XCircle, AlertCircle, Send, 
  Calendar, Clock, User, Building, Flag, Paperclip, 
  FileText, History, Users, Activity, ChevronRight
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Task, useUpdateTask } from '@/hooks/useTasks';
import { useTaskFeedback, useAddTaskFeedback, useApproveTask, useRejectTask, useRequestTaskChanges } from '@/hooks/useTaskFeedback';
import { useEmployees } from '@/hooks/useEmployees';
import { useAuth } from '@/hooks/useAuth';

interface TaskProfileViewProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityConfig = {
  low: { color: 'bg-slate-500', label: 'Low', textColor: 'text-slate-500' },
  medium: { color: 'bg-blue-500', label: 'Medium', textColor: 'text-blue-500' },
  high: { color: 'bg-orange-500', label: 'High', textColor: 'text-orange-500' },
  critical: { color: 'bg-red-500', label: 'Critical', textColor: 'text-red-500' },
};

const statusConfig = {
  todo: { color: 'bg-slate-500', label: 'To Do', progress: 0 },
  in_progress: { color: 'bg-blue-500', label: 'In Progress', progress: 50 },
  review: { color: 'bg-purple-500', label: 'Review', progress: 75 },
  done: { color: 'bg-green-500', label: 'Done', progress: 100 },
  blocked: { color: 'bg-red-500', label: 'Blocked', progress: 25 },
};

const approvalStatusConfig = {
  pending: { color: 'bg-amber-500', label: 'Pending Approval', icon: AlertCircle },
  approved: { color: 'bg-green-500', label: 'Approved', icon: CheckCircle },
  rejected: { color: 'bg-red-500', label: 'Rejected', icon: XCircle },
  changes_requested: { color: 'bg-orange-500', label: 'Changes Requested', icon: AlertCircle },
};

export function TaskProfileView({ task, open, onOpenChange }: TaskProfileViewProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [newFeedback, setNewFeedback] = useState('');
  const [approvalComment, setApprovalComment] = useState('');
  
  const { data: feedback = [] } = useTaskFeedback(task?.id || '');
  const { data: employees = [] } = useEmployees();
  const updateTask = useUpdateTask();
  const addFeedback = useAddTaskFeedback();
  const approveTask = useApproveTask();
  const rejectTask = useRejectTask();
  const requestChanges = useRequestTaskChanges();
  
  if (!task) return null;

  const assignedEmployee = employees.find(e => e.id === task.assigned_to);
  const taskStatus = task.status || 'todo';
  const approvalStatus = (task as any).approval_status || 'pending';
  const statusInfo = statusConfig[taskStatus] || statusConfig.todo;

  const handleStatusChange = (newStatus: string) => {
    updateTask.mutate({ id: task.id, status: newStatus as Task['status'] });
  };

  const handleAddFeedback = () => {
    if (!newFeedback.trim()) return;
    addFeedback.mutate({
      task_id: task.id,
      content: newFeedback,
      user_id: user?.id,
    });
    setNewFeedback('');
  };

  const handleApprove = () => {
    approveTask.mutate({
      taskId: task.id,
      userId: user?.id,
      comment: approvalComment || 'Approved',
    });
    setApprovalComment('');
  };

  const handleReject = () => {
    if (!approvalComment.trim()) return;
    rejectTask.mutate({
      taskId: task.id,
      userId: user?.id,
      reason: approvalComment,
    });
    setApprovalComment('');
  };

  const handleRequestChanges = () => {
    if (!approvalComment.trim()) return;
    requestChanges.mutate({
      taskId: task.id,
      userId: user?.id,
      changes: approvalComment,
    });
    setApprovalComment('');
  };

  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejection': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'request_changes': return <AlertCircle className="h-5 w-5 text-orange-500" />;
      default: return <MessageSquare className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl lg:max-w-4xl p-0 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <SheetHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <SheetTitle className="text-2xl font-bold leading-tight">{task.title}</SheetTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge className={`${priorityConfig[task.priority]?.color} text-white px-3 py-1`}>
                    <Flag className="h-3 w-3 mr-1" />
                    {priorityConfig[task.priority]?.label}
                  </Badge>
                  <Badge className={`${statusInfo.color} text-white px-3 py-1`}>
                    {statusInfo.label}
                  </Badge>
                  {(task as any).requires_approval && (
                    <Badge className={`${approvalStatusConfig[approvalStatus]?.color} text-white px-3 py-1`}>
                      {approvalStatusConfig[approvalStatus]?.label}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{statusInfo.progress}%</span>
            </div>
            <Progress value={statusInfo.progress} className="h-2" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <div className="px-6 pt-4 border-b">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" className="gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Overview</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Activity</span>
                </TabsTrigger>
                <TabsTrigger value="feedback" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Feedback ({feedback.length})</span>
                </TabsTrigger>
                <TabsTrigger value="approval" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Approval</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(100vh-320px)]">
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* Quick Info Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <User className="h-5 w-5 text-blue-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Assigned To</p>
                          <p className="font-medium truncate">
                            {assignedEmployee?.position || 'Unassigned'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Building className="h-5 w-5 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-medium truncate">
                            {task.departments?.name || 'None'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Calendar className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="font-medium truncate">
                            {task.due_date ? format(new Date(task.due_date), 'MMM dd') : 'Not set'}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Clock className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="font-medium truncate">
                            {formatDistanceToNow(new Date(task.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Description */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {task.description || 'No description provided for this task.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Status Update */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Update Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Select value={taskStatus} onValueChange={handleStatusChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-slate-500" />
                              To Do
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-blue-500" />
                              In Progress
                            </div>
                          </SelectItem>
                          <SelectItem value="review">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-purple-500" />
                              Review
                            </div>
                          </SelectItem>
                          <SelectItem value="done">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500" />
                              Done
                            </div>
                          </SelectItem>
                          <SelectItem value="blocked">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-red-500" />
                              Blocked
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  {task.tags && task.tags.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Tags</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {task.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="px-3 py-1">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Activity Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full bg-primary" />
                            <div className="w-0.5 h-full bg-border" />
                          </div>
                          <div className="pb-4">
                            <p className="text-sm font-medium">Task Created</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(task.created_at), 'PPp')}
                            </p>
                          </div>
                        </div>
                        {task.due_date && (
                          <div className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-orange-500" />
                              <div className="w-0.5 h-full bg-border" />
                            </div>
                            <div className="pb-4">
                              <p className="text-sm font-medium">Due Date Set</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(task.due_date), 'PPP')}
                              </p>
                            </div>
                          </div>
                        )}
                        {feedback.map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-3 h-3 rounded-full bg-blue-500" />
                              <div className="w-0.5 h-full bg-border" />
                            </div>
                            <div className="pb-4">
                              <p className="text-sm font-medium capitalize">
                                {item.feedback_type.replace('_', ' ')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(item.created_at), 'PPp')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="feedback" className="mt-0 space-y-4">
                  <div className="space-y-3">
                    {feedback.length === 0 ? (
                      <Card>
                        <CardContent className="py-12 text-center">
                          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                          <p className="text-muted-foreground">No feedback yet.</p>
                          <p className="text-sm text-muted-foreground">Be the first to add feedback!</p>
                        </CardContent>
                      </Card>
                    ) : (
                      feedback.map((item) => (
                        <Card key={item.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {item.feedback_type.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  {getFeedbackIcon(item.feedback_type)}
                                  <span className="font-medium capitalize">
                                    {item.feedback_type.replace('_', ' ')}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{item.content}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            You
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <Textarea
                            placeholder="Add feedback or comment..."
                            value={newFeedback}
                            onChange={(e) => setNewFeedback(e.target.value)}
                            rows={3}
                          />
                          <Button 
                            onClick={handleAddFeedback} 
                            disabled={!newFeedback.trim() || addFeedback.isPending}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Send Feedback
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="approval" className="mt-0">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Task Approval
                        {(task as any).requires_approval && (
                          <Badge className={`${approvalStatusConfig[approvalStatus]?.color} text-white ml-2`}>
                            {approvalStatusConfig[approvalStatus]?.label}
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Approval Comment
                        </label>
                        <Textarea
                          placeholder="Add a comment for your approval decision..."
                          value={approvalComment}
                          onChange={(e) => setApprovalComment(e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Button 
                          onClick={handleApprove}
                          className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                          disabled={approveTask.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button 
                          onClick={handleRequestChanges}
                          variant="outline"
                          className="flex-1 sm:flex-none"
                          disabled={!approvalComment.trim() || requestChanges.isPending}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Request Changes
                        </Button>
                        <Button 
                          onClick={handleReject}
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                          disabled={!approvalComment.trim() || rejectTask.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
