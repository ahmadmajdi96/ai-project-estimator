import { CustomerPortalLayout } from "@/components/customerportal/CustomerPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Zap,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useCustomerChatbots, useChatbotAnalytics } from "@/hooks/useCustomerPortal";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const mockAnalyticsData = [
  { date: "Mon", conversations: 45, messages: 234 },
  { date: "Tue", conversations: 52, messages: 287 },
  { date: "Wed", conversations: 48, messages: 256 },
  { date: "Thu", conversations: 61, messages: 312 },
  { date: "Fri", conversations: 55, messages: 289 },
  { date: "Sat", conversations: 32, messages: 178 },
  { date: "Sun", conversations: 28, messages: 145 },
];

const recentActivity = [
  { id: 1, action: "Rule triggered", detail: "Welcome Message", time: "2 min ago", type: "success" },
  { id: 2, action: "New conversation", detail: "Web Widget", time: "5 min ago", type: "info" },
  { id: 3, action: "Training completed", detail: "FAQ Bot", time: "15 min ago", type: "success" },
  { id: 4, action: "Failed query", detail: "Unknown intent", time: "23 min ago", type: "warning" },
  { id: 5, action: "Knowledge base updated", detail: "3 entries added", time: "1 hour ago", type: "info" },
];

export default function CustomerPortalDashboard() {
  const { data: chatbots, isLoading } = useCustomerChatbots();
  const navigate = useNavigate();

  const totalMessages = chatbots?.reduce((sum, bot) => sum + bot.used_messages, 0) || 0;
  const totalLimit = chatbots?.reduce((sum, bot) => sum + bot.max_messages_per_month, 0) || 1000;
  const usagePercentage = Math.round((totalMessages / totalLimit) * 100);

  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's an overview of your chatbots.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Chatbots</CardTitle>
              <Bot className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chatbots?.filter(b => b.status === 'active').length || 0}</div>
              <p className="text-xs text-muted-foreground">of {chatbots?.length || 0} total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMessages.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,284</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border-orange-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94.2%</div>
              <p className="text-xs text-muted-foreground">+2.1% from last week</p>
            </CardContent>
          </Card>
        </div>

        {/* Usage Meter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monthly Usage</CardTitle>
            <CardDescription>Message usage across all chatbots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {totalMessages.toLocaleString()} / {totalLimit.toLocaleString()} messages
                </span>
                <span className={usagePercentage > 80 ? "text-destructive font-medium" : "text-muted-foreground"}>
                  {usagePercentage}%
                </span>
              </div>
              <Progress value={usagePercentage} className="h-3" />
              {usagePercentage > 80 && (
                <p className="text-sm text-destructive flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  You're approaching your monthly limit. Consider upgrading your plan.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Conversations Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conversation Trends</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={mockAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="conversations" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Messages by Day */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Messages by Day</CardTitle>
              <CardDescription>Daily message volume</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={mockAnalyticsData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Bar dataKey="messages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* My Chatbots */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">My Chatbots</CardTitle>
                <CardDescription>Quick access to your chatbots</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/customer-portal/chatbots")}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading...</div>
              ) : chatbots && chatbots.length > 0 ? (
                <div className="space-y-3">
                  {chatbots.slice(0, 3).map((chatbot) => (
                    <div 
                      key={chatbot.id} 
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/customer-portal/chatbots/${chatbot.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-10 w-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: chatbot.brand_color + '20' }}
                        >
                          <Bot className="h-5 w-5" style={{ color: chatbot.brand_color }} />
                        </div>
                        <div>
                          <p className="font-medium">{chatbot.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {chatbot.used_messages} / {chatbot.max_messages_per_month} messages
                          </p>
                        </div>
                      </div>
                      <Badge variant={chatbot.status === 'active' ? 'default' : 'secondary'}>
                        {chatbot.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Bot className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No chatbots yet</p>
                  <p className="text-sm">Contact support to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest events across your chatbots</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate("/customer-portal/activity")}
              >
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-2">
                    <div className={`mt-0.5 h-2 w-2 rounded-full ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'warning' ? 'bg-yellow-500' :
                      'bg-blue-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{activity.action}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.detail}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/customer-portal/chatbots")}
              >
                <Zap className="h-5 w-5 text-yellow-500" />
                <span>Create Answer Rule</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/customer-portal/chatbots")}
              >
                <Bot className="h-5 w-5 text-blue-500" />
                <span>Add Knowledge Entry</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/customer-portal/chatbots")}
              >
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span>Test Chatbot</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate("/customer-portal/analytics")}
              >
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerPortalLayout>
  );
}
