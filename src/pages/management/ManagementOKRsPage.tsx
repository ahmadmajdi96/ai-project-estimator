import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useObjectives, useKeyResults } from '@/hooks/useObjectives';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Target, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ManagementOKRsPage() {
  const { data: objectives } = useObjectives();
  const { data: allKeyResults } = useKeyResults();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'on_track':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'at_risk':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'off_track':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getProgress = (current: number, target: number | null) => {
    if (!target || target === 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">OKRs</h1>
            <p className="text-muted-foreground">
              Objectives and Key Results
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Objective
          </Button>
        </div>

        {objectives && objectives.length > 0 ? (
          <div className="grid gap-6">
            {objectives.map((objective) => {
              const keyResults = allKeyResults?.filter(kr => kr.objective_id === objective.id) || [];
              
              return (
                <Card key={objective.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          <CardTitle>{objective.title}</CardTitle>
                        </div>
                        {objective.description && (
                          <p className="text-sm text-muted-foreground">{objective.description}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{objective.scope}</Badge>
                        <Badge className={getStatusColor(objective.status)} variant="outline">
                          {objective.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium">Key Results ({keyResults.length})</h4>
                      <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        Add Key Result
                      </Button>
                    </div>
                    {keyResults.length > 0 ? (
                      <div className="space-y-3">
                        {keyResults.map((kr) => {
                          const progress = getProgress(kr.current_value, kr.target_value);
                          return (
                            <div key={kr.id} className="p-3 rounded-lg border bg-muted/30">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm font-medium">{kr.title}</span>
                                </div>
                              <Badge className={getStatusColor(kr.status)} variant="outline">
                                {kr.status.replace('_', ' ')}
                              </Badge>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{kr.current_value} / {kr.target_value} {kr.unit}</span>
                                  <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-muted-foreground text-sm">
                        No key results yet. Add key results to track progress.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No OKRs yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first objective with key results
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Objective
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}