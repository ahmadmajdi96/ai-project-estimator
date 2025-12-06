import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Search, 
  Filter,
  Clock,
  User,
  Bot,
  Send,
  MoreVertical,
  Tag,
  UserCheck,
  X
} from 'lucide-react';
import { useConversations, useChatbots, useMessages, useSendMessage } from '@/hooks/useChatFlow';
import { format } from 'date-fns';

export default function ConversationsPage() {
  const { data: conversations = [], isLoading } = useConversations();
  const { data: chatbots = [] } = useChatbots();
  const sendMessage = useSendMessage();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const { data: messages = [] } = useMessages(selectedConversation || '');

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.platform.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  const chatbot = chatbots.find(b => b.id === selectedConv?.chatbot_id);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    await sendMessage.mutateAsync({
      conversation_id: selectedConversation,
      sender_type: 'agent',
      message_type: 'text',
      content: newMessage,
      direction: 'outgoing',
    });
    setNewMessage('');
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'whatsapp':
        return 'bg-green-500';
      case 'facebook':
        return 'bg-blue-600';
      case 'instagram':
        return 'bg-pink-500';
      case 'telegram':
        return 'bg-sky-500';
      case 'website':
        return 'bg-primary';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <ChatFlowLayout title="Conversations">
      <div className="flex h-[calc(100vh-8rem)] gap-4">
        {/* Conversations List */}
        <div className="w-80 flex flex-col border rounded-lg bg-card">
          <div className="p-4 border-b space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="closed">Closed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse p-3 rounded-lg border">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-3 bg-muted rounded w-3/4" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation === conv.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-accent border-transparent'
                    } border`}
                    onClick={() => setSelectedConversation(conv.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar>
                          <AvatarFallback>{conv.visitor_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${getPlatformColor(conv.platform)} border-2 border-background`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium truncate">{conv.visitor_name || 'Unknown User'}</p>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(conv.updated_at), 'HH:mm')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conv.summary || 'No messages yet'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {conv.platform}
                          </Badge>
                          {conv.status === 'active' && (
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No conversations found</p>
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Conversation Detail */}
        <div className="flex-1 flex flex-col border rounded-lg bg-card">
          {selectedConversation && selectedConv ? (
            <>
              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{selectedConv.visitor_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{selectedConv.visitor_name || 'Unknown User'}</h3>
                      <Badge variant={selectedConv.status === 'active' ? 'default' : 'secondary'}>
                        {selectedConv.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{selectedConv.platform}</span>
                      <span>•</span>
                      <span>Bot: {chatbot?.name || 'Unknown'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <UserCheck className="h-4 w-4" />
                    Assign
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Tag className="h-4 w-4" />
                    Tags
                  </Button>
                  <Button variant="outline" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length > 0 ? (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.direction === 'outgoing'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.sender_type === 'bot' && <Bot className="h-3 w-3" />}
                            {msg.sender_type === 'user' && <User className="h-3 w-3" />}
                            <span className="text-xs opacity-70">
                              {msg.sender_type} • {format(new Date(msg.sent_at), 'HH:mm')}
                            </span>
                          </div>
                          <p>{msg.content}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground">No messages in this conversation</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Conversation</h3>
              <p className="text-muted-foreground max-w-sm">
                Choose a conversation from the list to view messages and respond to users
              </p>
            </div>
          )}
        </div>
      </div>
    </ChatFlowLayout>
  );
}
