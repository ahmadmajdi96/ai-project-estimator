import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, Users, Loader2, LogOut, Bot, Calculator, Truck, 
  Brain, TrendingUp, MessageSquare, Lightbulb, Scale, BarChart3,
  DollarSign, Package, UserCheck, Activity, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useShipments, useCarriers } from '@/hooks/useLogistics';
import { useClients } from '@/hooks/useClients';
import { useEmployees } from '@/hooks/useEmployees';
import { useTasks } from '@/hooks/useTasks';
import { useInvoices } from '@/hooks/useInvoices';
import { useEnterpriseAI } from '@/hooks/useEnterpriseAI';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';

const portals = [
  { id: 'overview', name: 'Overview', icon: LayoutDashboard, path: '/', gradient: 'from-slate-500 to-zinc-600' },
  { id: 'crm', name: 'CRM', icon: Users, path: '/crm', gradient: 'from-blue-500 to-cyan-500' },
  { id: 'management', name: 'Management', icon: UserCheck, path: '/management', gradient: 'from-purple-500 to-pink-500' },
  { id: 'accounting', name: 'Accounting', icon: Calculator, path: '/accounting', gradient: 'from-amber-500 to-orange-500' },
  { id: 'logistics', name: 'Logistics', icon: Truck, path: '/logistics', gradient: 'from-emerald-500 to-teal-500' },
  { id: 'chatflow', name: 'ChatFlow', icon: Bot, path: '/chatflow', gradient: 'from-rose-500 to-red-500' },
  { id: 'ai', name: 'AI Center', icon: Brain, path: '/?tab=ai', gradient: 'from-violet-500 to-purple-600' },
];

