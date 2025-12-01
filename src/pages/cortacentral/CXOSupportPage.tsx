import { CortaCentralLayout } from '@/components/cortacentral/CortaCentralLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCXOSupportTickets, useCXOTenants, useAddCXOSupportTicket } from '@/hooks/useCortaCentral';
import { HeadphonesIcon, Plus, AlertTriangle, Bug, HelpCircle, Lightbulb } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const ticketTypes = [
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'incident', label: 'Incident', icon: AlertTriangle },
  { value: 'billing_question', label: 'Billing Question', icon: HelpCircle },
  { value: 'feature_request', label: 'Feature Request', icon: Lightbulb },
];

const severityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500',
  medium: 'bg-amber-500/10 text-amber-500',
  high: 'bg-orange-500/10 text-orange-500',
  critical: 'bg-red-500/10 text-red-500',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-500',
  investigating: 'bg-blue-500/10 text-blue-500',
  waiting_for_customer: 'bg-amber-500/10 text-amber-500',
  resolved: 'bg-purple-500/10 text-purple-500',
  closed: 'bg-muted text-muted-foreground',
};

export default function CXOSupportPage() {
  const { data: tickets, isLoading } = useCXOSupportTickets();
  const { data: tenants } = useCXOTenants();
  const addTicket = useAddCXOSupportTicket();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: '',
    severity: 'medium',
    title: '',
    description: '',
  });

  const handleSubmit = async () => {
    if (!form.type || !form.title) return;
    
    const tenantId = tenants?.[0]?.id;
    if (!tenantId) return;

    await addTicket.mutateAsync({
      type: form.type as any,
      severity: form.severity as any,
      title: form.title,
      description: form.description,
      tenant_id: tenantId,
      status: 'open',
    });
    
    setForm({ type: '', severity: 'medium', title: '', description: '' });
    setIsDialogOpen(false);
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = ticketTypes.find(t => t.value === type);
    return typeInfo?.icon || HelpCircle;
  };

  return (
    <CortaCentralLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support & Diagnostics</h1>
            <p className="text-muted-foreground">Get help and report issues</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Ticket
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ticketTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm(prev => ({ ...prev, severity: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Detailed description..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!form.type || !form.title}>
                    Create Ticket
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{tickets?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Total Tickets</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">
                {tickets?.filter(t => t.status === 'open').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">
                {tickets?.filter(t => t.status === 'investigating').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Investigating</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-purple-500">
                {tickets?.filter(t => t.status === 'resolved').length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeadphonesIcon className="h-5 w-5" />
              Support Tickets
            </CardTitle>
            <CardDescription>View and manage your support requests</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !tickets?.length ? (
              <div className="text-center py-12">
                <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No support tickets</p>
                <p className="text-sm text-muted-foreground">Create a ticket if you need help</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => {
                  const TypeIcon = getTypeIcon(ticket.type);
                  return (
                    <div key={ticket.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${severityColors[ticket.severity]}`}>
                            <TypeIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="font-medium">{ticket.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {ticket.description || 'No description'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {ticket.type.replace('_', ' ')}
                              </Badge>
                              <Badge className={severityColors[ticket.severity]}>
                                {ticket.severity}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(ticket.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CortaCentralLayout>
  );
}
