import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useCompetitors, useAddCompetitor } from '@/hooks/useCompetitors';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building, Globe, TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

export default function CompetitorsPage() {
  const { data: competitors = [], isLoading } = useCompetitors();
  const addCompetitor = useAddCompetitor();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    description: '',
    market_position: '',
    pricing_info: '',
    strengths: '',
    weaknesses: '',
  });

  const activeCompetitors = competitors.filter(c => c.is_active);

  const handleSubmit = async () => {
    await addCompetitor.mutateAsync({
      ...formData,
      strengths: formData.strengths.split(',').map(s => s.trim()).filter(Boolean),
      weaknesses: formData.weaknesses.split(',').map(s => s.trim()).filter(Boolean),
    } as any);
    setDialogOpen(false);
    setFormData({ name: '', website: '', description: '', market_position: '', pricing_info: '', strengths: '', weaknesses: '' });
  };

  return (
    <CRMLayout title="Competitive Intelligence">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Building className="h-4 w-4" />
              <span className="text-sm">Total Competitors</span>
            </div>
            <p className="text-2xl font-bold">{competitors.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Active Tracking</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">{activeCompetitors.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Globe className="h-4 w-4" />
              <span className="text-sm">With Website</span>
            </div>
            <p className="text-2xl font-bold">{competitors.filter(c => c.website).length}</p>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Competitor
          </Button>
        </div>

        {/* Competitors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map(competitor => (
            <Card key={competitor.id} className="p-5 bg-card/50 border-border/50 hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{competitor.name}</h3>
                  {competitor.market_position && (
                    <Badge variant="outline" className="mt-1">{competitor.market_position}</Badge>
                  )}
                </div>
                {competitor.website && (
                  <a href={competitor.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
              
              {competitor.description && (
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{competitor.description}</p>
              )}

              {competitor.pricing_info && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Pricing</p>
                  <p className="text-sm">{competitor.pricing_info}</p>
                </div>
              )}

              {competitor.strengths && competitor.strengths.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-medium text-emerald-500 mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Strengths
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {competitor.strengths.slice(0, 3).map((s, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {competitor.weaknesses && competitor.weaknesses.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-500 mb-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Weaknesses
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {competitor.weaknesses.slice(0, 3).map((w, i) => (
                      <Badge key={i} variant="secondary" className="text-xs bg-red-500/10 text-red-600">{w}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-border/50">
                <Badge className={competitor.is_active ? 'bg-emerald-500' : 'bg-slate-500'}>
                  {competitor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>

        {competitors.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No competitors tracked yet</p>
          </div>
        )}
      </div>

      {/* Add Competitor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Competitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Website</Label>
                <Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
              </div>
              <div>
                <Label>Market Position</Label>
                <Input value={formData.market_position} onChange={(e) => setFormData({...formData, market_position: e.target.value})} placeholder="e.g., Leader, Challenger" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <div>
              <Label>Pricing Info</Label>
              <Input value={formData.pricing_info} onChange={(e) => setFormData({...formData, pricing_info: e.target.value})} placeholder="e.g., $99-$499/month" />
            </div>
            <div>
              <Label>Strengths (comma-separated)</Label>
              <Input value={formData.strengths} onChange={(e) => setFormData({...formData, strengths: e.target.value})} placeholder="e.g., Strong brand, Large team" />
            </div>
            <div>
              <Label>Weaknesses (comma-separated)</Label>
              <Input value={formData.weaknesses} onChange={(e) => setFormData({...formData, weaknesses: e.target.value})} placeholder="e.g., High prices, Slow support" />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={addCompetitor.isPending}>
              Add Competitor
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
