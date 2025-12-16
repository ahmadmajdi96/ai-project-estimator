import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  EmployeeTicket,
  useTicketComments,
  useAddTicketComment,
  useEscalateTicket,
} from '@/hooks/useEmployeeTickets';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Ticket,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  ArrowUpCircle,
  AlertTriangle,
  Calendar,
  Tag,
  User,
  Send,
  History,
  FileText,
  Link as LinkIcon,
} from 'lucide-react';

interface TicketDetailSheetProps {
  ticket: EmployeeTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ticketCategories = [
  { value: 'it_support', label: 'IT Support' },
  { value: 'hr_inquiry', label: 'HR Inquiry' },
  { value: 'facilities', label: 'Facilities' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'benefits', label: 'Benefits' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'suggestion', label: 'Suggestion' },
  { value: 'other', label: 'Other' },
];

const priorityConfig = {
  low: { color: 'bg-slate-500', label: 'Low', textColor: 'text-slate-600' },
  medium: { color: 'bg-blue-500', label: 'Medium', textColor: 'text-blue-600' },
  high: { color: 'bg-orange-500', label: 'High', textColor: 'text-orange-600' },
  urgent: { color: 'bg-red-500', label: 'Urgent', textColor: 'text-red-600' },
};

const statusConfig = {
  open: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', borderColor: 'border-blue-500', label: 'Open' },
  in_progress: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', borderColor: 'border-amber-500', label: 'In Progress' },
  pending: { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10', borderColor: 'border-purple-500', label: 'Pending' },
  resolved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', borderColor: 'border-green-500', label: 'Resolved' },
  closed: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10', borderColor: 'border-slate-500', label: 'Closed' },
};

export function TicketDetailSheet({ ticket, open, onOpenChange }: TicketDetailSheetProps) {
  const [newComment, setNewComment] = useState('');
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');

  const { data: comments = [] } = useTicketComments(ticket?.id || '');
  const addComment = useAddTicketComment();
  const escalateTicket = useEscalateTicket();

  if (!ticket) return null;

  const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const StatusIcon = status.icon;

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment.mutate({
      ticket_id: ticket.id,
      content: newComment,
      user_id: null,
      is_internal: false,
    });
    setNewComment('');
  };

  const handleEscalate = () => {
    if (!escalationReason.trim()) return;
    escalateTicket.mutate({ id: ticket.id, reason: escalationReason });
    setEscalationReason('');
    setEscalateDialogOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="font-mono text-xs">
                    {ticket.ticket_number}
                  </Badge>
                  <Badge className={`${status.bg} ${status.color} border ${status.borderColor}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  {ticket.is_escalated && (
                    <Badge variant="destructive">
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                      Escalated
                    </Badge>
                  )}
                </div>
                <h2 className="text-2xl font-bold">{ticket.subject}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Created {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    {ticketCategories.find(c => c.value === ticket.category)?.label}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge className={`${priority.color} text-white`}>{priority.label}</Badge>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Tabs defaultValue="details" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="comments" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({comments.length})
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2">
                    <History className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <div className="p-4 rounded-lg border bg-card min-h-[120px]">
                      {ticket.description || (
                        <span className="text-muted-foreground italic">No description provided</span>
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <div className={`flex items-center gap-2 mt-1 p-2 rounded-lg ${status.bg}`}>
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                          <span className="font-medium">{status.label}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Priority</Label>
                        <div className="mt-1">
                          <Badge className={`${priority.color} text-white`}>{priority.label}</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Category</Label>
                        <p className="mt-1 font-medium">
                          {ticketCategories.find(c => c.value === ticket.category)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Created</Label>
                        <p className="mt-1 font-medium">{format(new Date(ticket.created_at), 'PPpp')}</p>
                      </div>
                      {ticket.due_date && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Due Date</Label>
                          <p className="mt-1 font-medium">{format(new Date(ticket.due_date), 'PPP')}</p>
                        </div>
                      )}
                      {ticket.assigned_to && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Assigned To</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">Support Agent</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  {ticket.tags && ticket.tags.length > 0 && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {ticket.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Escalation Info */}
                  {ticket.is_escalated && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        Ticket Escalated
                      </div>
                      {ticket.escalation_reason && (
                        <p className="text-sm">{ticket.escalation_reason}</p>
                      )}
                      {ticket.escalated_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Escalated on {format(new Date(ticket.escalated_at), 'PPpp')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Resolution */}
                  {ticket.resolution && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                        <CheckCircle className="h-5 w-5" />
                        Resolution
                      </div>
                      <p className="text-sm">{ticket.resolution}</p>
                      {ticket.resolved_at && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Resolved on {format(new Date(ticket.resolved_at), 'PPpp')}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments" className="space-y-4">
                  <div className="space-y-4">
                    {comments.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No comments yet. Be the first to add one!</p>
                      </div>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">You</span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm mt-1 p-3 rounded-lg bg-muted">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Add Comment */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="min-h-[80px] resize-none"
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

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Ticket className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Ticket Created</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(ticket.created_at), 'PPpp')}
                        </p>
                      </div>
                    </div>
                    {ticket.first_response_at && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <MessageSquare className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">First Response</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ticket.first_response_at), 'PPpp')}
                          </p>
                        </div>
                      </div>
                    )}
                    {ticket.is_escalated && ticket.escalated_at && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                          <ArrowUpCircle className="h-4 w-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ticket Escalated</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ticket.escalated_at), 'PPpp')}
                          </p>
                        </div>
                      </div>
                    )}
                    {ticket.resolved_at && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Ticket Resolved</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(ticket.resolved_at), 'PPpp')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Actions Footer */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              {ticket.status !== 'resolved' && ticket.status !== 'closed' && !ticket.is_escalated && (
                <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="text-orange-600 border-orange-300">
                      <ArrowUpCircle className="h-4 w-4 mr-2" />
                      Escalate
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Escalate Ticket</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Reason for Escalation</Label>
                        <Textarea
                          value={escalationReason}
                          onChange={(e) => setEscalationReason(e.target.value)}
                          placeholder="Explain why this ticket needs escalation..."
                          rows={4}
                        />
                      </div>
                      <Button 
                        onClick={handleEscalate} 
                        className="w-full" 
                        disabled={!escalationReason.trim() || escalateTicket.isPending}
                      >
                        Escalate Ticket
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              <Button variant="outline" onClick={() => onOpenChange(false)} className="ml-auto">
                Close
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
