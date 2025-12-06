import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Zap,
  Globe,
  Clock,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatbots, useConversations, useUsageMetrics } from '@/hooks/useChatFlow';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function ChatFlowDashboard() {
  const navigate = useNavigate();
  const { data: chatbots = [] } = useChatbots();
  const { data: conversations = [] } = useConversations();
  const { data: usageMetrics = [] } = useUsageMetrics();

  // Calculate metrics
  const activeChatbots = chatbots.filter(b => b.status === 'active').length;
  const activeConversations = conversations.filter(c => c.status === 'active').length;
  const totalMessages = usageMetrics.reduce((acc, m) => acc + (m.metric_type === 'messages' ? m.count : 0), 0);
  const totalUsers = usageMetrics.reduce((acc, m) => acc + (m.metric_type === 'users' ? m.unique_users : 0), 0);

  // Mock chart data
  const chartData = Array.from({ length: 7 }, (_, i) => ({
    date: format(subDays(new Date(), 6 - i), 'MMM dd'),
    conversations: Math.floor(Math.random() * 100) + 50,
    messages: Math.floor(Math.random() * 500) + 200,
    users: Math.floor(Math.random() * 80) + 30,
  }));

  const platformData = [
    { name: 'WhatsApp', value: 35 },
    { name: 'Facebook', value: 28 },
    { name: 'Website', value: 22 },
    { name: 'Telegram', value: 15 },
  ];

  const recentConversations = conversations.slice(0, 5);

  return (
    <ChatFlowLayout title="Dashboard">
      <div className="space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate('/chatflow/chatbots/new')} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Chatbot
          </Button>
          <Button variant="outline" onClick={() => navigate('/chatflow/templates')} className="gap-2">
            <Zap className="h-4 w-4" />
            Use Template
          </Button>
          <Button variant="outline" onClick={() => navigate('/chatflow/integrations')} className="gap-2">
            <Globe className="h-4 w-4" />
            Add Integration
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeChatbots}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+2</span>
                <span className="ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeConversations || 247}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+18%</span>
                <span className="ml-1">from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers || '3,482'}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">+12%</span>
                <span className="ml-1">from last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.2s</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <ArrowDownRight className="h-3 w-3 text-green-500 mr-1" />
                <span className="text-green-500">-0.3s</span>
                <span className="ml-1">improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Conversation Trend */}
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Conversation Trends</CardTitle>
                  <CardDescription>Daily conversations over the last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="conversations" 
                        stroke="hsl(var(--primary))" 
                        fill="hsl(var(--primary))" 
                        fillOpacity={0.2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Platform Distribution */}
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Platform Distribution</CardTitle>
                  <CardDescription>Conversations by platform</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={platformData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {platformData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Active Chatbots */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Your Chatbots</CardTitle>
                    <CardDescription>Manage your AI assistants</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/chatflow/chatbots')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {chatbots.length > 0 ? (
                      chatbots.slice(0, 4).map((bot) => (
                        <div key={bot.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/chatflow/chatbots/${bot.id}`)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Bot className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{bot.name}</p>
                              <p className="text-xs text-muted-foreground">{bot.type}</p>
                            </div>
                          </div>
                          <Badge variant={bot.status === 'active' ? 'default' : 'secondary'}>
                            {bot.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground mb-3">No chatbots yet</p>
                        <Button onClick={() => navigate('/chatflow/chatbots/new')}>
                          Create Your First Chatbot
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Conversations */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Conversations</CardTitle>
                    <CardDescription>Latest user interactions</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/chatflow/conversations')}>
                    View All
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentConversations.length > 0 ? (
                      recentConversations.map((conv) => (
                        <div key={conv.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => navigate(`/chatflow/conversations/${conv.id}`)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                              <span className="text-sm font-medium">{conv.visitor_name?.[0] || 'U'}</span>
                            </div>
                            <div>
                              <p className="font-medium">{conv.visitor_name || 'Unknown User'}</p>
                              <p className="text-xs text-muted-foreground">{conv.platform}</p>
                            </div>
                          </div>
                          <Badge variant={conv.status === 'active' ? 'default' : 'secondary'}>
                            {conv.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-muted-foreground">No conversations yet</p>
                        <p className="text-xs text-muted-foreground">Conversations will appear once your chatbot starts receiving messages</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Messages Over Time</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Bar dataKey="messages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(var(--chart-2))" 
                        fill="hsl(var(--chart-2))" 
                        fillOpacity={0.2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resolution Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">87%</div>
                  <Progress value={87} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">+5% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">User Satisfaction</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold">4.6</span>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Based on 1,234 ratings</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Automation Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">73%</div>
                  <Progress value={73} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">Conversations handled by AI</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ChatFlowLayout>
  );
}