export default function Portal() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('overview');
  const [aiInput, setAiInput] = useState('');

  // Data hooks
  const { data: shipments = [] } = useShipments();
  const { data: carriers = [] } = useCarriers();
  const { data: clients = [] } = useClients();
  const { data: employees = [] } = useEmployees();
  const { data: tasks = [] } = useTasks();
  const { data: invoices = [] } = useInvoices();

  // AI context with all data
  const aiContext = useMemo(() => ({
    shipments: { total: shipments.length, inTransit: shipments.filter(s => s.status === 'in_transit').length },
    carriers: { total: carriers.length, active: carriers.filter(c => c.is_active).length },
    clients: { total: clients.length },
    employees: { total: employees.length },
    tasks: { total: tasks.length, pending: tasks.filter(t => t.status === 'todo').length },
    invoices: { total: invoices.length },
  }), [shipments, carriers, clients, employees, tasks, invoices]);

  const { messages, isLoading: aiLoading, sendMessage, clearMessages } = useEnterpriseAI({ context: aiContext });

  // Parse URL for tab
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) setActiveTab(tab);
  }, [location]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handlePortalClick = (portal: typeof portals[0]) => {
    if (portal.id === 'overview') {
      setActiveTab('overview');
      navigate('/');
    } else if (portal.id === 'ai') {
      setActiveTab('ai');
      navigate('/?tab=ai');
    } else {
      navigate(portal.path);
    }
  };

  const handleAISend = () => {
    if (aiInput.trim() && !aiLoading) {
      sendMessage(aiInput);
      setAiInput('');
    }
  };

  // Calculate metrics
  const totalRevenue = shipments.reduce((sum, s) => sum + (s.total_revenue || 0), 0) / 100;
  const totalMargin = shipments.reduce((sum, s) => sum + (s.margin || 0), 0) / 100;
  const activeShipments = shipments.filter(s => ['dispatched', 'in_transit'].includes(s.status || '')).length;
  const pendingTasks = tasks.filter(t => t.status === 'todo').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Top Navigation */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">CortaneX AI</h1>
                <p className="text-xs text-muted-foreground">Enterprise Suite</p>
              </div>
            </div>
            
            {/* Portal Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {portals.map((portal) => {
                const Icon = portal.icon;
                const isActive = activeTab === portal.id || 
                  (portal.id !== 'overview' && portal.id !== 'ai' && location.pathname.startsWith(portal.path));
                return (
                  <Button
                    key={portal.id}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`gap-2 ${isActive ? `bg-gradient-to-r ${portal.gradient}` : ''}`}
                    onClick={() => handlePortalClick(portal)}
                  >
                    <Icon className="h-4 w-4" />
                    {portal.name}
                  </Button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{role?.replace('_', ' ')}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-b border-border/50 bg-background/80 overflow-x-auto">
        <div className="flex items-center gap-1 p-2 min-w-max">
          {portals.map((portal) => {
            const Icon = portal.icon;
            const isActive = activeTab === portal.id;
            return (
              <Button
                key={portal.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className={`gap-1 text-xs ${isActive ? `bg-gradient-to-r ${portal.gradient}` : ''}`}
                onClick={() => handlePortalClick(portal)}
              >
                <Icon className="h-3 w-3" />
                {portal.name}
              </Button>
            );
          })}
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-blue-600 mb-2">
                    <Users className="h-4 w-4" />
                    <span className="text-xs font-medium">Clients</span>
                  </div>
                  <p className="text-2xl font-bold">{clients.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-emerald-600 mb-2">
                    <Truck className="h-4 w-4" />
                    <span className="text-xs font-medium">Shipments</span>
                  </div>
                  <p className="text-2xl font-bold">{shipments.length}</p>
                  <p className="text-xs text-muted-foreground">{activeShipments} active</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-amber-600 mb-2">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-xs font-medium">Revenue</span>
                  </div>
                  <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-green-500/10 to-lime-500/10 border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-600 mb-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-xs font-medium">Margin</span>
                  </div>
                  <p className="text-2xl font-bold">${totalMargin.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">Employees</span>
                  </div>
                  <p className="text-2xl font-bold">{employees.length}</p>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-rose-500/10 to-red-500/10 border-rose-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-rose-600 mb-2">
                    <Activity className="h-4 w-4" />
                    <span className="text-xs font-medium">Tasks</span>
                  </div>
                  <p className="text-2xl font-bold">{tasks.length}</p>
                  <p className="text-xs text-muted-foreground">{pendingTasks} pending</p>
                </CardContent>
              </Card>
            </div>

            {/* Portal Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portals.filter(p => !['overview', 'ai'].includes(p.id)).map((portal) => {
                const Icon = portal.icon;
                return (
                  <Card 
                    key={portal.id}
                    className="group cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-primary/50"
                    onClick={() => navigate(portal.path)}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${portal.gradient} opacity-0 group-hover:opacity-5 transition-opacity rounded-lg`} />
                    <CardHeader className="pb-2">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${portal.gradient} flex items-center justify-center mb-3`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle>{portal.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="secondary" className="text-xs">
                          {portal.id === 'crm' && `${clients.length} clients`}
                          {portal.id === 'management' && `${employees.length} employees`}
                          {portal.id === 'accounting' && `${invoices.length} invoices`}
                          {portal.id === 'logistics' && `${shipments.length} shipments`}
                          {portal.id === 'chatflow' && 'AI Chatbots'}
                        </Badge>
                        <Button variant="ghost" size="sm">Open →</Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Quick AI Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-violet-500" />
                  AI Quick Insights
                </CardTitle>
                <CardDescription>Powered by CortaneX AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">Positive</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {activeShipments > 0 ? `${activeShipments} shipments in transit generating revenue` : 'Operations running smoothly'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="font-medium text-amber-700">Attention</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pendingTasks > 0 ? `${pendingTasks} tasks require attention` : 'All tasks up to date'}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-700">Opportunity</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {carriers.filter(c => c.is_active).length} active carriers ready for assignments
                    </p>
                  </div>
                </div>
                <Button 
                  className="w-full mt-4 bg-gradient-to-r from-violet-500 to-purple-600"
                  onClick={() => { setActiveTab('ai'); navigate('/?tab=ai'); }}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Open AI Center for Deep Analysis
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'ai' && (
          <div className="space-y-6">
            <Tabs defaultValue="chat" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="chat" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  AI Chat
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Insights
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Recommendations
                </TabsTrigger>
                <TabsTrigger value="decisions" className="gap-2">
                  <Scale className="h-4 w-4" />
                  Decisions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="mt-4">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-violet-500" />
                          CortaneX AI Assistant
                        </CardTitle>
                        <CardDescription>Ask anything about your business data across all portals</CardDescription>
                      </div>
                      {messages.length > 0 && (
                        <Button variant="outline" size="sm" onClick={clearMessages}>Clear Chat</Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-4">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {messages.length === 0 && (
                          <div className="text-center py-12 text-muted-foreground">
                            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Ask me anything about your business data!</p>
                            <div className="flex flex-wrap justify-center gap-2 mt-4">
                              {[
                                "What's my revenue trend?",
                                "Analyze pending tasks",
                                "Show carrier performance",
                                "Summarize client activity"
                              ].map(suggestion => (
                                <Button
                                  key={suggestion}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendMessage(suggestion)}
                                >
                                  {suggestion}
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                        {messages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.role === 'user' 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
                              {msg.role === 'assistant' ? (
                                <MarkdownRenderer content={msg.content} />
                              ) : (
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        {aiLoading && (
                          <div className="flex justify-start">
                            <div className="bg-muted rounded-lg p-3">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>
                    <div className="flex gap-2 mt-4 pt-4 border-t">
                      <Textarea
                        placeholder="Ask about your business data..."
                        value={aiInput}
                        onChange={(e) => setAiInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleAISend();
                          }
                        }}
                        className="min-h-[60px] resize-none"
                      />
                      <Button 
                        onClick={handleAISend} 
                        disabled={aiLoading || !aiInput.trim()}
                        className="bg-gradient-to-r from-violet-500 to-purple-600"
                      >
                        Send
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="insights" className="mt-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-500" />
                        Revenue Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Revenue</span>
                          <span className="font-bold text-xl">${totalRevenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Total Margin</span>
                          <span className="font-bold text-lg text-green-600">${totalMargin.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Margin %</span>
                          <Badge variant={totalRevenue > 0 ? "default" : "secondary"}>
                            {totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : 0}%
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-blue-500" />
                        Operations Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Active Shipments</span>
                          <Badge>{activeShipments}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Pending Tasks</span>
                          <Badge variant={pendingTasks > 5 ? "destructive" : "secondary"}>{pendingTasks}</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Active Carriers</span>
                          <Badge variant="outline">{carriers.filter(c => c.is_active).length}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" />
                      AI Recommendations
                    </CardTitle>
                    <CardDescription>Based on analysis of all your business data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingTasks > 3 && (
                        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Task Backlog Alert</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                You have {pendingTasks} pending tasks. Consider prioritizing or delegating to maintain productivity.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      {carriers.filter(c => !c.is_active).length > 0 && (
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="flex items-start gap-3">
                            <Truck className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div>
                              <p className="font-medium">Inactive Carriers</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {carriers.filter(c => !c.is_active).length} carriers are inactive. Review and reactivate or remove to optimize your carrier network.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          <div>
                            <p className="font-medium">Keep It Up!</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              Your operations are running smoothly with {activeShipments} active shipments and {carriers.filter(c => c.is_active).length} carriers ready.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="decisions" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="h-5 w-5 text-violet-500" />
                      Decision Support
                    </CardTitle>
                    <CardDescription>AI-powered decision analysis and ranking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No pending decisions</p>
                      <p className="text-sm mt-2">Use the AI Chat to analyze decisions and get recommendations</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => {
                          const tabsList = document.querySelector('[role="tablist"]');
                          const chatTab = tabsList?.querySelector('[value="chat"]') as HTMLElement;
                          chatTab?.click();
                          setAiInput("Help me analyze a business decision: ");
                        }}
                      >
                        Start Decision Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
