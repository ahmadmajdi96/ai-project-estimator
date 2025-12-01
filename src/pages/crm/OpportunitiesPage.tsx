import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useOpportunities, useAddOpportunity, useUpdateOpportunity, useWinLossReasons } from '@/hooks/useOpportunities';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Target, DollarSign, TrendingUp, Calendar, Building2 } from 'lucide-react';
import { format } from 'date-fns';

const PIPELINE_STAGES = [
  { value: 'lead', label: 'Lead', color: 'bg-slate-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-blue-500' },
  { value: 'proposal', label: 'Proposal', color: 'bg-purple-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-amber-500' },
  { value: 'closed', label: 'Closed', color: 'bg-emerald-500' },
];

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
  const { data: clients = [] } = useClients();
  const { data: salesmen = [] } = useSalesmen();
  const { data: winLossReasons = [] } = useWinLossReasons();
  const addOpportunity = useAddOpportunity();
  const updateOpportunity = useUpdateOpportunity();
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

  const openOpportunities = opportunities.filter(o => o.status === 'open');
  const totalValue = openOpportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const weightedValue = openOpportunities.reduce((sum, o) => sum + ((o.value || 0) * (o.deal_probability || 0) / 100), 0);

  const handleSubmit = async () => {
    await addOpportunity.mutateAsync(formData as any);
    setDialogOpen(false);
    setFormData({ title: '', client_id: '', salesman_id: '', value: 0, deal_probability: 50, lead_source: 'other', sales_stage: 'lead', expected_close_date: '', description: '' });
  };

  const handleStageChange = async (id: string, newStage: string) => {
    await updateOpportunity.mutateAsync({ id, sales_stage: newStage });
  };

  const getOpportunitiesByStage = (stage: string) => 
    opportunities.filter(o => o.sales_stage === stage && o.status === 'open');

  return (
    <CRMLayout title="Opportunities Pipeline">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-sm">Open Opportunities</span>
            </div>
            <p className="text-2xl font-bold">{openOpportunities.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Pipeline</span>
            </div>
            <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Weighted Value</span>
            </div>
            <p className="text-2xl font-bold">${weightedValue.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Avg. Probability</span>
            </div>
            <p className="text-2xl font-bold">
              {openOpportunities.length > 0 
                ? Math.round(openOpportunities.reduce((sum, o) => sum + (o.deal_probability || 0), 0) / openOpportunities.length) 
                : 0}%
            </p>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Pipeline View</h2>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Opportunity
          </Button>
        </div>

        {/* Kanban Pipeline */}
        <div className="grid grid-cols-5 gap-4 overflow-x-auto">
          {PIPELINE_STAGES.map(stage => (
            <div key={stage.value} className="min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                <span className="font-medium">{stage.label}</span>
                <Badge variant="secondary" className="ml-auto">
                  {getOpportunitiesByStage(stage.value).length}
                </Badge>
              </div>
              <div className="space-y-3">
                {getOpportunitiesByStage(stage.value).map(opp => (
                  <Card key={opp.id} className="p-4 bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
                    <h4 className="font-medium mb-1 truncate">{opp.title}</h4>
                    {opp.clients && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <Building2 className="h-3 w-3" />
                        <span className="truncate">{opp.clients.client_name}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-primary font-bold">${opp.value?.toLocaleString()}</span>
                      <Badge variant="outline">{opp.deal_probability}%</Badge>
                    </div>
                    <Progress value={opp.deal_probability} className="h-1.5 mb-2" />
                    {opp.expected_close_date && (
                      <p className="text-xs text-muted-foreground">
                        Close: {format(new Date(opp.expected_close_date), 'MMM d')}
                      </p>
                    )}
                    <Select value={opp.sales_stage} onValueChange={(v) => handleStageChange(opp.id, v)}>
                      <SelectTrigger className="mt-2 h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PIPELINE_STAGES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Opportunity Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Opportunity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                <Label>Salesman</Label>
                <Select value={formData.salesman_id} onValueChange={(v) => setFormData({...formData, salesman_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Select salesman" /></SelectTrigger>
                  <SelectContent>
                    {salesmen.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Value ($)</Label>
                <Input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Probability (%)</Label>
                <Input type="number" min={0} max={100} value={formData.deal_probability} onChange={(e) => setFormData({...formData, deal_probability: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Lead Source</Label>
                <Select value={formData.lead_source} onValueChange={(v) => setFormData({...formData, lead_source: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Expected Close</Label>
                <Input type="date" value={formData.expected_close_date} onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={addOpportunity.isPending}>
              Create Opportunity
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
