import { useState, useMemo } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useOpportunities, useAddOpportunity, useUpdateOpportunity } from '@/hooks/useOpportunities';
import { useOpportunityStages } from '@/hooks/useOpportunityStages';
import { useClients } from '@/hooks/useClients';
import { useSalesmen } from '@/hooks/useSalesmen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, DollarSign, Calendar, Building2, Loader2, User } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const LEAD_SOURCES = [
  { value: 'marketing_campaign', label: 'Marketing Campaign' },
  { value: 'referral', label: 'Referral' },
  { value: 'inbound', label: 'Inbound' },
  { value: 'outbound', label: 'Outbound' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'website', label: 'Website' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'partner', label: 'Partner' },
  { value: 'other', label: 'Other' },
];

export default function OpportunitiesPage() {
  const { data: opportunities = [], isLoading } = useOpportunities();
  const { data: stages = [] } = useOpportunityStages();
  const { data: clients = [] } = useClients();
  const { data: salesmen = [] } = useSalesmen();
  const addOpportunity = useAddOpportunity();
  const updateOpportunity = useUpdateOpportunity();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    salesman_id: '',
    value: 0,
    deal_probability: 50,
    lead_source: 'other',
    sales_stage: 'lead',
    expected_close_date: '',
    description: '',
  });

  const openOpportunities = useMemo(() => 
    opportunities.filter(o => o.status === 'open'),
  [opportunities]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const oppId = result.draggableId;
    const newStage = result.destination.droppableId;
    updateOpportunity.mutate({ id: oppId, sales_stage: newStage });
  };

  const handleSubmit = async () => {
    await addOpportunity.mutateAsync(formData as any);
    setDialogOpen(false);
    setFormData({ title: '', client_id: '', salesman_id: '', value: 0, deal_probability: 50, lead_source: 'other', sales_stage: 'lead', expected_close_date: '', description: '' });
  };

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Opportunities Pipeline</h1>
            <p className="text-muted-foreground">Track deals through sales stages</p>
          </div>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Opportunity
          </Button>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageOpps = openOpportunities.filter(o => o.sales_stage === stage.value);
              const stageTotal = stageOpps.reduce((sum, o) => sum + (o.value || 0), 0);
              const weightedTotal = stageOpps.reduce((sum, o) => sum + ((o.value || 0) * (o.deal_probability || 0) / 100), 0);
              
              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <Card className="p-3 mb-3 bg-card/50" style={{ borderTopColor: stage.color, borderTopWidth: 3 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stage.name}</span>
                        <Badge variant="secondary">{stageOpps.length}</Badge>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Total Value</span>
                        <p className="font-semibold text-primary">${stageTotal.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Weighted</span>
                        <p className="font-semibold text-emerald-600">${weightedTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Droppable droppableId={stage.value}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/20'}`}
                      >
                        {stageOpps.map((opp, index) => (
                          <Draggable key={opp.id} draggableId={opp.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-card cursor-grab active:cursor-grabbing transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-medium">{opp.title}</h4>
                                    <Badge variant="outline" className="text-xs">{opp.deal_probability}%</Badge>
                                  </div>
                                  
                                  {opp.clients && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <Building2 className="h-3 w-3" />
                                      <span>{opp.clients.client_name}</span>
                                    </div>
                                  )}
                                  
                                  <Progress value={opp.deal_probability} className="h-1.5" />
                                  
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-primary font-semibold">
                                      <DollarSign className="h-4 w-4" />
                                      <span>${(opp.value || 0).toLocaleString()}</span>
                                    </div>
                                    {opp.expected_close_date && (
                                      <div className="flex items-center gap-1 text-muted-foreground text-xs">
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(new Date(opp.expected_close_date), 'MMM d')}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {opp.salesmen && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>{opp.salesmen.name}</span>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>

      {/* Add Opportunity Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Opportunity</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Title</Label><Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>{clients.map(c => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Salesman</Label>
                <Select value={formData.salesman_id} onValueChange={(v) => setFormData({...formData, salesman_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select salesman" /></SelectTrigger>
                  <SelectContent>{salesmen.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Value ($)</Label><Input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} /></div>
              <div><Label>Probability (%)</Label><Input type="number" min={0} max={100} value={formData.deal_probability} onChange={(e) => setFormData({...formData, deal_probability: Number(e.target.value)})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lead Source</Label>
                <Select value={formData.lead_source} onValueChange={(v) => setFormData({...formData, lead_source: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEAD_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Expected Close</Label><Input type="date" value={formData.expected_close_date} onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})} /></div>
            </div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
            <Button onClick={handleSubmit} className="w-full" disabled={addOpportunity.isPending}>Create Opportunity</Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
