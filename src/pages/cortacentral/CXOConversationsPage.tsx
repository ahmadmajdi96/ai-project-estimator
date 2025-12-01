import { CortaCentralLayout } from '@/components/cortacentral/CortaCentralLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCXOConversations, useCXOQueues } from '@/hooks/useCortaCentral';
import { MessageSquare, Phone, Mail, MessageCircle, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const channelIcons: Record<string, any> = {
  voice: Phone,
  sms: MessageCircle,
  email: Mail,
  webchat: MessageSquare,
  whatsapp: MessageCircle,
};

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500/10 text-blue-500',
  normal: 'bg-green-500/10 text-green-500',
  high: 'bg-amber-500/10 text-amber-500',
  urgent: 'bg-red-500/10 text-red-500',
};

const statusColors: Record<string, string> = {
  open: 'bg-green-500/10 text-green-500',
  pending: 'bg-amber-500/10 text-amber-500',
  resolved: 'bg-blue-500/10 text-blue-500',
  closed: 'bg-muted text-muted-foreground',
};

export default function CXOConversationsPage() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: conversations, isLoading } = useCXOConversations();
  const { data: queues } = useCXOQueues();

  const filteredConversations = conversations?.filter(conv => {
    if (statusFilter !== 'all' && conv.status !== statusFilter) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        conv.contact?.first_name?.toLowerCase().includes(search) ||
        conv.contact?.last_name?.toLowerCase().includes(search) ||
        conv.contact?.primary_email?.toLowerCase().includes(search) ||
        conv.contact?.primary_phone?.includes(search)
      );
    }
    return true;
  });

  const stats = {
    total: conversations?.length || 0,
    open: conversations?.filter(c => c.status === 'open').length || 0,
    pending: conversations?.filter(c => c.status === 'pending').length || 0,
    resolved: conversations?.filter(c => c.status === 'resolved').length || 0,
  };

  return (
    <CortaCentralLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Conversations</h1>
            <p className="text-muted-foreground">Multi-channel customer interactions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground">Total Conversations</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">{stats.open}</div>
              <p className="text-sm text-muted-foreground">Open</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-500">{stats.resolved}</div>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversation Inbox
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search conversations..."
                    className="pl-9 w-[250px]"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !filteredConversations?.length ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No conversations found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConversations.map((conv) => {
                  const ChannelIcon = channelIcons[conv.primary_channel] || MessageSquare;
                  return (
                    <div key={conv.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <ChannelIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {conv.contact?.first_name && conv.contact?.last_name
                                ? `${conv.contact.first_name} ${conv.contact.last_name}`
                                : conv.contact?.primary_email || conv.contact?.primary_phone || 'Unknown Contact'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {conv.contact?.primary_email || conv.contact?.primary_phone || 'No contact info'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">{conv.primary_channel}</Badge>
                              <Badge className={priorityColors[conv.priority]}>{conv.priority}</Badge>
                              {conv.assigned_agent && (
                                <span className="text-xs text-muted-foreground">
                                  Assigned to {conv.assigned_agent.full_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={statusColors[conv.status]}>{conv.status}</Badge>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(conv.started_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CortaCentralLayout>
  );
}
