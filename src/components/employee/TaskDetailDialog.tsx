import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, Paperclip, Send, Trash2, Download, Clock, User, 
  Calendar, Flag, MoveRight, FileText, Image, File
} from 'lucide-react';
import { format } from 'date-fns';
import { Task, useUpdateTask } from '@/hooks/useTasks';
import { useTaskStages, TaskStage } from '@/hooks/useTaskStages';
import { 
  useTaskComments, useAddTaskComment, useDeleteTaskComment,
  useTaskAttachments, useAddTaskAttachment, useDeleteTaskAttachment 
} from '@/hooks/useEmployeeDashboard';
import { useAuth } from '@/hooks/useAuth';

interface TaskDetailDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const priorityColors: Record<string, string> = {
  low: 'bg-slate-500',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  critical: 'bg-red-500',
};

const statusColors: Record<string, string> = {
  todo: 'bg-slate-500',
  in_progress: 'bg-blue-500',
  review: 'bg-purple-500',
  done: 'bg-green-500',
  blocked: 'bg-red-500',
};

export function TaskDetailDialog({ task, open, onOpenChange }: TaskDetailDialogProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  
  const { data: stages = [] } = useTaskStages();
  const { data: comments = [] } = useTaskComments(task?.id || '');
  const { data: attachments = [] } = useTaskAttachments(task?.id || '');
  
  const updateTask = useUpdateTask();
  const addComment = useAddTaskComment();
  const deleteComment = useDeleteTaskComment();
  const addAttachment = useAddTaskAttachment();
  const deleteAttachment = useDeleteTaskAttachment();

  if (!task) return null;

  const handleStatusChange = (newStatus: string) => {
    updateTask.mutate({ id: task.id, status: newStatus as Task['status'] });
  };

  const handleStageChange = (stageId: string) => {
    updateTask.mutate({ id: task.id, stage_id: stageId } as any);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate({
      task_id: task.id,
      content: newComment,
      user_id: user?.id,
    });
    setNewComment('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For now, we'll create a placeholder URL - in production you'd upload to storage
    const fileUrl = URL.createObjectURL(file);
    addAttachment.mutate({
      task_id: task.id,
      file_name: file.name,
      file_url: fileUrl,
      file_type: file.type,
      file_size: file.size,
      uploaded_by: user?.id,
    });
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-4 w-4" />;
    if (fileType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (fileType.includes('pdf')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="flex-1">{task.title}</span>
            <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
            <Badge className={statusColors[task.status]}>{task.status.replace('_', ' ')}</Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="comments" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({comments.length})
            </TabsTrigger>
            <TabsTrigger value="attachments" className="gap-2">
              <Paperclip className="h-4 w-4" />
              Files ({attachments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <Select value={task.status} onValueChange={handleStatusChange}>
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
              </div>

              {stages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Pipeline Stage</label>
                  <Select 
                    value={(task as any).stage_id || ''} 
                    onValueChange={handleStageChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: stage.color }}
                            />
                            {stage.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap">
                    {task.description || 'No description provided'}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due: {task.due_date ? format(new Date(task.due_date), 'PPP') : 'Not set'}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Created: {format(new Date(task.created_at), 'PPP')}</span>
              </div>
              {task.estimated_hours && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Estimated: {task.estimated_hours}h</span>
                </div>
              )}
              {task.actual_hours && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Actual: {task.actual_hours}h</span>
                </div>
              )}
            </div>

            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, i) => (
                  <Badge key={i} variant="outline">{tag}</Badge>
                ))}
              </div>
            )}

            {stages.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <MoveRight className="h-4 w-4" />
                  Move to Stage
                </label>
                <div className="flex flex-wrap gap-2">
                  {stages.map((stage) => (
                    <Button
                      key={stage.id}
                      size="sm"
                      variant={(task as any).stage_id === stage.id ? 'default' : 'outline'}
                      onClick={() => handleStageChange(stage.id)}
                      className="gap-2"
                    >
                      <div 
                        className="w-2 h-2 rounded-full" 
                        style={{ backgroundColor: stage.color }}
                      />
                      {stage.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="comments" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No comments yet</p>
                ) : (
                  comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{comment.user_id || 'Anonymous'}</span>
                            <span>•</span>
                            <span>{format(new Date(comment.created_at), 'PPp')}</span>
                          </div>
                          {comment.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => deleteComment.mutate({ id: comment.id, task_id: task.id })}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Textarea
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button 
                onClick={handleAddComment} 
                disabled={!newComment.trim() || addComment.isPending}
                className="self-end"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {attachments.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No attachments yet</p>
                ) : (
                  attachments.map((attachment) => (
                    <Card key={attachment.id}>
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFileIcon(attachment.file_type)}
                          <div>
                            <p className="text-sm font-medium">{attachment.file_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {attachment.file_size ? `${(attachment.file_size / 1024).toFixed(1)} KB` : ''}
                              {' • '}
                              {format(new Date(attachment.created_at), 'PPp')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <a href={attachment.file_url} download={attachment.file_name}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                          {attachment.uploaded_by === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteAttachment.mutate({ id: attachment.id, task_id: task.id })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>

            <div className="mt-4">
              <Input
                type="file"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
