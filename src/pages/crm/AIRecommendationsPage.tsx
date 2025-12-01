import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIRecommendations, useUpdateAIRecommendation } from '@/hooks/useAIRecommendations';
import { useClients } from '@/hooks/useClients';
import { useInvoices } from '@/hooks/useInvoices';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useDebitCases } from '@/hooks/useDebitCases';
import { useOpportunities } from '@/hooks/useOpportunities';
import { useTasks } from '@/hooks/useTasks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Lightbulb, TrendingUp, Users, DollarSign, Shield, 
  CheckCircle, Clock, AlertTriangle, RefreshCw, Sparkles, Loader2
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
  const [isGenerating, setIsGenerating] = useState(false);

  // Load CRM data for context
  const { data: clients = [] } = useClients();
  const { data: invoices = [] } = useInvoices();
  const { data: supportTickets = [] } = useSupportTickets();
  const { data: debitCases = [] } = useDebitCases();
  const { data: opportunities = [] } = useOpportunities();
  const { data: tasks = [] } = useTasks();

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const context = {
        clients: {
          total: clients.length,
          active: clients.filter(c => c.status === 'active').length,
          needFollowUp: clients.filter(c => c.follow_up_needed).length,
          byStage: {
            preSales: clients.filter(c => c.sales_stage === 'pre_sales').length,
            negotiation: clients.filter(c => c.sales_stage === 'negotiation').length,
            closing: clients.filter(c => c.sales_stage === 'closing').length,
          }
        },
        invoices: {
          total: invoices.length,
          overdue: invoices.filter(i => i.status === 'overdue').length,
          overdueAmount: invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.total_amount || 0), 0),
        },
        support: {
          open: supportTickets.filter(t => t.status === 'open').length,
          urgent: supportTickets.filter(t => t.priority === 'urgent').length,
        },
        debit: {
          active: debitCases.filter(d => d.status !== 'closed').length,
          outstanding: debitCases.reduce((s, d) => s + (d.current_amount || 0), 0),
        },
        opportunities: {
          open: opportunities.filter(o => o.status === 'open').length,
          pipelineValue: opportunities.filter(o => o.status === 'open').reduce((s, o) => s + (o.value || 0), 0),
        },
        tasks: {
          overdue: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
        }
      };

      const prompt = `Analyze this CRM data and generate 3-5 actionable business recommendations in JSON format.

Data Summary:
- ${context.clients.total} clients (${context.clients.active} active, ${context.clients.needFollowUp} need follow-up)
- Sales Pipeline: ${context.clients.byStage.preSales} pre-sales, ${context.clients.byStage.negotiation} negotiation, ${context.clients.byStage.closing} closing
- ${context.invoices.overdue} overdue invoices ($${context.invoices.overdueAmount.toLocaleString()})
- ${context.support.open} open support tickets (${context.support.urgent} urgent)
- ${context.debit.active} active debit cases ($${context.debit.outstanding.toLocaleString()} outstanding)
- ${context.opportunities.open} open opportunities ($${context.opportunities.pipelineValue.toLocaleString()} pipeline)
- ${context.tasks.overdue} overdue tasks

Return ONLY valid JSON array with recommendations:
[{"title": "...", "description": "...", "category": "sales|clients|revenue|retention|team|process", "priority": "high|medium|low"}]`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], context: {} }),
      });

      if (!response.ok) throw new Error('AI generation failed');

      const reader = response.body?.getReader();
      let text = '';
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          for (const line of chunk.split('\n')) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const json = JSON.parse(line.slice(6));
                text += json.choices?.[0]?.delta?.content || '';
              } catch {}
            }
          }
        }
      }

      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const recs = JSON.parse(jsonMatch[0]);
        for (const rec of recs) {
          await supabase.from('ai_recommendations').insert({
            title: rec.title,
            description: rec.description,
            category: rec.category || 'process',
            priority: rec.priority || 'medium',
            status: 'pending',
          });
        }
        toast.success(`Generated ${recs.length} new recommendations`);
        refetch();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

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
          <div className="flex gap-2">
            <Button onClick={generateRecommendations} disabled={isGenerating} className="gap-2">
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 animate-spin" />Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" />Generate New</>
              )}
            </Button>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
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
