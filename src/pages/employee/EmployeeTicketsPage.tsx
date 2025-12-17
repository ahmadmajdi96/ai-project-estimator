import { useState } from 'react';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { TicketDetailSheet } from '@/components/employee/TicketDetailSheet';
import { useRoleBasedTickets, useUpdateTicketStatus } from '@/hooks/useRoleBasedData';
import { useAddEmployeeTicket, EmployeeTicket } from '@/hooks/useEmployeeTickets';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  Plus, Search, Ticket, Clock, CheckCircle, XCircle, AlertCircle, 
  AlertTriangle, Filter, ArrowUpCircle, Tag, Users, User
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

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
  const [activeTab, setActiveTab] = useState('my-tickets');
  
  // Resolution dialog state
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  
  const [newTicket, setNewTicket] = useState({
    category: '',
    subject: '',
    description: '',
    priority: 'medium',
    tags: [] as string[],
  });

  const { data: roleBasedData } = useRoleBasedTickets();
  const { canApproveRequests, canViewTeamData, employeeId } = useUserRole();
  const addTicket = useAddEmployeeTicket();
  const updateTicketStatus = useUpdateTicketStatus();

  const myTickets = roleBasedData?.myTickets || [];
  const teamTickets = roleBasedData?.teamTickets || [];

  const filterTickets = (tickets: any[]) => {
    return tickets.filter(ticket => {
      const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
      const matchesSearch = searchQuery === '' || 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesCategory && matchesSearch;
    });
  };

  const filteredMyTickets = filterTickets(myTickets);
  const filteredTeamTickets = filterTickets(teamTickets);

  const getDisplayId = (ticketNumber: string) => {
    return `#${ticketNumber.slice(-6).toUpperCase()}`;
  };

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
      employee_id: employeeId,
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

  const handleResolveClick = (ticketId: string) => {
    setResolvingTicketId(ticketId);
    setResolution('');
    setResolveDialogOpen(true);
  };

  const handleResolveConfirm = () => {
    if (!resolvingTicketId) return;
    updateTicketStatus.mutate({ 
      ticketId: resolvingTicketId, 
      status: 'resolved',
      resolution: resolution || undefined
    });
    setResolveDialogOpen(false);
    setResolvingTicketId(null);
    setResolution('');
  };

  const handleCloseTicket = (ticketId: string) => {
    updateTicketStatus.mutate({ ticketId, status: 'closed' });
  };

  const openTickets = myTickets.filter(t => t.status === 'open').length;
  const inProgressTickets = myTickets.filter(t => t.status === 'in_progress').length;
  const resolvedTickets = myTickets.filter(t => t.status === 'resolved').length;
  const teamOpenCount = teamTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  const TicketCard = ({ ticket, showActions = false }: { ticket: any; showActions?: boolean }) => {
    const status = statusConfig[ticket.status as keyof typeof statusConfig] || statusConfig.open;
    const priority = priorityConfig[ticket.priority as keyof typeof priorityConfig] || priorityConfig.medium;
    const StatusIcon = status.icon;
    const employeeName = ticket.employees?.full_name || 'Unknown';
    const initials = employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    
    return (
      <div
        onClick={() => handleTicketClick(ticket)}
        className="p-4 rounded-xl border-0 bg-card shadow-sm cursor-pointer transition-all hover:shadow-md"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${status.bg}`}>
              <StatusIcon className={`h-4 w-4 ${status.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs text-muted-foreground">
                  {getDisplayId(ticket.ticket_number)}
                </span>
                {ticket.is_escalated && (
                  <Badge variant="destructive" className="text-xs h-5">
                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                    Escalated
                  </Badge>
                )}
              </div>
              <h4 className="font-medium mt-1 line-clamp-1">{ticket.subject}</h4>
              
              {showActions && ticket.employees?.full_name && (
                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[10px] bg-primary/10">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{ticket.employees.full_name}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <span>{ticketCategories.find(c => c.value === ticket.category)?.label}</span>
                <span>•</span>
                <span>{format(parseISO(ticket.created_at), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>
          <Badge className={`${priority.color} text-white text-xs`}>
            {priority.label}
          </Badge>
        </div>
        
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="flex items-center gap-1 mt-3 flex-wrap">
            <Tag className="h-3 w-3 text-muted-foreground" />
            {ticket.tags.slice(0, 3).map((tag: string, i: number) => (
              <Badge key={i} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {ticket.tags.length > 3 && (
              <span className="text-xs text-muted-foreground">+{ticket.tags.length - 3}</span>
            )}
          </div>
        )}

        {ticket.resolution && (
          <div className="mt-3 p-2 rounded bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
            <p className="text-xs text-green-600 dark:text-green-400">
              <strong>Resolution:</strong> {ticket.resolution}
            </p>
          </div>
        )}

        {showActions && (ticket.status === 'open' || ticket.status === 'in_progress') && canApproveRequests && (
          <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleResolveClick(ticket.id)}
              disabled={updateTicketStatus.isPending}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Resolve
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1"
              onClick={() => handleCloseTicket(ticket.id)}
              disabled={updateTicketStatus.isPending}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Close
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Ticket className="h-7 w-7" />
              {canViewTeamData ? 'Ticket Management' : 'Support Tickets'}
            </h1>
            <p className="text-muted-foreground">
              {canViewTeamData ? 'Manage your tickets and resolve team tickets' : 'Create and track support tickets'}
            </p>
          </div>
          {canApproveRequests && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="shadow-lg shadow-primary/20">
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
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Open', value: openTickets, icon: AlertCircle, color: 'from-blue-500 to-cyan-500' },
            { label: 'In Progress', value: inProgressTickets, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Resolved', value: resolvedTickets, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
            { label: 'Escalated', value: myTickets.filter(t => t.is_escalated).length, icon: AlertTriangle, color: 'from-red-500 to-rose-500' },
            ...(canViewTeamData ? [{ label: 'Team Open', value: teamOpenCount, icon: Users, color: 'from-purple-500 to-pink-500' }] : []),
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br text-white ${stat.color}`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <Icon className="h-5 w-5 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-white/80 text-xs">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[130px] bg-muted/50 border-0">
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
                <SelectTrigger className="w-full sm:w-[150px] bg-muted/50 border-0">
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
          </CardContent>
        </Card>

        {/* Content */}
        {canViewTeamData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="my-tickets" className="flex-1 sm:flex-none">
                <User className="h-4 w-4 mr-2" />
                My Tickets ({filteredMyTickets.length})
              </TabsTrigger>
              <TabsTrigger value="team-tickets" className="flex-1 sm:flex-none relative">
                <Users className="h-4 w-4 mr-2" />
                Team Tickets ({filteredTeamTickets.length})
                {teamOpenCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {teamOpenCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-tickets" className="mt-6">
              <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
                  {filteredMyTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
                {filteredMyTickets.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tickets found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team-tickets" className="mt-6">
              <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
                  {filteredTeamTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} showActions />
                  ))}
                </div>
                {filteredTeamTickets.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team tickets found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px]">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
              {filteredMyTickets.map(ticket => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
            </div>
            {filteredMyTickets.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No tickets found. Click "New Ticket" to create one.</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Ticket Detail Sheet */}
        <TicketDetailSheet
          ticket={selectedTicket}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />

        {/* Resolution Dialog */}
        <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Resolution Notes</Label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResolveDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleResolveConfirm}
                disabled={updateTicketStatus.isPending}
              >
                Confirm Resolution
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  );
}
