import { useParams, useNavigate } from 'react-router-dom';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useClient, useDeleteClient } from '@/hooks/useClients';
import { useClientQuotes } from '@/hooks/useQuotes';
import { useCallLogs } from '@/hooks/useCallLogs';
import { useClientNotes, useAddClientNote, useDeleteClientNote } from '@/hooks/useClientNotes';
import { useClientCalendarEvents } from '@/hooks/useCalendarEvents';
import { ClientDocuments } from '@/components/crm/ClientDocuments';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CLIENT_STATUSES, SALES_STAGES, QUOTE_STATUSES } from '@/types/crm';
import { ArrowLeft, Building2, Mail, Phone, Globe, Calendar, DollarSign, FileText, PhoneCall, Trash2, Plus, Eye, FolderOpen } from 'lucide-react';
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

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: client, isLoading } = useClient(id);
  const { data: quotes = [] } = useClientQuotes(id);
  const { data: callLogs = [] } = useCallLogs(id);
  const { data: notes = [] } = useClientNotes(id);
  const { data: events = [] } = useClientCalendarEvents(id);
  const addNote = useAddClientNote();
  const deleteNote = useDeleteClientNote();
  const deleteClient = useDeleteClient();
  const [newNote, setNewNote] = useState('');
  const [callLogOpen, setCallLogOpen] = useState(false);
  const [viewQuote, setViewQuote] = useState<Quote | null>(null);

  if (isLoading || !client) {
    return <CRMLayout title="Loading..." />;
  }

  const status = CLIENT_STATUSES.find(s => s.value === client.status);
  const stage = SALES_STAGES.find(s => s.value === client.sales_stage);

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
              <div className="flex items-center gap-2 mt-1">
                {status && <Badge className={status.color}>{status.label}</Badge>}
                {stage && <Badge className={stage.color}>{stage.label}</Badge>}
                {client.industry && <Badge variant="outline">{client.industry}</Badge>}
              </div>
            </div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" /> Delete
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid md:grid-cols-4 gap-4">
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
              <FileText className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Quotes</span>
            </div>
            <p className="text-2xl font-bold">{quotes.length}</p>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Upcoming Events</span>
            </div>
            <p className="text-2xl font-bold">{events.filter(e => new Date(e.start_datetime) > new Date()).length}</p>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="notes">
          <TabsList>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="quotes">Quotes ({quotes.length})</TabsTrigger>
            <TabsTrigger value="documents" className="gap-1">
              <FolderOpen className="h-4 w-4" />
              Documents
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewQuote(quote as Quote)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </Card>
              );
            })}
            {quotes.length === 0 && <p className="text-muted-foreground text-center py-8">No quotes</p>}
          </TabsContent>

          <TabsContent value="documents">
            <ClientDocuments clientId={client.id} />
          </TabsContent>

          <TabsContent value="calls" className="space-y-4">
            <Button onClick={() => setCallLogOpen(true)} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Log Call
            </Button>
            {callLogs.map(log => (
              <Card key={log.id} className="p-4 bg-card/50 border-border/50">
                <div className="flex items-start gap-3">
                  <PhoneCall className="h-4 w-4 text-primary mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {log.call_type}
                      </Badge>
                      {log.call_duration && (
                        <span className="text-xs text-muted-foreground">{log.call_duration} min</span>
                      )}
                    </div>
                    <p className="text-sm">{log.summary || 'No summary'}</p>
                    {log.follow_up_action && (
                      <p className="text-xs text-accent mt-1">Follow-up: {log.follow_up_action}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(log.call_date), 'MMM d, yyyy h:mm a')}
                      {log.assigned_to && ` • ${log.assigned_to}`}
                    </p>
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

      <CallLogForm
        open={callLogOpen}
        onOpenChange={setCallLogOpen}
        clientId={client.id}
        clientName={client.client_name}
      />

      {/* View Quote Dialog */}
      <Dialog open={!!viewQuote} onOpenChange={() => setViewQuote(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{viewQuote?.title}</DialogTitle>
          </DialogHeader>
          {viewQuote && (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Quote Status & Date */}
                <div className="flex items-center justify-between">
                  <Badge className={QUOTE_STATUSES.find(s => s.value === viewQuote.status)?.color}>
                    {QUOTE_STATUSES.find(s => s.value === viewQuote.status)?.label}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Created {format(new Date(viewQuote.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                {viewQuote.valid_until && (
                  <p className="text-sm text-muted-foreground">
                    Valid until: {format(new Date(viewQuote.valid_until), 'MMM d, yyyy')}
                  </p>
                )}

                {/* Components */}
                <div>
                  <h4 className="font-semibold mb-2">Components</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-2">Item</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-right p-2">Qty</th>
                          <th className="text-right p-2">Price</th>
                          <th className="text-right p-2">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(viewQuote.components as QuoteComponent[])?.map((comp, i) => (
                          <tr key={i} className="border-t border-border/50">
                            <td className="p-2">{comp.name}</td>
                            <td className="p-2 text-muted-foreground">{comp.category}</td>
                            <td className="p-2 text-right">{comp.quantity}</td>
                            <td className="p-2 text-right">${comp.basePrice?.toLocaleString()}</td>
                            <td className="p-2 text-right font-medium">
                              ${((comp.basePrice || 0) * (comp.quantity || 1)).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${viewQuote.subtotal?.toLocaleString()}</span>
                  </div>
                  {viewQuote.discount_percent && viewQuote.discount_percent > 0 && (
                    <div className="flex justify-between text-emerald-500">
                      <span>Discount ({viewQuote.discount_percent}%)</span>
                      <span>-${viewQuote.discount_amount?.toLocaleString()}</span>
                    </div>
                  )}
                  {viewQuote.profit_margin && (
                    <div className="flex justify-between text-muted-foreground text-sm">
                      <span>Profit Margin</span>
                      <span>{viewQuote.profit_margin}%</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-primary">${viewQuote.total?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Notes */}
                {viewQuote.notes && (
                  <div>
                    <h4 className="font-semibold mb-1">Notes</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewQuote.notes}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}