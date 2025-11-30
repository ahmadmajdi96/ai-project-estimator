import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIRecommendations, useUpdateAIRecommendation } from '@/hooks/useAIRecommendations';
import { 
  Lightbulb, TrendingUp, Users, DollarSign, Shield, 
  CheckCircle, Clock, AlertTriangle, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const categoryIcons: Record<string, any> = {
  sales: TrendingUp,
  clients: Users,
  revenue: DollarSign,
  retention: Shield,
  team: Users,
  process: RefreshCw,
};

const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/10 text-red-500 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

const statusStyles: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  dismissed: 'bg-gray-500/10 text-gray-500',
};

export default function AIRecommendationsPage() {
  const { data: recommendations = [], isLoading, refetch } = useAIRecommendations();
  const updateRecommendation = useUpdateAIRecommendation();
  const [activeTab, setActiveTab] = useState('all');

  const filteredRecs = recommendations.filter(r => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return r.status === 'pending' || r.status === 'in_progress';
    return r.status === activeTab;
  });

  const handleStatusChange = async (id: string, status: string) => {
    await updateRecommendation.mutateAsync({ id, status });
  };

  const stats = {
    total: recommendations.length,
    pending: recommendations.filter(r => r.status === 'pending').length,
    inProgress: recommendations.filter(r => r.status === 'in_progress').length,
    completed: recommendations.filter(r => r.status === 'completed').length,
  };

  return (
    <CRMLayout title="AI Recommendations">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">AI Recommendations</h2>
            <p className="text-muted-foreground">AI-generated insights and action items based on your CRM data</p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Lightbulb className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <Clock className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <RefreshCw className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {isLoading ? (
              <Card className="p-8 text-center text-muted-foreground">Loading recommendations...</Card>
            ) : filteredRecs.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">No recommendations found</Card>
            ) : (
              <div className="grid gap-4">
                {filteredRecs.map((rec) => {
                  const Icon = categoryIcons[rec.category] || Lightbulb;
                  return (
                    <Card key={rec.id} className="overflow-hidden">
                      <div className="flex">
                        <div className={`w-1 ${rec.priority === 'high' ? 'bg-red-500' : rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <CardContent className="flex-1 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <div className={`p-2 rounded-lg ${priorityStyles[rec.priority]}`}>
                                <Icon className="h-5 w-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-semibold">{rec.title}</h3>
                                  <Badge variant="outline" className={priorityStyles[rec.priority]}>
                                    {rec.priority}
                                  </Badge>
                                  <Badge variant="secondary" className={statusStyles[rec.status]}>
                                    {rec.status.replace('_', ' ')}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                                <p className="text-xs text-muted-foreground mt-2">
                                  Category: {rec.category} • Created: {format(new Date(rec.created_at), 'MMM d, yyyy')}
                                </p>
                              </div>
                            </div>
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
                        </CardContent>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
