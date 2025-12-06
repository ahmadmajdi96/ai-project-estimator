import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { 
  Bot, 
  Plus, 
  Search, 
  MoreVertical, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Settings,
  MessageSquare,
  Zap,
  Brain,
  Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChatbots, useAddChatbot, useUpdateChatbot, useDeleteChatbot } from '@/hooks/useChatFlow';
import { toast } from 'sonner';

export default function ChatbotsPage() {
  const navigate = useNavigate();
  const { data: chatbots = [], isLoading } = useChatbots();
  const addChatbot = useAddChatbot();
  const updateChatbot = useUpdateChatbot();
  const deleteChatbot = useDeleteChatbot();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'rule_based',
  });

  const filteredChatbots = chatbots.filter(bot => {
    const matchesSearch = bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bot.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bot.status === statusFilter;
    const matchesType = typeFilter === 'all' || bot.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreate = async () => {
    if (!formData.name) {
      toast.error('Please enter a chatbot name');
      return;
    }
    await addChatbot.mutateAsync({
      name: formData.name,
      description: formData.description,
      type: formData.type as 'rule_based' | 'ai' | 'hybrid',
      status: 'draft',
    });
    setIsDialogOpen(false);
    setFormData({ name: '', description: '', type: 'rule_based' });
  };

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    await updateChatbot.mutateAsync({ id, status: newStatus });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this chatbot?')) {
      await deleteChatbot.mutateAsync(id);
    }
  };

  const handleDuplicate = async (bot: typeof chatbots[0]) => {
    await addChatbot.mutateAsync({
      ...bot,
      name: `${bot.name} (Copy)`,
      status: 'draft',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ai':
        return <Brain className="h-4 w-4" />;
      case 'rule_based':
        return <Code className="h-4 w-4" />;
      case 'hybrid':
        return <Zap className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'paused':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  return (
    <ChatFlowLayout title="Chatbots">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search chatbots..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ai">AI</SelectItem>
                <SelectItem value="rule_based">Rule-based</SelectItem>
                <SelectItem value="hybrid">Hybrid</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Chatbot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Chatbot</DialogTitle>
                <DialogDescription>
                  Set up a new chatbot to automate your conversations
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="My Chatbot"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What does this chatbot do?"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rule_based">
                        <div className="flex items-center gap-2">
                          <Code className="h-4 w-4" />
                          Rule-based
                        </div>
                      </SelectItem>
                      <SelectItem value="ai">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          AI-powered
                        </div>
                      </SelectItem>
                      <SelectItem value="hybrid">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Hybrid
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={addChatbot.isPending}>
                  {addChatbot.isPending ? 'Creating...' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Chatbots Grid */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-3/4 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-muted rounded w-1/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredChatbots.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredChatbots.map((bot) => (
              <Card key={bot.id} className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/chatflow/chatbots/${bot.id}`)}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      {getTypeIcon(bot.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {bot.description || 'No description'}
                      </CardDescription>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusToggle(bot.id, bot.status); }}>
                        {bot.status === 'active' ? (
                          <><Pause className="h-4 w-4 mr-2" /> Pause</>
                        ) : (
                          <><Play className="h-4 w-4 mr-2" /> Activate</>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/chatflow/chatbots/${bot.id}/builder`); }}>
                        <Settings className="h-4 w-4 mr-2" /> Configure
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDuplicate(bot); }}>
                        <Copy className="h-4 w-4 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(bot.id); }} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusColor(bot.status) as any}>{bot.status}</Badge>
                      <Badge variant="outline" className="gap-1">
                        {getTypeIcon(bot.type)}
                        {bot.type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" />
                      <span>0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bot className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No chatbots found</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-sm">
                {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first chatbot'}
              </p>
              {!searchQuery && statusFilter === 'all' && typeFilter === 'all' && (
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Chatbot
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ChatFlowLayout>
  );
}
