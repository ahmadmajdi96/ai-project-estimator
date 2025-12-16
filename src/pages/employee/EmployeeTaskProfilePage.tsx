import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  MessageSquare, Paperclip, Send, Trash2, Download, Clock, 
  Calendar, FileText, Image, File, Tag, Flag, Folder, 
  ArrowLeft, Plus, Edit3, Check, User, AlertCircle, Play, 
  CheckCircle, Pause, Link2, Activity, History
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { useTasks, Task, useUpdateTask } from '@/hooks/useTasks';
import { useTaskStages } from '@/hooks/useTaskStages';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useEmployees } from '@/hooks/useEmployees';
import { 
  useTaskComments, useAddTaskComment, useDeleteTaskComment,
  useTaskAttachments, useAddTaskAttachment, useDeleteTaskAttachment 
} from '@/hooks/useEmployeeDashboard';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

const priorityConfig = {
  low: { color: 'bg-slate-100 text-slate-700 border-slate-200', dotColor: 'bg-slate-400', label: 'Low' },
  medium: { color: 'bg-blue-50 text-blue-700 border-blue-200', dotColor: 'bg-blue-500', label: 'Medium' },
  high: { color: 'bg-amber-50 text-amber-700 border-amber-200', dotColor: 'bg-amber-500', label: 'High' },
  critical: { color: 'bg-red-50 text-red-700 border-red-200', dotColor: 'bg-red-500', label: 'Critical' },
};

