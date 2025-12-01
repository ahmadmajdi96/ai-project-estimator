import { useParams, useNavigate } from 'react-router-dom';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useClient, useDeleteClient } from '@/hooks/useClients';
import { useClientQuotes } from '@/hooks/useQuotes';
import { useCallLogs } from '@/hooks/useCallLogs';
import { useClientNotes, useAddClientNote, useDeleteClientNote } from '@/hooks/useClientNotes';
import { useClientCalendarEvents } from '@/hooks/useCalendarEvents';
import { useClientCommunications, useAddClientCommunication } from '@/hooks/useClientCommunications';
import { useClientSupportTickets } from '@/hooks/useSupportTickets';
import { useClientProducts } from '@/hooks/useProducts';
import { useClientInvoices } from '@/hooks/useInvoices';
import { useClientTagAssignments, useClientTags, useAssignClientTag, useRemoveClientTag } from '@/hooks/useClientTags';
import { useClientOpportunities } from '@/hooks/useOpportunities';
import { useContractAmendments } from '@/hooks/useContractAmendments';
import { useClientSLAs } from '@/hooks/useSLAs';
import { ClientDocuments } from '@/components/crm/ClientDocuments';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CLIENT_STATUSES, SALES_STAGES, QUOTE_STATUSES } from '@/types/crm';
import { ArrowLeft, Building2, Mail, Phone, Globe, Calendar, DollarSign, FileText, PhoneCall, Trash2, Plus, Eye, FolderOpen, MessageSquare, Ticket, Package, Receipt, Target, Tag, X, TrendingUp, TrendingDown, Clock, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { CallLogForm } from '@/components/crm/CallLogForm';

interface QuoteComponent {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  baseCost: number;
  quantity: number;
}

interface Quote {
  id: string;
  title: string;
  status: string;
  total: number;
  subtotal: number;
  profit_margin: number | null;
  discount_percent: number | null;
  discount_amount: number | null;
  notes: string | null;
  valid_until: string | null;
  components: QuoteComponent[];
  created_at: string;
}

const COMMUNICATION_TYPES = [
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'video_call', label: 'Video Call' },
];

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: quotes = [] } = useClientQuotes(id);
  const { data: callLogs = [] } = useCallLogs(id);
  const { data: notes = [] } = useClientNotes(id);
  const { data: events = [] } = useClientCalendarEvents(id);
  const { data: communications = [] } = useClientCommunications(id);
  const { data: tickets = [] } = useClientSupportTickets(id);
  const { data: clientProducts = [] } = useClientProducts(id);
  const { data: invoices = [] } = useClientInvoices(id);
  const { data: tagAssignments = [] } = useClientTagAssignments(id);
  const { data: allTags = [] } = useClientTags();
  const { data: opportunities = [] } = useClientOpportunities(id);
  const { data: amendments = [] } = useContractAmendments(id);
  const { data: slas = [] } = useClientSLAs(id);
  const addNote = useAddClientNote();
  const deleteNote = useDeleteClientNote();
  const deleteClient = useDeleteClient();
  const addCommunication = useAddClientCommunication();
  const assignTag = useAssignClientTag();
  const removeTag = useRemoveClientTag();
  const [newNote, setNewNote] = useState('');
  const [callLogOpen, setCallLogOpen] = useState(false);
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);
  const [commDialog, setCommDialog] = useState(false);
  const [commForm, setCommForm] = useState({ communication_type: 'call', subject: '', content: '', sentiment: 'neutral', direction: 'outbound' });

  if (isLoading || !client) {
    return <CRMLayout title="Loading..." />;
  }

  const status = CLIENT_STATUSES.find(s => s.value === client.status);
  const stage = SALES_STAGES.find(s => s.value === client.sales_stage);
  const assignedTags = tagAssignments.map(ta => ta.client_tags).filter(Boolean);
  const availableTags = allTags.filter(t => !tagAssignments.some(ta => ta.tag_id === t.id));

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addNote.mutateAsync({ client_id: client.id, note_text: newNote });
    setNewNote('');
  };

  const handleDelete = async () => {
    if (confirm('Delete this client?')) {
      await deleteClient.mutateAsync(client.id);
      navigate('/crm/clients');
    }
  };

  const handleAddCommunication = async () => {
    await addCommunication.mutateAsync({ ...commForm, client_id: client.id } as any);
    setCommDialog(false);
    setCommForm({ communication_type: 'call', subject: '', content: '', sentiment: 'neutral', direction: 'outbound' });
  };

  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const openOpportunities = opportunities.filter(o => o.status === 'open');
  const opportunityValue = openOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/crm/clients')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold font-display">{client.client_name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {status && <Badge className={status.color}>{status.label}</Badge>}
                {stage && <Badge className={stage.color}>{stage.label}</Badge>}
                {client.industry && <Badge variant="outline">{client.industry}</Badge>}
                {assignedTags.map(tag => tag && (
                  <Badge key={tag.id} style={{ backgroundColor: tag.color }} className="text-white gap-1">
                    {tag.name}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => {
                      const assignment = tagAssignments.find(ta => ta.tag_id === tag.id);
                      if (assignment) removeTag.mutate({ id: assignment.id, clientId: client.id });
                    }} />
                  </Badge>
                ))}
                {availableTags.length > 0 && (
                  <Select onValueChange={(tagId) => assignTag.mutate({ clientId: client.id, tagId })}>
                    <SelectTrigger className="h-6 w-auto gap-1 text-xs">
                      <Tag className="h-3 w-3" />
                      <span>Add Tag</span>
                    </SelectTrigger>
                    <SelectContent>
                      {availableTags.map(tag => (
                        <SelectItem key={tag.id} value={tag.id}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                            {tag.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-5 gap-4">
          <Card className="p-4 bg-card/50 border-border/50 space-y-3">
            {client.contact_person && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{client.contact_person}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="text-primary hover:underline">{client.email}</a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2 text-sm">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a href={client.website} target="_blank" className="text-primary hover:underline truncate">{client.website}</a>
              </div>
            )}
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Contract Value</span>
            </div>
            <p className="text-2xl font-bold">${client.contract_value?.toLocaleString() || 0}</p>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Opportunities</span>
            </div>
            <p className="text-2xl font-bold">${opportunityValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{openOpportunities.length} open</p>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Receipt className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Invoiced</span>
            </div>
            <p className="text-2xl font-bold">${totalInvoiced.toLocaleString()}</p>
            <p className="text-xs text-emerald-500">${paidInvoices.toLocaleString()} paid</p>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Events</span>
            </div>
            <p className="text-2xl font-bold">{events.filter(e => new Date(e.start_datetime) > new Date()).length}</p>
            <p className="text-xs text-muted-foreground">upcoming</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notes">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="communications" className="gap-1">
              <MessageSquare className="h-3 w-3" /> Communications ({communications.length})
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="gap-1">
              <Target className="h-3 w-3" /> Opportunities ({opportunities.length})
            </TabsTrigger>
            <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
            <TabsTrigger value="products" className="gap-1">
              <Package className="h-3 w-3" /> Products ({clientProducts.length})
            </TabsTrigger>
            <TabsTrigger value="invoices" className="gap-1">
              <Receipt className="h-3 w-3" /> Invoices ({invoices.length})
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-1">
              <Ticket className="h-3 w-3" /> Tickets ({tickets.length})
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-1">
              <FolderOpen className="h-3 w-3" /> Documents
            </TabsTrigger>
            <TabsTrigger value="calls">Calls ({callLogs.length})</TabsTrigger>
            <TabsTrigger value="events">Events ({events.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="space-y-4">
            <div className="flex gap-2">
              <Textarea placeholder="Add a note..." value={newNote} onChange={(e) => setNewNote(e.target.value)} rows={2} />
              <Button onClick={handleAddNote} disabled={addNote.isPending}>Add</Button>
            </div>
            {notes.map(note => (
              <Card key={note.id} className="p-4 bg-card/50 border-border/50">
                <div className="flex justify-between items-start">
                  <p className="text-sm whitespace-pre-wrap">{note.note_text}</p>
                  <Button variant="ghost" size="icon" onClick={() => deleteNote.mutateAsync(note.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}</p>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="communications" className="space-y-4">
            <Button onClick={() => setCommDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Log Communication
            </Button>
            {communications.map(comm => (
              <Card key={comm.id} className="p-4 bg-card/50 border-border/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">{comm.communication_type}</Badge>
                    <Badge variant="outline" className="text-xs">{comm.direction}</Badge>
                    {comm.sentiment && (
                      <Badge className={comm.sentiment === 'positive' ? 'bg-emerald-500' : comm.sentiment === 'negative' ? 'bg-red-500' : 'bg-slate-500'}>
                        {comm.sentiment}
                      </Badge>
                    )}
                  </div>
                  {comm.duration_minutes && <span className="text-xs text-muted-foreground">{comm.duration_minutes} min</span>}
                </div>
                {comm.subject && <p className="font-medium mb-1">{comm.subject}</p>}
                {comm.content && <p className="text-sm text-muted-foreground">{comm.content}</p>}
                <p className="text-xs text-muted-foreground mt-2">{format(new Date(comm.communication_date), 'MMM d, yyyy h:mm a')}</p>
              </Card>
            ))}
            {communications.length === 0 && <p className="text-muted-foreground text-center py-8">No communications logged</p>}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-3">
            {opportunities.map(opp => (
              <Card key={opp.id} className="p-4 bg-card/50 border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{opp.title}</p>
                    <p className="text-sm text-muted-foreground">{opp.sales_stage}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">${opp.value?.toLocaleString()}</p>
                    <Badge variant="outline">{opp.deal_probability}% probability</Badge>
                  </div>
                </div>
              </Card>
            ))}
            {opportunities.length === 0 && <p className="text-muted-foreground text-center py-8">No opportunities</p>}
          </TabsContent>

          <TabsContent value="quotes" className="space-y-3">
            {quotes.map(quote => {
              const qStatus = QUOTE_STATUSES.find(s => s.value === quote.status);
              return (
                <Card key={quote.id} className="p-4 bg-card/50 border-border/50 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{quote.title}</p>
                    <p className="text-sm text-muted-foreground">{format(new Date(quote.created_at), 'MMM d, yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {qStatus && <Badge className={qStatus.color}>{qStatus.label}</Badge>}
                    <span className="font-bold text-primary">${quote.total.toLocaleString()}</span>
                    <Button variant="outline" size="sm" onClick={() => setViewQuote(quote as Quote)}>
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                  </div>
                </Card>
              );
            })}
            {quotes.length === 0 && <p className="text-muted-foreground text-center py-8">No quotes</p>}
          </TabsContent>

          <TabsContent value="products" className="space-y-3">
            {clientProducts.map(cp => (
              <Card key={cp.id} className="p-4 bg-card/50 border-border/50 flex justify-between items-center">
                <div>
                  <p className="font-medium">{cp.products?.name}</p>
                  <p className="text-sm text-muted-foreground">Qty: {cp.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">${cp.total_price?.toLocaleString()}</p>
                  <Badge className={cp.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}>{cp.status}</Badge>
                </div>
              </Card>
            ))}
            {clientProducts.length === 0 && <p className="text-muted-foreground text-center py-8">No products assigned</p>}
          </TabsContent>

          <TabsContent value="invoices" className="space-y-3">
            {invoices.map(inv => (
              <Card key={inv.id} className="p-4 bg-card/50 border-border/50 flex justify-between items-center">
                <div>
                  <p className="font-mono text-sm">{inv.invoice_number}</p>
                  <p className="text-sm text-muted-foreground">{format(new Date(inv.issue_date), 'MMM d, yyyy')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={inv.status === 'paid' ? 'bg-emerald-500' : inv.status === 'overdue' ? 'bg-red-500' : 'bg-blue-500'}>
                    {inv.status}
                  </Badge>
                  <span className="font-bold">${inv.total_amount?.toLocaleString()}</span>
                </div>
              </Card>
            ))}
            {invoices.length === 0 && <p className="text-muted-foreground text-center py-8">No invoices</p>}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-3">
            {tickets.map(ticket => (
              <Card key={ticket.id} className="p-4 bg-card/50 border-border/50">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{ticket.ticket_number}</p>
                    <p className="font-medium">{ticket.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={ticket.priority === 'urgent' ? 'bg-red-500' : ticket.priority === 'high' ? 'bg-amber-500' : 'bg-slate-500'}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={ticket.status === 'resolved' || ticket.status === 'closed' ? 'bg-emerald-500' : 'bg-blue-500'}>
                      {ticket.status}
                    </Badge>
                  </div>
                </div>
                {ticket.satisfaction_rating && (
                  <div className="flex items-center gap-1 mt-2">
                    <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                    <span className="text-sm">{ticket.satisfaction_rating}/5</span>
                  </div>
                )}
              </Card>
            ))}
            {tickets.length === 0 && <p className="text-muted-foreground text-center py-8">No support tickets</p>}
          </TabsContent>

          <TabsContent value="documents">
            <ClientDocuments clientId={client.id} />
          </TabsContent>

          <TabsContent value="calls" className="space-y-4">
            <Button onClick={() => setCallLogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" /> Log Call
            </Button>
            {callLogs.map(log => (
              <Card key={log.id} className="p-4 bg-card/50 border-border/50">
                <div className="flex items-start gap-3">
                  <PhoneCall className="h-4 w-4 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">{log.call_type}</Badge>
                      {log.call_duration && <span className="text-xs text-muted-foreground">{log.call_duration} min</span>}
                    </div>
                    <p className="text-sm">{log.summary || 'No summary'}</p>
                    {log.follow_up_action && <p className="text-xs text-accent mt-1">Follow-up: {log.follow_up_action}</p>}
                    <p className="text-xs text-muted-foreground mt-2">{format(new Date(log.call_date), 'MMM d, yyyy h:mm a')}</p>
                  </div>
                </div>
              </Card>
            ))}
            {callLogs.length === 0 && <p className="text-muted-foreground text-center py-8">No call logs</p>}
          </TabsContent>

          <TabsContent value="events">
            {events.map(event => (
              <Card key={event.id} className="p-4 bg-card/50 border-border/50">
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{format(new Date(event.start_datetime), 'MMM d, yyyy h:mm a')}</p>
              </Card>
            ))}
            {events.length === 0 && <p className="text-muted-foreground text-center py-8">No events</p>}
          </TabsContent>
        </Tabs>
      </div>

      <CallLogForm open={callLogOpen} onOpenChange={setCallLogOpen} clientId={client.id} clientName={client.client_name} />

      {/* Communication Dialog */}
      <Dialog open={commDialog} onOpenChange={setCommDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Communication</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={commForm.communication_type} onValueChange={(v) => setCommForm({...commForm, communication_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {COMMUNICATION_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Direction</Label>
                <Select value={commForm.direction} onValueChange={(v) => setCommForm({...commForm, direction: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inbound">Inbound</SelectItem>
                    <SelectItem value="outbound">Outbound</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={commForm.subject} onChange={(e) => setCommForm({...commForm, subject: e.target.value})} />
            </div>
            <div>
              <Label>Sentiment</Label>
              <Select value={commForm.sentiment} onValueChange={(v) => setCommForm({...commForm, sentiment: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Content</Label>
              <Textarea value={commForm.content} onChange={(e) => setCommForm({...commForm, content: e.target.value})} rows={4} />
            </div>
            <Button onClick={handleAddCommunication} className="w-full" disabled={addCommunication.isPending}>
              Save Communication
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Quote Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={() => setViewQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewQuote?.title}</DialogTitle>
          </DialogHeader>
          {viewQuote && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={QUOTE_STATUSES.find(s => s.value === viewQuote.status)?.color}>
                    {QUOTE_STATUSES.find(s => s.value === viewQuote.status)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {format(new Date(viewQuote.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Components</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2">Item</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewQuote.components as QuoteComponent[])?.map((comp, i) => (
                          <tr key={i} className="border-t border-border/50">
                            <td className="p-2">{comp.name}</td>
                            <td className="p-2 text-right">{comp.quantity}</td>
                            <td className="p-2 text-right">${comp.basePrice?.toLocaleString()}</td>
                            <td className="p-2 text-right font-medium">${((comp.basePrice || 0) * (comp.quantity || 1)).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${viewQuote.subtotal?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">${viewQuote.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
