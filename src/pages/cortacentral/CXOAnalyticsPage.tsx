import { CortaCentralLayout } from '@/components/cortacentral/CortaCentralLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCXOConversations, useCXOConnectors, useCXOQueues } from '@/hooks/useCortaCentral';
import { BarChart3, TrendingUp, Clock, DollarSign, Users, Phone, MessageCircle, Mail } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

export default function CXOAnalyticsPage() {
  const { data: conversations } = useCXOConversations();
  const { data: connectors } = useCXOConnectors();
  const { data: queues } = useCXOQueues();

  // Calculate metrics
  const channelData = [
    { name: 'Voice', value: conversations?.filter(c => c.primary_channel === 'voice').length || 0 },
    { name: 'SMS', value: conversations?.filter(c => c.primary_channel === 'sms').length || 0 },
    { name: 'Email', value: conversations?.filter(c => c.primary_channel === 'email').length || 0 },
    { name: 'Webchat', value: conversations?.filter(c => c.primary_channel === 'webchat').length || 0 },
    { name: 'WhatsApp', value: conversations?.filter(c => c.primary_channel === 'whatsapp').length || 0 },
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Open', value: conversations?.filter(c => c.status === 'open').length || 0 },
    { name: 'Pending', value: conversations?.filter(c => c.status === 'pending').length || 0 },
    { name: 'Resolved', value: conversations?.filter(c => c.status === 'resolved').length || 0 },
    { name: 'Closed', value: conversations?.filter(c => c.status === 'closed').length || 0 },
  ];

  const providerHealth = connectors?.map(c => ({
    name: c.display_name,
    status: c.health_status,
    enabled: c.is_enabled,
  })) || [];

  return (
    <CortaCentralLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Insights</h1>
          <p className="text-muted-foreground">Performance metrics and cost analysis</p>
        </div>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="providers" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="costs" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Costs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/10">
                      <MessageCircle className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{conversations?.length || 0}</div>
                      <p className="text-sm text-muted-foreground">Total Conversations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-500/10">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{connectors?.length || 0}</div>
                      <p className="text-sm text-muted-foreground">Active Providers</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/10">
                      <Clock className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">-</div>
                      <p className="text-sm text-muted-foreground">Avg Handle Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-amber-500/10">
                      <TrendingUp className="h-6 w-6 text-amber-500" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{queues?.length || 0}</div>
                      <p className="text-sm text-muted-foreground">Active Queues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Conversations by Channel</CardTitle>
                  <CardDescription>Distribution across communication channels</CardDescription>
                </CardHeader>
                <CardContent>
                  {channelData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={channelData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {channelData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No conversation data
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conversation Status</CardTitle>
                  <CardDescription>Current status distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Provider Performance</CardTitle>
                <CardDescription>Health and reliability metrics for connected providers</CardDescription>
              </CardHeader>
              <CardContent>
                {providerHealth.length > 0 ? (
                  <div className="space-y-4">
                    {providerHealth.map((provider, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{provider.name}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            Status: {provider.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            provider.status === 'healthy' ? 'text-green-500' :
                            provider.status === 'degraded' ? 'text-amber-500' : 'text-red-500'
                          }`}>
                            {provider.status === 'healthy' ? '99.9%' : provider.status === 'degraded' ? '95.0%' : '0%'}
                          </div>
                          <p className="text-xs text-muted-foreground">Uptime</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No providers configured
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="costs" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
                <CardDescription>Provider and channel cost breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Cost tracking requires provider integration</p>
                  <p className="text-sm">Configure providers to see cost analytics</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CortaCentralLayout>
  );
}
