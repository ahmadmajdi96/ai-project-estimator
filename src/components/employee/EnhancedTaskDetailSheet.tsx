import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { 
  MessageSquare, Paperclip, Send, Trash2, Download, Clock, User, 
  Calendar, FileText, Image, File, Tag, Flag, Folder, 
  ChevronRight, MoreHorizontal, CheckCircle2, Circle, AlertCircle,
  Timer, ArrowRight, X, Plus, Edit2
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Task, useUpdateTask } from '@/hooks/useTasks';
import { useTaskStages } from '@/hooks/useTaskStages';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useEmployees } from '@/hooks/useEmployees';
import { 
  useTaskComments, useAddTaskComment, useDeleteTaskComment,
  useTaskAttachments, useAddTaskAttachment, useDeleteTaskAttachment 
} from '@/hooks/useEmployeeDashboard';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface EnhancedTaskDetailSheetProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdate?: () => void;
}

const priorityConfig = {
  low: { color: 'text-slate-500 bg-slate-500/10', icon: Flag, label: 'Low' },
  medium: { color: 'text-blue-500 bg-blue-500/10', icon: Flag, label: 'Medium' },
  high: { color: 'text-orange-500 bg-orange-500/10', icon: Flag, label: 'High' },
  critical: { color: 'text-red-500 bg-red-500/10', icon: AlertCircle, label: 'Critical' },
};

const statusConfig = {
  todo: { color: 'bg-slate-500', icon: Circle, label: 'To Do' },
  in_progress: { color: 'bg-blue-500', icon: Timer, label: 'In Progress' },
  review: { color: 'bg-purple-500', icon: CheckCircle2, label: 'Review' },
  done: { color: 'bg-green-500', icon: CheckCircle2, label: 'Done' },
  blocked: { color: 'bg-red-500', icon: AlertCircle, label: 'Blocked' },
};