const statusConfig = {
  todo: { color: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-400', icon: AlertCircle, label: 'To Do' },
  in_progress: { color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500', icon: Play, label: 'In Progress' },
  review: { color: 'bg-purple-100 text-purple-700', dotColor: 'bg-purple-500', icon: Pause, label: 'Review' },
  done: { color: 'bg-emerald-100 text-emerald-700', dotColor: 'bg-emerald-500', icon: CheckCircle, label: 'Done' },
  blocked: { color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500', icon: AlertCircle, label: 'Blocked' },
};

export default function EmployeeTaskProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [newComment, setNewComment] = useState('');
  const [localStatus, setLocalStatus] = useState<string>('');
  const [localPriority, setLocalPriority] = useState<string>('');
  const [localAssignee, setLocalAssignee] = useState<string>('');
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'comment' | 'attachment'; id: string } | null>(null);
  
  const { data: tasks = [], refetch: refetchTasks, isLoading: isLoadingTasks } = useTasks();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: employees = [] } = useEmployees();
  const { data: comments = [], refetch: refetchComments } = useTaskComments(id || '');
  const { data: attachments = [], refetch: refetchAttachments } = useTaskAttachments(id || '');
  
  const updateTask = useUpdateTask();
  const addComment = useAddTaskComment();
  const deleteComment = useDeleteTaskComment();
  const addAttachment = useAddTaskAttachment();
  const deleteAttachment = useDeleteTaskAttachment();

  const task = tasks.find(t => t.id === id);

  useEffect(() => {
    if (task) {
      setLocalStatus(task.status);
      setLocalPriority(task.priority);
      setLocalAssignee(task.assigned_to || 'unassigned');
      setEditedDescription(task.description || '');
    }
  }, [task]);

  if (isLoadingTasks) {
    return (
      <EmployeeLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-40" />
              <Skeleton className="h-60" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </EmployeeLayout>
    );
  }

  if (!task) {
    return (
      <EmployeeLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-semibold mb-2">Task not found</h2>
          <p className="text-muted-foreground mb-4">The task you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/employee/tasks')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </Button>
        </div>
      </EmployeeLayout>
    );
  }

  const handleStatusChange = async (newStatus: string) => {
    setLocalStatus(newStatus);
    try {
      await updateTask.mutateAsync({ id: task.id, status: newStatus as Task['status'] });
      toast.success('Status updated', { description: `Task moved to ${statusConfig[newStatus as keyof typeof statusConfig]?.label}` });
      refetchTasks();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setLocalPriority(newPriority);
    try {
      await updateTask.mutateAsync({ id: task.id, priority: newPriority as Task['priority'] });
      toast.success('Priority updated');
      refetchTasks();
    } catch {
      toast.error('Failed to update priority');
    }
  };

  const handleAssigneeChange = async (assigneeId: string) => {
    setLocalAssignee(assigneeId);
    try {
      await updateTask.mutateAsync({ id: task.id, assigned_to: assigneeId === 'unassigned' ? null : assigneeId });
      const assigneeName = assigneeId === 'unassigned' ? 'Unassigned' : getAssigneeName(assigneeId);
      toast.success('Assignee updated', { description: `Task assigned to ${assigneeName}` });
      refetchTasks();
    } catch {
      toast.error('Failed to update assignee');
    }
  };

  const handleDescriptionSave = async () => {
    try {
      await updateTask.mutateAsync({ id: task.id, description: editedDescription });
      setIsEditingDescription(false);
      toast.success('Description saved');
      refetchTasks();
    } catch {
      toast.error('Failed to save description');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      await addComment.mutateAsync({
        task_id: task.id,
        content: newComment,
        user_id: user?.id,
      });
      setNewComment('');
      refetchComments();
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      if (itemToDelete.type === 'comment') {
        await deleteComment.mutateAsync({ id: itemToDelete.id, task_id: task.id });
        toast.success('Comment deleted');
        refetchComments();
      } else {
        await deleteAttachment.mutateAsync({ id: itemToDelete.id, task_id: task.id });
        toast.success('Attachment deleted');
        refetchAttachments();
      }
    } catch {
      toast.error(`Failed to delete ${itemToDelete.type}`);
    }
    
    setDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const fileUrl = URL.createObjectURL(file);
      await addAttachment.mutateAsync({
        task_id: task.id,
        file_name: file.name,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: user?.id,
      });
      toast.success('File uploaded', { description: file.name });
      refetchAttachments();
    } catch {
      toast.error('Failed to upload file');
    }
  };

  const copyTaskLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/employee/tasks/${task.id}`);
    toast.success('Link copied to clipboard');
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return <File className="h-5 w-5 text-muted-foreground" />;
    if (fileType.startsWith('image/')) return <Image className="h-5 w-5 text-blue-500" />;
    if (fileType.includes('pdf')) return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-muted-foreground" />;
  };

  const getProjectName = (roadmapId: string | null) => {
    if (!roadmapId) return null;
    return roadmaps.find(r => r.id === roadmapId)?.title || null;
  };

  const getAssigneeName = (assignedTo: string | null) => {
    if (!assignedTo || assignedTo === 'unassigned') return 'Unassigned';
    return employees.find(e => e.id === assignedTo)?.full_name || 'Unknown';
  };

  const getAssigneeInitials = (assignedTo: string | null) => {
    const name = getAssigneeName(assignedTo);
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const taskId = task.id.slice(-6).toUpperCase();
  const projectName = getProjectName((task as any).roadmap_id);

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/employee/tasks')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                {projectName && (
                  <>
                    <Folder className="h-4 w-4" />
                    <span>{projectName}</span>
                    <span>/</span>
                  </>
                )}
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">#{taskId}</span>
              </div>
              <h1 className="text-2xl font-bold">{task.title}</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={copyTaskLink}>
            <Link2 className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Bar */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Select value={localStatus} onValueChange={handleStatusChange}>
                    <SelectTrigger className={cn(
                      "w-auto h-9 gap-2 border-0 font-medium",
                      statusConfig[localStatus as keyof typeof statusConfig]?.color
                    )}>
                      <div className={cn("w-2 h-2 rounded-full", statusConfig[localStatus as keyof typeof statusConfig]?.dotColor)} />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={localPriority} onValueChange={handlePriorityChange}>
                    <SelectTrigger className={cn(
                      "w-auto h-9 gap-2 border font-medium",
                      priorityConfig[localPriority as keyof typeof priorityConfig]?.color
                    )}>
                      <Flag className="h-3.5 w-3.5" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityConfig).map(([value, config]) => (
                        <SelectItem key={value} value={value}>
                          <div className="flex items-center gap-2">
                            <div className={cn("w-2 h-2 rounded-full", config.dotColor)} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {task.tags && task.tags.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      {task.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start h-11 p-1 bg-muted/50">
                <TabsTrigger value="description" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Description
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Comments
                  {comments.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {comments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="attachments" className="gap-2">
                  <Paperclip className="h-4 w-4" />
                  Files
                  {attachments.length > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                      {attachments.length}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="activity" className="gap-2">
                  <Activity className="h-4 w-4" />
                  Activity
                </TabsTrigger>
              </TabsList>

              {/* Description Tab */}
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Description</CardTitle>
                      {!isEditingDescription && (
                        <Button variant="ghost" size="sm" onClick={() => setIsEditingDescription(true)}>
                          <Edit3 className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditingDescription ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editedDescription}
                          onChange={(e) => setEditedDescription(e.target.value)}
                          rows={8}
                          placeholder="Add a description..."
                          className="resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleDescriptionSave} disabled={updateTask.isPending}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => {
                            setIsEditingDescription(false);
                            setEditedDescription(task.description || '');
                          }}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed min-h-[100px]">
                        {task.description || 'No description provided. Click edit to add one.'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Comments Tab */}
              <TabsContent value="comments" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Add Comment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-3">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="text-xs bg-primary/10 text-primary">
                          {user?.email?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          rows={3}
                          className="resize-none"
                        />
                        <Button 
                          size="sm"
                          onClick={handleAddComment} 
                          disabled={!newComment.trim() || addComment.isPending}
                        >
                          <Send className="h-4 w-4 mr-1.5" />
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {comments.length > 0 ? (
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      {comments.map((comment, idx) => (
                        <div key={comment.id}>
                          {idx > 0 && <Separator className="my-4" />}
                          <div className="flex gap-3 group">
                            <Avatar className="h-9 w-9 shrink-0">
                              <AvatarFallback className="text-xs bg-muted">
                                {(comment.user_id || 'A').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{comment.user_id?.slice(0, 8) || 'Anonymous'}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })}
                                  </span>
                                </div>
                                {comment.user_id === user?.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => {
                                      setItemToDelete({ type: 'comment', id: comment.id });
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm mt-1 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
                      <p className="text-sm font-medium">No comments yet</p>
                      <p className="text-xs mt-1">Be the first to add a comment</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Attachments Tab */}
              <TabsContent value="attachments" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">Files ({attachments.length})</CardTitle>
                      <label>
                        <Input type="file" className="hidden" onChange={handleFileUpload} />
                        <Button variant="outline" size="sm" asChild>
                          <span className="cursor-pointer">
                            <Plus className="h-4 w-4 mr-1.5" />
                            Upload File
                          </span>
                        </Button>
                      </label>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {attachments.length > 0 ? (
                      <div className="space-y-2">
                        {attachments.map((attachment) => (
                          <div 
                            key={attachment.id} 
                            className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors group"
                          >
                            <div className="p-2 rounded-lg bg-muted">
                              {getFileIcon(attachment.file_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{attachment.file_name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(attachment.file_size)}
                              </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                <a href={attachment.file_url} download={attachment.file_name}>
                                  <Download className="h-4 w-4" />
                                </a>
                              </Button>
                              {attachment.uploaded_by === user?.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive"
                                  onClick={() => {
                                    setItemToDelete({ type: 'attachment', id: attachment.id });
                                    setDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                        <Paperclip className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="text-sm font-medium">No files attached</p>
                        <p className="text-xs mt-1">Upload files to share with your team</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="mt-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Activity Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                        <div>
                          <p className="text-sm">Task created</p>
                          <p className="text-xs text-muted-foreground">
                            {format(parseISO(task.created_at), 'MMM d, yyyy \'at\' h:mm a')}
                          </p>
                        </div>
                      </div>
                      {task.updated_at !== task.created_at && (
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2" />
                          <div>
                            <p className="text-sm">Task updated</p>
                            <p className="text-xs text-muted-foreground">
                              {format(parseISO(task.updated_at), 'MMM d, yyyy \'at\' h:mm a')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assignee */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assignee</label>
                  <Select value={localAssignee} onValueChange={handleAssigneeChange}>
                    <SelectTrigger className="h-10">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                            {getAssigneeInitials(localAssignee)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="truncate">{getAssigneeName(localAssignee)}</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[10px]">
                              <User className="h-3 w-3" />
                            </AvatarFallback>
                          </Avatar>
                          Unassigned
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
                            {emp.full_name || emp.email || 'Unknown'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Due Date */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Due Date</label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/30">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {task.due_date ? format(parseISO(task.due_date), 'MMM d, yyyy') : 'No due date'}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Estimated Hours */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Estimate</label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/30">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {task.estimated_hours ? `${Math.floor(task.estimated_hours)} hours` : 'Not estimated'}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Created */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Created</label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/30">
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(parseISO(task.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Project */}
                {projectName && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project</label>
                      <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/30">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm truncate">{projectName}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the {itemToDelete?.type}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </EmployeeLayout>
  );
}
