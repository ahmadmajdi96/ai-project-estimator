import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useMarketingCampaigns, useAddMarketingCampaign } from '@/hooks/useMarketing';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Plus, Megaphone, DollarSign, TrendingUp, Calendar, Play, Pause, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

const CAMPAIGN_TYPES = [
  { value: 'email', label: 'Email' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'trade_show', label: 'Trade Show' },
  { value: 'content', label: 'Content' },
  { value: 'paid_ads', label: 'Paid Ads' },
  { value: 'other', label: 'Other' },
];

const STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-500', icon: null },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500', icon: Calendar },
  { value: 'active', label: 'Active', color: 'bg-emerald-500', icon: Play },
  { value: 'paused', label: 'Paused', color: 'bg-amber-500', icon: Pause },
  { value: 'completed', label: 'Completed', color: 'bg-purple-500', icon: CheckCircle },
];

export default function MarketingPage() {
  const { data: campaigns = [], isLoading } = useMarketingCampaigns();
  const addCampaign = useAddMarketingCampaign();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    campaign_type: 'email',
    start_date: '',
    end_date: '',
    budget: 0,
    target_audience: '',
  });

  const activeCampaigns = campaigns.filter(c => c.status === 'active');
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.actual_spend || 0), 0);

  const handleSubmit = async () => {
    await addCampaign.mutateAsync(formData as any);
    setDialogOpen(false);
    setFormData({ name: '', description: '', campaign_type: 'email', start_date: '', end_date: '', budget: 0, target_audience: '' });
  };

  return (
    <CRMLayout title="Marketing Campaigns">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Megaphone className="h-4 w-4" />
              <span className="text-sm">Total Campaigns</span>
            </div>
            <p className="text-2xl font-bold">{campaigns.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Play className="h-4 w-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">{activeCampaigns.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Total Budget</span>
            </div>
            <p className="text-2xl font-bold">${totalBudget.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Spent</span>
            </div>
            <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Campaign
          </Button>
        </div>

        {/* Campaigns Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map(campaign => {
            const status = STATUSES.find(s => s.value === campaign.status);
            const spendProgress = campaign.budget > 0 ? (campaign.actual_spend / campaign.budget) * 100 : 0;
            const StatusIcon = status?.icon;
            
            return (
              <Card key={campaign.id} className="p-5 bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{campaign.name}</h3>
                    <Badge variant="outline" className="mt-1 capitalize">{campaign.campaign_type?.replace('_', ' ')}</Badge>
                  </div>
                  <Badge className={status?.color}>
                    {StatusIcon && <StatusIcon className="h-3 w-3 mr-1" />}
                    {status?.label}
                  </Badge>
                </div>

                {campaign.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{campaign.description}</p>
                )}

                <div className="space-y-3">
                  {campaign.start_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {format(new Date(campaign.start_date), 'MMM d')}
                        {campaign.end_date && ` - ${format(new Date(campaign.end_date), 'MMM d')}`}
                      </span>
                    </div>
                  )}

                  {campaign.target_audience && (
                    <p className="text-sm"><span className="text-muted-foreground">Audience:</span> {campaign.target_audience}</p>
                  )}

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Budget</span>
                      <span>${campaign.actual_spend?.toLocaleString()} / ${campaign.budget?.toLocaleString()}</span>
                    </div>
                    <Progress value={spendProgress} className="h-2" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {campaigns.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No campaigns yet</p>
          </div>
        )}
      </div>

      {/* Add Campaign Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.campaign_type} onValueChange={(v) => setFormData({...formData, campaign_type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CAMPAIGN_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Budget ($)</Label>
                <Input type="number" value={formData.budget} onChange={(e) => setFormData({...formData, budget: Number(e.target.value)})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
              </div>
              <div>
                <Label>End Date</Label>
                <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
              </div>
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input value={formData.target_audience} onChange={(e) => setFormData({...formData, target_audience: e.target.value})} placeholder="e.g., Enterprise customers, SMBs" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={addCampaign.isPending}>
              Create Campaign
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