export function EnhancedTaskDetailSheet({ task, open, onOpenChange, onTaskUpdate }: EnhancedTaskDetailSheetProps) {
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState<string>('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  
  const { data: stages = [] } = useTaskStages();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: employees = [] } = useEmployees();
  const { data: comments = [], refetch: refetchComments } = useTaskComments(task?.id || '');
  const { data: attachments = [] } = useTaskAttachments(task?.id || '');
  
  const updateTask = useUpdateTask();
  const addComment = useAddTaskComment();
  const deleteComment = useDeleteTaskComment();
  const addAttachment = useAddTaskAttachment();
  const deleteAttachment = useDeleteTaskAttachment();

  useEffect(() => {
    if (task) {
      setLocalStatus(task.status);
      setEditedDescription(task.description || '');
    }
  }, [task]);

  if (!task) return null;

  const handleStatusChange = async (newStatus: string) => {
    setLocalStatus(newStatus);
    await updateTask.mutateAsync({ id: task.id, status: newStatus as Task['status'] });
    onTaskUpdate?.();
  };

  const handlePriorityChange = async (newPriority: string) => {
    await updateTask.mutateAsync({ id: task.id, priority: newPriority as Task['priority'] });
    onTaskUpdate?.();
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    await updateTask.mutateAsync({ id: task.id, assigned_to: assigneeId === 'unassigned' ? null : assigneeId });
    onTaskUpdate?.();
  };

  const handleDescriptionSave = async () => {
    await updateTask.mutateAsync({ id: task.id, description: editedDescription });
    setIsEditingDescription(false);
    onTaskUpdate?.();
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    await addComment.mutateAsync({
      task_id: task.id,
      content: newComment,
      user_id: user?.id,
    });
    setNewComment('');
    refetchComments();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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

  const getProjectName = (roadmapId: string | null) => {
    if (!roadmapId) return null;
    return roadmaps.find(r => r.id === roadmapId)?.title || null;
  };

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo) return 'Unassigned';
    return employees.find(e => e.id === assignedTo)?.full_name || 'Unknown';
  };

  const StatusIcon = statusConfig[localStatus as keyof typeof statusConfig]?.icon || Circle;
  const PriorityIcon = priorityConfig[task.priority]?.icon || Flag;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {getProjectName((task as any).roadmap_id) && (
                <>
                  <Folder className="h-4 w-4" />
                  <span>{getProjectName((task as any).roadmap_id)}</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              <span className="font-mono">#{task.id.slice(-6).toUpperCase()}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <SheetHeader>
            <SheetTitle className="text-xl font-semibold text-left">{task.title}</SheetTitle>
          </SheetHeader>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Status Bar */}
                <div className="flex items-center gap-3 flex-wrap">
                  <Select value={localStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className="w-[140px] h-8">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", statusConfig[localStatus as keyof typeof statusConfig]?.color)} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", config.color)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={task.priority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className="w-[120px] h-8">
                      <div className="flex items-center gap-2">
                        <PriorityIcon className={cn("h-3 w-3", priorityConfig[task.priority].color.split(' ')[0])} />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <config.icon className={cn("h-3 w-3", config.color.split(' ')[0])} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {task.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                    {!isEditingDescription && (
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)}>
                        <Edit2 className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                  {isEditingDescription ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows={4}
                        placeholder="Add a description..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleDescriptionSave}>Save</Button>
                        <Button size="sm" variant="outline" onClick={() => setIsEditingDescription(false)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <Card className="bg-muted/30">
                      <CardContent className="p-4">
                        <p className="text-sm whitespace-pre-wrap">
                          {task.description || 'No description provided. Click edit to add one.'}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Attachments */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Paperclip className="h-4 w-4" />
                      Attachments ({attachments.length})
                    </h3>
                    <label>
                      <Input type="file" className="hidden" onChange={handleFileUpload} />
                      <Button variant="outline" size="sm" asChild>
                        <span className="cursor-pointer">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </span>
                      </Button>
                    </label>
                  </div>
                  {attachments.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {attachments.map((attachment) => (
                        <Card key={attachment.id} className="bg-muted/30">
                          <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 min-w-0">
                              {getFileIcon(attachment.file_type)}
                              <span className="text-sm truncate">{attachment.file_name}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                                <a href={attachment.file_url} download={attachment.file_name}>
                                  <Download className="h-3 w-3" />
                                </a>
                              </Button>
                              {attachment.uploaded_by === user?.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => deleteAttachment.mutate({ id: attachment.id, task_id: task.id })}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Activity / Comments */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Activity ({comments.length})
                  </h3>

                  {/* Comment Input */}
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {user?.email?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={2}
                        className="resize-none"
                      />
                      <Button 
                        size="sm"
                        onClick={handleAddComment} 
                        disabled={!newComment.trim() || addComment.isPending}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Comment
                      </Button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {(comment.user_id || 'A').slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium">{comment.user_id || 'Anonymous'}</span>
                              <span className="text-muted-foreground">
                                {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
                              </span>
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
                          <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* Side Panel */}
          <div className="w-[240px] border-l bg-muted/20 p-4 space-y-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Assignee */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Assignee</label>
                <Select 
                  value={task.assigned_to || 'unassigned'} 
                  onValueChange={handleAssigneeChange}
                >
                  <SelectTrigger className="h-9">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarFallback className="text-[10px]">
                          {getAssigneeName(task.assigned_to).slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate text-sm">{getAssigneeName(task.assigned_to)}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.full_name || emp.email || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Due Date</label>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : 'Not set'}</span>
                </div>
              </div>

              {/* Time Tracking */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Time Tracking</label>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Estimated</span>
                    <span>{task.estimated_hours ? `${Math.floor(task.estimated_hours)}h` : '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Logged</span>
                    <span>{task.actual_hours ? `${Math.floor(task.actual_hours)}h` : '-'}</span>
                  </div>
                </div>
              </div>

              {/* Created */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Created</label>
                <div className="text-sm">
                  {formatDistanceToNow(parseISO(task.created_at), { addSuffix: true })}
                </div>
              </div>

              {/* Updated */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground uppercase">Updated</label>
                <div className="text-sm">
                  {formatDistanceToNow(parseISO(task.updated_at), { addSuffix: true })}
                </div>
              </div>

              {/* Pipeline Stages */}
              {stages.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase">Pipeline Stage</label>
                  <div className="space-y-1">
                    {stages.map((stage) => (
                      <Button
                        key={stage.id}
                        size="sm"
                        variant={(task as any).stage_id === stage.id ? 'default' : 'ghost'}
                        className="w-full justify-start h-8 text-xs"
                        onClick={() => updateTask.mutateAsync({ id: task.id, stage_id: stage.id } as any).then(() => onTaskUpdate?.())}
                      >
                        <div 
                          className="w-2 h-2 rounded-full mr-2" 
                          style={{ backgroundColor: stage.color }}
                        />
                        {stage.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
