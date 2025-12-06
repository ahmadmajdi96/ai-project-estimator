import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { 
  Search,
  ExternalLink,
  Check,
  AlertCircle,
  Clock,
  Settings,
  Plus
} from 'lucide-react';

const integrations = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    description: 'Connect your chatbot to WhatsApp Business API',
    category: 'messaging',
    icon: '💬',
    status: 'available',
    popular: true,
    features: ['Text messages', 'Media sharing', 'Quick replies', 'Template messages'],
  },
  {
    id: 'facebook',
    name: 'Facebook Messenger',
    description: 'Integrate with Facebook Messenger for your Facebook pages',
    category: 'messaging',
    icon: '📘',
    status: 'available',
    popular: true,
    features: ['Text messages', 'Buttons', 'Carousels', 'Quick replies'],
  },
  {
    id: 'instagram',
    name: 'Instagram Direct',
    description: 'Connect to Instagram Direct messages for business accounts',
    category: 'messaging',
    icon: '📸',
    status: 'available',
    popular: true,
    features: ['Direct messages', 'Story replies', 'Quick replies'],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Build a Telegram bot with your chatbot logic',
    category: 'messaging',
    icon: '✈️',
    status: 'available',
    popular: true,
    features: ['Text messages', 'Inline keyboards', 'Media sharing'],
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Add your chatbot to Slack workspaces',
    category: 'messaging',
    icon: '💼',
    status: 'available',
    popular: false,
    features: ['Direct messages', 'Channels', 'Threads', 'Interactive components'],
  },
  {
    id: 'discord',
    name: 'Discord',
    description: 'Create a Discord bot for your server',
    category: 'messaging',
    icon: '🎮',
    status: 'available',
    popular: false,
    features: ['Text channels', 'Direct messages', 'Slash commands'],
  },
  {
    id: 'web-widget',
    name: 'Website Widget',
    description: 'Embed a chat widget on your website',
    category: 'website',
    icon: '🌐',
    status: 'available',
    popular: true,
    features: ['Customizable design', 'Mobile responsive', 'Rich messages'],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: 'Process payments directly in conversations',
    category: 'payment',
    icon: '💳',
    status: 'available',
    popular: false,
    features: ['Payment links', 'Subscriptions', 'Invoices'],
  },
  {
    id: 'zapier',
    name: 'Zapier',
    description: 'Connect with 5000+ apps through Zapier',
    category: 'automation',
    icon: '⚡',
    status: 'coming_soon',
    popular: false,
    features: ['Triggers', 'Actions', 'Multi-step workflows'],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Sync conversations and leads with HubSpot CRM',
    category: 'crm',
    icon: '🧲',
    status: 'available',
    popular: false,
    features: ['Contact sync', 'Deal creation', 'Activity logging'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Integrate with Salesforce for enterprise CRM',
    category: 'crm',
    icon: '☁️',
    status: 'coming_soon',
    popular: false,
    features: ['Lead management', 'Case creation', 'Custom objects'],
  },
  {
    id: 'google-sheets',
    name: 'Google Sheets',
    description: 'Send conversation data to Google Sheets',
    category: 'automation',
    icon: '📊',
    status: 'available',
    popular: false,
    features: ['Data export', 'Lead capture', 'Form responses'],
  },
];

const categories = [
  { id: 'all', name: 'All' },
  { id: 'messaging', name: 'Messaging' },
  { id: 'website', name: 'Website' },
  { id: 'crm', name: 'CRM' },
  { id: 'payment', name: 'Payment' },
  { id: 'automation', name: 'Automation' },
];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [connectedIntegrations, setConnectedIntegrations] = useState<string[]>(['whatsapp', 'web-widget']);

  const filteredIntegrations = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      int.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || int.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const connectedList = integrations.filter(int => connectedIntegrations.includes(int.id));
  const availableList = filteredIntegrations.filter(int => !connectedIntegrations.includes(int.id));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="secondary" className="bg-green-500/10 text-green-600">Available</Badge>;
      case 'coming_soon':
        return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600">Coming Soon</Badge>;
      case 'beta':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600">Beta</Badge>;
      default:
        return null;
    }
  };

  const handleConnect = (id: string) => {
    setConnectedIntegrations(prev => [...prev, id]);
  };

  const handleDisconnect = (id: string) => {
    setConnectedIntegrations(prev => prev.filter(i => i !== id));
  };

  return (
    <ChatFlowLayout title="Integrations">
      <div className="space-y-6">
        {/* Connected Integrations */}
        {connectedList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Connected Integrations
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {connectedList.map((integration) => (
                <Card key={integration.id} className="border-green-500/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                          {integration.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">{integration.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs text-green-600">Connected</span>
                          </div>
                        </div>
                      </div>
                      <Switch checked={true} onCheckedChange={() => handleDisconnect(integration.id)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="gap-1">
                        <Settings className="h-3 w-3" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Available Integrations */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="text-xl font-semibold">Available Integrations</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search integrations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>

          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="bg-transparent p-0 gap-2">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((cat) => (
              <TabsContent key={cat.id} value={cat.id} className="mt-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {availableList.map((integration) => (
                    <Card key={integration.id} className="group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl">
                              {integration.icon}
                            </div>
                            <div>
                              <CardTitle className="text-base flex items-center gap-2">
                                {integration.name}
                                {integration.popular && (
                                  <Badge variant="secondary" className="text-xs">Popular</Badge>
                                )}
                              </CardTitle>
                              <div className="mt-1">
                                {getStatusBadge(integration.status)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{integration.description}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {integration.features.slice(0, 3).map((feature) => (
                            <Badge key={feature} variant="outline" className="text-xs">{feature}</Badge>
                          ))}
                        </div>
                        <Button 
                          className="w-full gap-2" 
                          disabled={integration.status === 'coming_soon'}
                          onClick={() => handleConnect(integration.id)}
                        >
                          {integration.status === 'coming_soon' ? (
                            <>
                              <Clock className="h-4 w-4" />
                              Coming Soon
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              Connect
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </ChatFlowLayout>
  );
}
