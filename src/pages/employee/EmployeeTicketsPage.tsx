import { useState } from 'react';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TicketDetailSheet } from '@/components/employee/TicketDetailSheet';
import { 
  useEmployeeTickets, 
  useAddEmployeeTicket, 
  EmployeeTicket
} from '@/hooks/useEmployeeTickets';
import { 
  Plus, Search, Ticket, Clock, CheckCircle, XCircle, AlertCircle, 
  AlertTriangle, Filter, ArrowUpCircle, Tag
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
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newTicket, setNewTicket] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    tags: [] as string[],
  });

  const { data: tickets = [] } = useEmployeeTickets();
  const addTicket = useAddEmployeeTicket();

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
      attachments: [],
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
      tags: [],
    });
    setDialogOpen(false);
  };

  const handleTicketClick = (ticket: EmployeeTicket) => {
    setSelectedTicket(ticket);
    setSheetOpen(true);
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

        {/* Tickets List */}
        <Card>
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
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="space-y-3">
                {filteredTickets.map(ticket => {
                  const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
                  const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                  const StatusIcon = status.icon;
                  
                  return (
                    <div
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket)}
                      className="p-4 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 hover:border-primary/50"
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
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tickets found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Ticket Detail Sheet */}
        <TicketDetailSheet
          ticket={selectedTicket}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </EmployeeLayout>
  );
}
