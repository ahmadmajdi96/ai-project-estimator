import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, CheckCircle, XCircle, AlertCircle, Send, 
  Calendar, Clock, User, Building, Flag, Paperclip
} from 'lucide-react';
import { format } from 'date-fns';
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
  low: { color: 'bg-slate-500', label: 'Low' },
  medium: { color: 'bg-blue-500', label: 'Medium' },
  high: { color: 'bg-orange-500', label: 'High' },
  critical: { color: 'bg-red-500', label: 'Critical' },
};

const statusConfig = {
  todo: { color: 'bg-slate-500', label: 'To Do' },
  in_progress: { color: 'bg-blue-500', label: 'In Progress' },
  review: { color: 'bg-purple-500', label: 'Review' },
  done: { color: 'bg-green-500', label: 'Done' },
  blocked: { color: 'bg-red-500', label: 'Blocked' },
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
      case 'approval': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejection': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'request_changes': return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default: return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">{task.title}</DialogTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className={`${priorityConfig[task.priority]?.color} text-white`}>
                  {priorityConfig[task.priority]?.label}
                </Badge>
                <Badge className={`${statusConfig[taskStatus]?.color} text-white`}>
                  {statusConfig[taskStatus]?.label}
                </Badge>
                {(task as any).requires_approval && (
                  <Badge className={`${approvalStatusConfig[approvalStatus]?.color} text-white`}>
                    {approvalStatusConfig[approvalStatus]?.label}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback">
              Feedback ({feedback.length})
            </TabsTrigger>
            <TabsTrigger value="approval">Approval</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">
                      {task.description || 'No description provided'}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={taskStatus} onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Assigned To</p>
                          <p className="font-medium">
                            {assignedEmployee?.position || 'Unassigned'}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Department</p>
                          <p className="font-medium">
                            {task.departments?.name || 'No Department'}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="font-medium">
                            {task.due_date ? format(new Date(task.due_date), 'PPP') : 'Not set'}
                          </p>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-xs text-muted-foreground">Created</p>
                          <p className="font-medium">
                            {format(new Date(task.created_at), 'PPP')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {task.tags && task.tags.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Tags</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {task.tags.map((tag, i) => (
                          <Badge key={i} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="mt-4">
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-3">
                {feedback.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No feedback yet. Be the first to add feedback!
                  </div>
                ) : (
                  feedback.map((item) => (
                    <Card key={item.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getFeedbackIcon(item.feedback_type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm capitalize">
                                {item.feedback_type.replace('_', ' ')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(item.created_at), 'PPp')}
                              </span>
                            </div>
                            <p className="text-sm">{item.content}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Textarea
                placeholder="Add feedback or comment..."
                value={newFeedback}
                onChange={(e) => setNewFeedback(e.target.value)}
                rows={2}
                className="flex-1"
              />
              <Button 
                onClick={handleAddFeedback} 
                disabled={!newFeedback.trim() || addFeedback.isPending}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="approval" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Task Approval
                  {(task as any).requires_approval && (
                    <Badge className={`${approvalStatusConfig[approvalStatus]?.color} text-white`}>
                      {approvalStatusConfig[approvalStatus]?.label}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Add a comment for your approval decision..."
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-3">
                  <Button 
                    onClick={handleApprove}
                    className="bg-green-600 hover:bg-green-700"
                    disabled={approveTask.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button 
                    onClick={handleRequestChanges}
                    variant="outline"
                    disabled={!approvalComment.trim() || requestChanges.isPending}
                  >
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Request Changes
                  </Button>
                  <Button 
                    onClick={handleReject}
                    variant="destructive"
                    disabled={!approvalComment.trim() || rejectTask.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
