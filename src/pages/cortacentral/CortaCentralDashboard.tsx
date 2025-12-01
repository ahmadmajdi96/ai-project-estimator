import { CortaCentralLayout } from '@/components/cortacentral/CortaCentralLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCXOConversations, useCXOConnectors, useCXOQueues, useCXOAIJobs } from '@/hooks/useCortaCentral';
import { MessageSquare, Plug, Activity, Clock, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';

export default function CortaCentralDashboard() {
  const { data: conversations } = useCXOConversations();
  const { data: connectors } = useCXOConnectors();
  const { data: queues } = useCXOQueues();
  const { data: aiJobs } = useCXOAIJobs();

  const openConversations = conversations?.filter(c => c.status === 'open').length || 0;
  const healthyConnectors = connectors?.filter(c => c.health_status === 'healthy').length || 0;
  const totalConnectors = connectors?.length || 0;
  const pendingAIJobs = aiJobs?.filter(j => j.status === 'pending' || j.status === 'processing').length || 0;

  const stats = [
    {
      title: 'Open Conversations',
      value: openConversations,
      subtitle: `${conversations?.length || 0} total`,
      icon: MessageSquare,
      gradient: 'from-cyan-500 to-blue-500',
    },
    {
      title: 'Provider Health',
      value: `${healthyConnectors}/${totalConnectors}`,
      subtitle: 'Healthy connectors',
      icon: Activity,
      gradient: healthyConnectors === totalConnectors ? 'from-green-500 to-emerald-500' : 'from-amber-500 to-orange-500',
    },
    {
      title: 'Active Queues',
      value: queues?.length || 0,
      subtitle: 'Routing queues',
      icon: Zap,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'AI Processing',
      value: pendingAIJobs,
      subtitle: 'Jobs in queue',
      icon: TrendingUp,
      gradient: 'from-indigo-500 to-violet-500',
    },
  ];

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500/10 text-green-500';
      case 'degraded': return 'bg-amber-500/10 text-amber-500';
      case 'down': return 'bg-red-500/10 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <CortaCentralLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">CX Orchestrator Dashboard</h1>
          <p className="text-muted-foreground">Multi-provider customer experience platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="relative overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plug className="h-5 w-5" />
                Provider Status
              </CardTitle>
              <CardDescription>Real-time health of connected providers</CardDescription>
            </CardHeader>
            <CardContent>
              {connectors && connectors.length > 0 ? (
                <div className="space-y-3">
                  {connectors.map((connector) => (
                    <div key={connector.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getHealthColor(connector.health_status)}`}>
                          {getStatusIcon(connector.health_status)}
                        </div>
                        <div>
                          <h4 className="font-medium">{connector.display_name}</h4>
                          <p className="text-xs text-muted-foreground capitalize">{connector.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <Badge className={getHealthColor(connector.health_status)}>
                        {connector.health_status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No connectors configured</p>
                  <p className="text-sm">Add providers to start orchestrating</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Conversations
              </CardTitle>
              <CardDescription>Latest customer interactions</CardDescription>
            </CardHeader>
            <CardContent>
              {conversations && conversations.length > 0 ? (
                <div className="space-y-3">
                  {conversations.slice(0, 5).map((conv) => (
                    <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div>
                        <h4 className="font-medium">
                          {conv.contact?.first_name || conv.contact?.primary_email || 'Unknown Contact'}
                        </h4>
                        <p className="text-xs text-muted-foreground capitalize">
                          {conv.primary_channel} • {conv.priority} priority
                        </p>
                      </div>
                      <Badge variant={conv.status === 'open' ? 'default' : 'secondary'}>
                        {conv.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No conversations yet</p>
                  <p className="text-sm">Conversations will appear here when received</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Active Queues
            </CardTitle>
            <CardDescription>Routing queue status and load</CardDescription>
          </CardHeader>
          <CardContent>
            {queues && queues.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {queues.map((queue) => (
                  <div key={queue.id} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{queue.name}</h4>
                      {queue.is_default && <Badge variant="secondary">Default</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{queue.description || 'No description'}</p>
                    <div className="flex flex-wrap gap-1">
                      {queue.channel_types.map((channel) => (
                        <Badge key={channel} variant="outline" className="text-xs capitalize">
                          {channel}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 capitalize">
                      Strategy: {queue.routing_strategy.replace('_', ' ')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No queues configured</p>
                <p className="text-sm">Create queues to route conversations</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CortaCentralLayout>
  );
}
