import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDebitCases } from '@/hooks/useDebitCases';
import { useDebitCollectors } from '@/hooks/useDebitCollectors';
import { useDebitPipelineStages } from '@/hooks/useDebitPipelineStages';
import { DollarSign, Users, TrendingUp, AlertCircle, Loader2 } from 'lucide-react';

export default function DebitDashboardPage() {
  const { data: cases = [], isLoading: loadingCases } = useDebitCases();
  const { data: collectors = [], isLoading: loadingCollectors } = useDebitCollectors();
  const { data: stages = [] } = useDebitPipelineStages();

  const totalOutstanding = cases.reduce((sum, c) => sum + (c.current_amount || 0), 0);
  const totalCollected = cases.reduce((sum, c) => sum + (c.collected_amount || 0), 0);
  const openCases = cases.filter(c => c.status === 'open').length;
  const activeCollectors = collectors.filter(c => c.status === 'active').length;

  if (loadingCases || loadingCollectors) {
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
        <div>
          <h1 className="text-3xl font-display font-bold">Debit Collection Dashboard</h1>
          <p className="text-muted-foreground">Overview of debt collection performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-destructive/10">
                <DollarSign className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Collected</p>
                <p className="text-2xl font-bold">${totalCollected.toLocaleString()}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <AlertCircle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Cases</p>
                <p className="text-2xl font-bold">{openCases}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-500/10">
                <Users className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Collectors</p>
                <p className="text-2xl font-bold">{activeCollectors}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-5 bg-card/50">
            <h3 className="font-semibold mb-4">Cases by Stage</h3>
            <div className="space-y-3">
              {stages.map(stage => {
                const count = cases.filter(c => c.stage === stage.value).length;
                const amount = cases.filter(c => c.stage === stage.value).reduce((sum, c) => sum + (c.current_amount || 0), 0);
                return (
                  <div key={stage.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span>{stage.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">{count} cases</Badge>
                      <span className="text-sm text-muted-foreground">${amount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5 bg-card/50">
            <h3 className="font-semibold mb-4">Top Collectors</h3>
            <div className="space-y-3">
              {collectors.slice(0, 5).map(collector => {
                const collectorCases = cases.filter(c => c.collector_id === collector.id);
                const collected = collectorCases.reduce((sum, c) => sum + (c.collected_amount || 0), 0);
                return (
                  <div key={collector.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-medium text-primary">{collector.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium">{collector.name}</p>
                        <p className="text-xs text-muted-foreground">{collectorCases.length} cases</p>
                      </div>
                    </div>
                    <span className="font-semibold text-primary">${collected.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}
