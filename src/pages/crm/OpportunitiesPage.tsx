import { useState, useMemo } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useOpportunities, useAddOpportunity, useUpdateOpportunity, useWinLossReasons } from '@/hooks/useOpportunities';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Target, DollarSign, TrendingUp, Calendar, Building2, Search, LayoutGrid, List, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isDragging, setIsDragging] = useState(false);
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

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.clients?.client_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && opp.status === 'open';
  });

  const openOpportunities = opportunities.filter(o => o.status === 'open');
  const totalValue = openOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const weightedValue = openOpportunities.reduce((sum, o) => sum + ((o.value || 0) * (o.deal_probability || 0) / 100), 0);

  const oppsByStage = useMemo(() => {
    const grouped: Record<string, typeof opportunities> = {};
    stages.forEach(stage => { grouped[stage.value] = []; });
    filteredOpportunities.forEach(opp => {
      const stage = opp.sales_stage || 'lead';
      if (grouped[stage]) grouped[stage].push(opp);
      else if (grouped['lead']) grouped['lead'].push(opp);
    });
    return grouped;
  }, [filteredOpportunities, stages]);

  const handleSubmit = async () => {
    await addOpportunity.mutateAsync(formData as any);
    setDialogOpen(false);
    setFormData({ title: '', client_id: '', salesman_id: '', value: 0, deal_probability: 50, lead_source: 'other', sales_stage: 'lead', expected_close_date: '', description: '' });
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;
    const oppId = result.draggableId;
    const newStage = result.destination.droppableId;
    await updateOpportunity.mutateAsync({ id: oppId, sales_stage: newStage });
  };

  if (isLoading) {
    return <CRMLayout title="Opportunities Pipeline"><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div></CRMLayout>;
  }

  return (
    <CRMLayout title="Opportunities Pipeline">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Target className="h-4 w-4" /><span className="text-sm">Open Opportunities</span></div>
            <p className="text-2xl font-bold">{openOpportunities.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><DollarSign className="h-4 w-4" /><span className="text-sm">Total Pipeline</span></div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /><span className="text-sm">Weighted Value</span></div>
            <p className="text-2xl font-bold">${weightedValue.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Calendar className="h-4 w-4" /><span className="text-sm">Avg. Probability</span></div>
            <p className="text-2xl font-bold">{openOpportunities.length > 0 ? Math.round(openOpportunities.reduce((sum, o) => sum + (o.deal_probability || 0), 0) / openOpportunities.length) : 0}%</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search opportunities..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setViewMode('kanban')}><LayoutGrid className="h-4 w-4" /></Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-none border-l border-border" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            </div>
            <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" /> New Opportunity</Button>
          </div>
        </Card>

        {/* Pipeline View */}
        {viewMode === 'kanban' ? (
          <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map(stage => (
                <div key={stage.value} className={cn("flex-shrink-0 w-80 rounded-xl border transition-all", isDragging ? "border-dashed border-primary/50" : "border-border/50", "bg-gradient-to-b from-muted/30 to-muted/10")}>
                  <div className="p-4 rounded-t-xl border-b border-border/50" style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        <h3 className="font-semibold">{stage.name}</h3>
                      </div>
                      <Badge variant="secondary" className="bg-background/30">{oppsByStage[stage.value]?.length || 0}</Badge>
                    </div>
                    <p className="text-xs mt-1 opacity-80">${(oppsByStage[stage.value]?.reduce((sum, o) => sum + (o.value || 0), 0) || 0).toLocaleString()}</p>
                  </div>
                  <Droppable droppableId={stage.value}>
                    {(provided, snapshot) => (
                      <ScrollArea className={cn("h-[calc(100vh-380px)] p-2 transition-colors rounded-b-xl", snapshot.isDraggingOver && "bg-primary/5")}>
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[100px]">
                          {oppsByStage[stage.value]?.map((opp, index) => (
                            <Draggable key={opp.id} draggableId={opp.id} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <Card className={cn("p-3 cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 bg-card/80", snapshot.isDragging && "shadow-xl ring-2 ring-primary/30")}>
                                    <h4 className="font-medium text-sm mb-1 truncate">{opp.title}</h4>
                                    {opp.clients && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2"><Building2 className="h-3 w-3" /><span className="truncate">{opp.clients.client_name}</span></div>
                                    )}
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-primary font-bold text-sm">${opp.value?.toLocaleString()}</span>
                                      <Badge variant="outline" className="text-xs">{opp.deal_probability}%</Badge>
                                    </div>
                                    <Progress value={opp.deal_probability} className="h-1.5 mb-2" />
                                    {opp.expected_close_date && <p className="text-xs text-muted-foreground">Close: {format(new Date(opp.expected_close_date), 'MMM d')}</p>}
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {(oppsByStage[stage.value]?.length || 0) === 0 && (
                            <div className={cn("text-center py-8 text-muted-foreground text-sm rounded-lg border-2 border-dashed", snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" : "border-border/30")}>
                              {snapshot.isDraggingOver ? "Drop here" : "No opportunities"}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Stage</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Probability</th>
                    <th className="text-right p-2 text-sm font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOpportunities.map(opp => {
                    const stage = stages.find(s => s.value === opp.sales_stage);
                    return (
                      <tr key={opp.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-2 font-medium">{opp.title}</td>
                        <td className="p-2 text-muted-foreground">{opp.clients?.client_name || '-'}</td>
                        <td className="p-2"><Badge style={{ backgroundColor: `${stage?.color}20`, color: stage?.color }}>{stage?.name}</Badge></td>
                        <td className="p-2">{opp.deal_probability}%</td>
                        <td className="p-2 text-right font-bold text-primary">${opp.value?.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
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
