import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useSupportTickets, useAddSupportTicket, useUpdateSupportTicket } from '@/hooks/useSupportTickets';
import { useClients } from '@/hooks/useClients';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Ticket, Clock, AlertCircle, CheckCircle2, Star } from 'lucide-react';
import { format } from 'date-fns';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'bg-slate-500' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-500' },
  { value: 'high', label: 'High', color: 'bg-amber-500' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-500' },
];

const STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-blue-500' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { value: 'waiting_customer', label: 'Waiting', color: 'bg-purple-500' },
  { value: 'resolved', label: 'Resolved', color: 'bg-emerald-500' },
  { value: 'closed', label: 'Closed', color: 'bg-slate-500' },
];

export default function SupportTicketsPage() {
  const { data: tickets = [], isLoading } = useSupportTickets();
  const { data: clients = [] } = useClients();
  const addTicket = useAddSupportTicket();
  const updateTicket = useUpdateSupportTicket();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    client_id: '',
    title: '',
    description: '',
    priority: 'medium',
    category: '',
  });

  const filteredTickets = statusFilter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === statusFilter);

  const openCount = tickets.filter(t => t.status === 'open').length;
  const avgSatisfaction = tickets.filter(t => t.satisfaction_rating).length > 0
    ? (tickets.filter(t => t.satisfaction_rating).reduce((sum, t) => sum + (t.satisfaction_rating || 0), 0) / 
       tickets.filter(t => t.satisfaction_rating).length).toFixed(1)
    : 'N/A';

  const handleSubmit = async () => {
    await addTicket.mutateAsync(formData as any);
    setDialogOpen(false);
    setFormData({ client_id: '', title: '', description: '', priority: 'medium', category: '' });
  };

  const handleStatusChange = async (id: string, status: string) => {
    const updates: any = { id, status };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    if (status === 'closed') updates.closed_at = new Date().toISOString();
    await updateTicket.mutateAsync(updates);
  };

  return (
    <CRMLayout title="Support Tickets">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Ticket className="h-4 w-4" />
              <span className="text-sm">Total Tickets</span>
            </div>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Open</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">{openCount}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Resolved</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">
              {tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length}
            </p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="h-4 w-4" />
              <span className="text-sm">Avg. Satisfaction</span>
            </div>
            <p className="text-2xl font-bold">{avgSatisfaction}</p>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex justify-between items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Ticket
          </Button>
        </div>

        {/* Tickets Table */}
        <Card className="bg-card/50 border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket #</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map(ticket => {
                const priority = PRIORITIES.find(p => p.value === ticket.priority);
                const status = STATUSES.find(s => s.value === ticket.status);
                return (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-mono text-sm">{ticket.ticket_number}</TableCell>
                    <TableCell className="font-medium">{ticket.title}</TableCell>
                    <TableCell>{ticket.clients?.client_name || '-'}</TableCell>
                    <TableCell>
                      <Badge className={priority?.color}>{priority?.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <Select value={ticket.status} onValueChange={(v) => handleStatusChange(ticket.id, v)}>
                        <SelectTrigger className="h-8 w-32">
                          <Badge className={status?.color}>{status?.label}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      {ticket.satisfaction_rating ? (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span>{ticket.satisfaction_rating}</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Support Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g., Technical, Billing" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={4} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={addTicket.isPending}>
              Create Ticket
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
