import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Key, 
  Copy, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Globe,
  Webhook,
  Code,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Mock API keys
const mockApiKeys = [
  {
    id: '1',
    name: 'Production API Key',
    key: 'cf_live_xxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'cf_live_',
    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    status: 'active',
  },
  {
    id: '2',
    name: 'Development API Key',
    key: 'cf_test_xxxxxxxxxxxxxxxxxxxxxxxxxx',
    prefix: 'cf_test_',
    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'active',
  },
];

// Mock webhooks
const mockWebhooks = [
  {
    id: '1',
    url: 'https://api.example.com/webhooks/chatflow',
    events: ['conversation.started', 'conversation.ended', 'message.received'],
    status: 'active',
    created: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    lastTriggered: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

export default function ApiWebhooksPage() {
  const [apiKeys] = useState(mockApiKeys);
  const [webhooks] = useState(mockWebhooks);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [newWebhookUrl, setNewWebhookUrl] = useState('');

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const generateNewKey = () => {
    toast.success('New API key generated');
  };

  const addWebhook = () => {
    if (!newWebhookUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }
    toast.success('Webhook added successfully');
    setNewWebhookUrl('');
  };

  return (
    <ChatFlowLayout title="API & Webhooks">
      <Tabs defaultValue="api-keys" className="space-y-6">
        <TabsList>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="gap-2">
            <Webhook className="h-4 w-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="docs" className="gap-2">
            <Code className="h-4 w-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    Manage your API keys for accessing the ChatFlow API
                  </CardDescription>
                </div>
                <Button onClick={generateNewKey} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Generate New Key
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiKeys.map((apiKey) => (
                <div 
                  key={apiKey.id} 
                  className="p-4 rounded-lg border bg-card"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{apiKey.name}</p>
                        <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                          {apiKey.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
                          {showKeys[apiKey.id] 
                            ? apiKey.key 
                            : `${apiKey.prefix}${'•'.repeat(20)}`
                          }
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleKeyVisibility(apiKey.id)}
                        >
                          {showKeys[apiKey.id] ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => copyToClipboard(apiKey.key)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {format(new Date(apiKey.created), 'MMM d, yyyy')}</span>
                        <span>Last used: {format(new Date(apiKey.lastUsed), 'MMM d, HH:mm')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </Button>
                      <Button variant="outline" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
              <CardDescription>Your API usage this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">12,458</p>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">99.8%</p>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-2xl font-bold">42ms</p>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add Webhook</CardTitle>
              <CardDescription>
                Configure webhooks to receive real-time notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="webhook-url" className="sr-only">Webhook URL</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://your-server.com/webhook"
                    value={newWebhookUrl}
                    onChange={(e) => setNewWebhookUrl(e.target.value)}
                  />
                </div>
                <Button onClick={addWebhook} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Webhook
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Webhooks</CardTitle>
              <CardDescription>
                Manage your configured webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {webhooks.length > 0 ? (
                webhooks.map((webhook) => (
                  <div 
                    key={webhook.id} 
                    className="p-4 rounded-lg border bg-card"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <code className="text-sm font-mono">{webhook.url}</code>
                          <Badge variant={webhook.status === 'active' ? 'default' : 'secondary'}>
                            {webhook.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Created: {format(new Date(webhook.created), 'MMM d, yyyy')}</span>
                          <span>Last triggered: {format(new Date(webhook.lastTriggered), 'MMM d, HH:mm')}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Test
                        </Button>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Webhook className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No webhooks configured</h3>
                  <p className="text-muted-foreground">
                    Add a webhook to receive real-time notifications
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Events</CardTitle>
              <CardDescription>
                Events you can subscribe to via webhooks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { event: 'conversation.started', description: 'When a new conversation begins' },
                  { event: 'conversation.ended', description: 'When a conversation is closed' },
                  { event: 'message.received', description: 'When a new message is received' },
                  { event: 'message.sent', description: 'When a message is sent' },
                  { event: 'chatbot.activated', description: 'When a chatbot goes live' },
                  { event: 'chatbot.deactivated', description: 'When a chatbot is paused' },
                  { event: 'escalation.triggered', description: 'When human escalation is triggered' },
                  { event: 'training.completed', description: 'When AI training completes' },
                ].map((item) => (
                  <div key={item.event} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <code className="text-sm font-mono">{item.event}</code>
                      <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Quick start guide and API reference
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">Base URL</h4>
                <code className="block p-3 rounded-lg bg-muted font-mono text-sm">
                  https://api.chatflow.ai/v1
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Authentication</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Include your API key in the Authorization header:
                </p>
                <code className="block p-3 rounded-lg bg-muted font-mono text-sm">
                  Authorization: Bearer YOUR_API_KEY
                </code>
              </div>

              <div>
                <h4 className="font-medium mb-2">Example Request</h4>
                <pre className="p-3 rounded-lg bg-muted font-mono text-sm overflow-x-auto">
{`curl -X POST https://api.chatflow.ai/v1/messages \\
  -H "Authorization: Bearer cf_live_xxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "chatbot_id": "xxx",
    "message": "Hello!",
    "user_id": "user_123"
  }'`}
                </pre>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="gap-2">
                  <Code className="h-4 w-4" />
                  Full API Reference
                </Button>
                <Button variant="outline" className="gap-2">
                  <Globe className="h-4 w-4" />
                  SDK Downloads
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ChatFlowLayout>
  );
}
