import { CustomerPortalLayout } from "@/components/customerportal/CustomerPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  Settings, 
  BarChart3, 
  Zap, 
  BookOpen,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  ArrowLeft,
  GraduationCap,
  FileText,
  TestTube,
  ExternalLink
} from "lucide-react";
import { useCustomerChatbot, useAnswerRules, useKnowledgeBaseEntries, useTrainingQuestions } from "@/hooks/useCustomerPortal";
import { useNavigate, useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

const mockWeeklyData = [
  { day: "Mon", conversations: 45, messages: 234 },
  { day: "Tue", conversations: 52, messages: 287 },
  { day: "Wed", conversations: 48, messages: 256 },
  { day: "Thu", conversations: 61, messages: 312 },
  { day: "Fri", conversations: 55, messages: 289 },
  { day: "Sat", conversations: 32, messages: 178 },
  { day: "Sun", conversations: 28, messages: 145 },
];

export default function ChatbotDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: chatbot, isLoading: chatbotLoading } = useCustomerChatbot(id || '');
  const { data: rules } = useAnswerRules(id || '');
  const { data: kbEntries } = useKnowledgeBaseEntries(id || '');
  const { data: trainingQuestions } = useTrainingQuestions(id || '');

  if (chatbotLoading) {
    return (
      <CustomerPortalLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading chatbot...</div>
        </div>
      </CustomerPortalLayout>
    );
  }

  if (!chatbot) {
    return (
      <CustomerPortalLayout>
        <div className="text-center py-12">
          <Bot className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-xl font-semibold mb-2">Chatbot Not Found</h3>
          <Button onClick={() => navigate("/customer-portal/chatbots")}>
            Back to Chatbots
          </Button>
        </div>
      </CustomerPortalLayout>
    );
  }

  const usagePercentage = Math.round((chatbot.used_messages / chatbot.max_messages_per_month) * 100);

  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/customer-portal/chatbots")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div 
              className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg"
              style={{ backgroundColor: chatbot.brand_color + '20' }}
            >
              <Bot className="h-8 w-8" style={{ color: chatbot.brand_color }} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">{chatbot.name}</h1>
                <Badge variant={chatbot.status === 'active' ? 'default' : 'secondary'}>
                  {chatbot.status}
                </Badge>
              </div>
              <p className="text-muted-foreground capitalize">{chatbot.type.replace('_', ' ')} Chatbot</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/customer-portal/chatbots/${id}/test`)}>
              <TestTube className="h-4 w-4 mr-2" />
              Test Chat
            </Button>
            <Button onClick={() => navigate(`/customer-portal/chatbots/${id}/settings`)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages Used</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chatbot.used_messages.toLocaleString()}</div>
              <Progress value={usagePercentage} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                of {chatbot.max_messages_per_month.toLocaleString()} monthly
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answer Rules</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rules?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {rules?.filter(r => r.is_active).length || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Knowledge Entries</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kbEntries?.length || 0}</div>
              <p className="text-xs text-muted-foreground">articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Training Q&As</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{trainingQuestions?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                {trainingQuestions?.filter(q => q.training_status === 'trained').length || 0} trained
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Button 
            variant="outline" 
            className="h-auto py-4"
            onClick={() => navigate(`/customer-portal/chatbots/${id}/rules`)}
          >
            <Zap className="h-5 w-5 mr-2 text-yellow-500" />
            Manage Rules
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4"
            onClick={() => navigate(`/customer-portal/chatbots/${id}/knowledge-base`)}
          >
            <BookOpen className="h-5 w-5 mr-2 text-blue-500" />
            Knowledge Base
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4"
            onClick={() => navigate(`/customer-portal/chatbots/${id}/training`)}
          >
            <GraduationCap className="h-5 w-5 mr-2 text-green-500" />
            Training
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4"
            onClick={() => navigate(`/customer-portal/chatbots/${id}/import`)}
          >
            <FileText className="h-5 w-5 mr-2 text-purple-500" />
            Import Data
          </Button>
          <Button 
            variant="outline" 
            className="h-auto py-4"
            onClick={() => navigate(`/customer-portal/chatbots/${id}/analytics`)}
          >
            <BarChart3 className="h-5 w-5 mr-2 text-orange-500" />
            Analytics
          </Button>
        </div>

        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>Conversations and messages over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs" />
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
                  name="Conversations"
                />
                <Line 
                  type="monotone" 
                  dataKey="messages" 
                  stroke="hsl(142, 76%, 36%)" 
                  strokeWidth={2}
                  name="Messages"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chatbot Info */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Chatbot Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Welcome Message</p>
                  <p className="text-sm font-medium">{chatbot.welcome_message}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fallback Message</p>
                  <p className="text-sm font-medium">{chatbot.fallback_message}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Brand Color</p>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-6 w-6 rounded border" 
                      style={{ backgroundColor: chatbot.brand_color }}
                    />
                    <span className="text-sm font-medium">{chatbot.brand_color}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <p className="text-sm font-medium">{chatbot.subscription_tier || 'Standard'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Purchase Date</p>
                  <p className="text-sm font-medium">
                    {format(new Date(chatbot.purchase_date), 'MMM d, yyyy')}
                  </p>
                </div>
                {chatbot.expiry_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(chatbot.expiry_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
                {chatbot.renewal_date && (
                  <div>
                    <p className="text-sm text-muted-foreground">Renewal Date</p>
                    <p className="text-sm font-medium">
                      {format(new Date(chatbot.renewal_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Platform Integrations</p>
                  <div className="flex gap-1 flex-wrap mt-1">
                    {chatbot.platform_integrations && chatbot.platform_integrations.length > 0 ? (
                      chatbot.platform_integrations.map((platform) => (
                        <Badge key={platform} variant="secondary" className="text-xs">
                          {platform}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">None configured</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CustomerPortalLayout>
  );
}
