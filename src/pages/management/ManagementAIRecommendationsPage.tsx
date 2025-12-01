import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIRecommendations, useUpdateAIRecommendation } from '@/hooks/useAIRecommendations';
import { Bot, Lightbulb, TrendingUp, Users, Target, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons: Record<string, any> = {
  sales: TrendingUp,
  clients: Users,
  operations: Target,
  default: Lightbulb,
};

const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  dismissed: 'bg-gray-500/10 text-gray-500',
};

export default function ManagementAIRecommendationsPage() {
  const { data: recommendations, isLoading } = useAIRecommendations();
  const updateRecommendation = useUpdateAIRecommendation();

  const handleStatusChange = async (id: string, status: string) => {
    await updateRecommendation.mutateAsync({ id, status });
  };

  const filteredRecs = (status?: string) => {
    if (!recommendations) return [];
    if (!status || status === 'all') return recommendations;
    if (status === 'active') return recommendations.filter(r => r.status === 'in_progress');
    return recommendations.filter(r => r.status === status);
  };

  const stats = {
    total: recommendations?.length || 0,
    pending: recommendations?.filter(r => r.status === 'pending').length || 0,
    inProgress: recommendations?.filter(r => r.status === 'in_progress').length || 0,
    completed: recommendations?.filter(r => r.status === 'completed').length || 0,
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">AI Recommendations</h1>
          <p className="text-muted-foreground">AI-generated action items for organizational improvement</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Bot className="h-8 w-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
                <Target className="h-8 w-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>

              {['all', 'pending', 'active', 'completed'].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-4 mt-4">
                  {isLoading ? (
                    <p className="text-muted-foreground">Loading...</p>
                  ) : filteredRecs(tab).length === 0 ? (
                    <p className="text-muted-foreground">No recommendations found</p>
                  ) : (
                    filteredRecs(tab).map(rec => {
                      const Icon = categoryIcons[rec.category] || categoryIcons.default;
                      return (
                        <div key={rec.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{rec.title}</h4>
                                <p className="text-sm text-muted-foreground">{rec.description}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={priorityStyles[rec.priority] || ''}>
                                {rec.priority}
                              </Badge>
                              <Badge className={statusStyles[rec.status] || ''}>
                                {rec.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t">
                            <span className="text-xs text-muted-foreground">
                              Created {format(new Date(rec.created_at), 'MMM d, yyyy')}
                            </span>
                            <div className="flex gap-2">
                              {rec.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStatusChange(rec.id, 'in_progress')}
                                  >
                                    Start
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost"
                                    onClick={() => handleStatusChange(rec.id, 'dismissed')}
                                  >
                                    Dismiss
                                  </Button>
                                </>
                              )}
                              {rec.status === 'in_progress' && (
                                <Button 
                                  size="sm"
                                  onClick={() => handleStatusChange(rec.id, 'completed')}
                                >
                                  Complete
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
