import { useState } from 'react';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  useEmployeeTickets, 
  useAddEmployeeTicket, 
  useUpdateEmployeeTicket,
  useTicketComments,
  useAddTicketComment,
  useEscalateTicket,
  useResolveTicket,
  EmployeeTicket
} from '@/hooks/useEmployeeTickets';
import { 
  Plus, Search, Ticket, Clock, CheckCircle, XCircle, AlertCircle, 
  MessageSquare, Paperclip, AlertTriangle, Filter, ArrowUpCircle,
  Calendar, Tag
} from 'lucide-react';
import { format } from 'date-fns';

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
  low: { color: 'bg-slate-500', label: 'Low' },
  medium: { color: 'bg-blue-500', label: 'Medium' },
  high: { color: 'bg-orange-500', label: 'High' },
  urgent: { color: 'bg-red-500', label: 'Urgent' },
};

const statusConfig = {
  open: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Open' },
  in_progress: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'In Progress' },
  pending: { icon: Clock, color: 'text-purple-500', bg: 'bg-purple-500/10', label: 'Pending' },
  resolved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Resolved' },
  closed: { icon: XCircle, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Closed' },
};

export default function EmployeeTicketsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<EmployeeTicket | null>(null);
  const [escalateDialogOpen, setEscalateDialogOpen] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newComment, setNewComment] = useState('');
  
  const [newTicket, setNewTicket] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    attachments: [] as any[],
    tags: [] as string[],
  });

  const { data: tickets = [] } = useEmployeeTickets();
  const { data: comments = [] } = useTicketComments(selectedTicket?.id || '');
  const addTicket = useAddEmployeeTicket();
  const updateTicket = useUpdateEmployeeTicket();
  const addComment = useAddTicketComment();
  const escalateTicket = useEscalateTicket();
  const resolveTicket = useResolveTicket();

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
    const matchesSearch = searchQuery === '' || 
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const handleCreateTicket = () => {
    if (!newTicket.category || !newTicket.subject) return;
    
    addTicket.mutate({
      category: newTicket.category,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'open',
      attachments: newTicket.attachments,
      tags: newTicket.tags,
      employee_id: null,
      assigned_to: null,
      department_id: null,
      resolution: null,
      resolved_at: null,
      resolved_by: null,
      is_escalated: false,
      escalated_at: null,
      escalation_reason: null,
      due_date: null,
      sla_breach: false,
      first_response_at: null,
    });
    
    setNewTicket({
      category: '',
      subject: '',
      description: '',
      priority: 'medium',
      attachments: [],
      tags: [],
    });
    setDialogOpen(false);
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedTicket) return;
    
    addComment.mutate({
      ticket_id: selectedTicket.id,
      content: newComment,
      user_id: null,
      is_internal: false,
    });
    setNewComment('');
  };

  const handleEscalate = () => {
    if (!selectedTicket || !escalationReason.trim()) return;
    
    escalateTicket.mutate({ id: selectedTicket.id, reason: escalationReason });
    setEscalationReason('');
    setEscalateDialogOpen(false);
  };

  const openTickets = tickets.filter(t => t.status === 'open').length;
  const inProgressTickets = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;
  const escalatedTickets = tickets.filter(t => t.is_escalated).length;

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ticket className="h-8 w-8" />
              Support Tickets
            </h1>
            <p className="text-muted-foreground">Create and track support tickets</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select
                      value={newTicket.category}
                      onValueChange={(v) => setNewTicket(p => ({ ...p, category: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {ticketCategories.map(cat => (
                          <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={newTicket.priority}
                      onValueChange={(v) => setNewTicket(p => ({ ...p, priority: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Subject *</Label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(p => ({ ...p, subject: e.target.value }))}
                    placeholder="Brief summary of your issue"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(p => ({ ...p, description: e.target.value }))}
                    placeholder="Provide detailed information about your issue..."
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tags (comma-separated)</Label>
                  <Input
                    placeholder="e.g., urgent, laptop, software"
                    onChange={(e) => setNewTicket(p => ({ 
                      ...p, 
                      tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                    }))}
                  />
                </div>
                <Button 
                  onClick={handleCreateTicket} 
                  className="w-full" 
                  disabled={!newTicket.category || !newTicket.subject || addTicket.isPending}
                >
                  Create Ticket
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <AlertCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openTickets}</p>
                <p className="text-sm text-muted-foreground">Open</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressTickets}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedTickets}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{escalatedTickets}</p>
                <p className="text-sm text-muted-foreground">Escalated</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tickets List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[130px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {ticketCategories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-3">
                  {filteredTickets.map(ticket => {
                    const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
                    const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                    const StatusIcon = status.icon;
                    const isSelected = selectedTicket?.id === ticket.id;
                    
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${status.bg}`}>
                              <StatusIcon className={`h-4 w-4 ${status.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-muted-foreground">
                                  {ticket.ticket_number}
                                </span>
                                {ticket.is_escalated && (
                                  <Badge variant="destructive" className="text-xs">
                                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                                    Escalated
                                  </Badge>
                                )}
                              </div>
                              <h4 className="font-medium mt-1">{ticket.subject}</h4>
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <span>{ticketCategories.find(c => c.value === ticket.category)?.label}</span>
                                <span>•</span>
                                <span>{format(new Date(ticket.created_at), 'PPp')}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${priority.color} text-white text-xs`}>
                              {priority.label}
                            </Badge>
                          </div>
                        </div>
                        {ticket.tags && ticket.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2 flex-wrap">
                            <Tag className="h-3 w-3 text-muted-foreground" />
                            {ticket.tags.map((tag, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {filteredTickets.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No tickets found
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <span className="font-mono text-sm text-muted-foreground">
                      {selectedTicket.ticket_number}
                    </span>
                    <h3 className="font-semibold text-lg mt-1">{selectedTicket.subject}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Status</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={statusConfig[selectedTicket.status as keyof typeof statusConfig]?.color || ''}>
                          {statusConfig[selectedTicket.status as keyof typeof statusConfig]?.label || selectedTicket.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Priority</span>
                      <div className="mt-1">
                        <Badge className={`${priorityConfig[selectedTicket.priority as keyof typeof priorityConfig]?.color || 'bg-slate-500'} text-white`}>
                          {priorityConfig[selectedTicket.priority as keyof typeof priorityConfig]?.label || selectedTicket.priority}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category</span>
                      <p className="mt-1">{ticketCategories.find(c => c.value === selectedTicket.category)?.label}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Created</span>
                      <p className="mt-1">{format(new Date(selectedTicket.created_at), 'PPp')}</p>
                    </div>
                  </div>

                  {selectedTicket.description && (
                    <div>
                      <span className="text-muted-foreground text-sm">Description</span>
                      <p className="mt-1 text-sm">{selectedTicket.description}</p>
                    </div>
                  )}

                  {selectedTicket.is_escalated && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 text-red-600 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Escalated
                      </div>
                      {selectedTicket.escalation_reason && (
                        <p className="text-sm mt-1">{selectedTicket.escalation_reason}</p>
                      )}
                    </div>
                  )}

                  {selectedTicket.resolution && (
                    <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <span className="text-green-600 font-medium">Resolution</span>
                      <p className="text-sm mt-1">{selectedTicket.resolution}</p>
                    </div>
                  )}

                  <Separator />

                  {/* Comments */}
                  <div>
                    <h4 className="font-medium flex items-center gap-2 mb-3">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({comments.length})
                    </h4>
                    <ScrollArea className="h-[150px] mb-3">
                      <div className="space-y-3">
                        {comments.map(comment => (
                          <div key={comment.id} className="p-2 rounded bg-muted/50 text-sm">
                            <p>{comment.content}</p>
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(comment.created_at), 'PPp')}
                            </span>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No comments yet
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                      <Input
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                      />
                      <Button size="icon" onClick={handleAddComment} disabled={!newComment.trim()}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Actions */}
                  <div className="flex gap-2">
                    {selectedTicket.status !== 'resolved' && !selectedTicket.is_escalated && (
                      <Dialog open={escalateDialogOpen} onOpenChange={setEscalateDialogOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1 text-orange-600">
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
                            <Button onClick={handleEscalate} className="w-full" disabled={!escalationReason.trim()}>
                              Escalate Ticket
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a ticket to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </EmployeeLayout>
  );
}
