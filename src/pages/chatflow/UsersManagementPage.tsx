import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Bot,
  MessageSquare,
  Activity,
  Eye,
  Ban,
  CheckCircle,
  Clock,
  Globe,
  Shield
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function UsersManagementPage() {
  // Sample user data
  const sampleUsers = [
    {
      id: '1',
      email: 'john.smith@techcorp.com',
      first_name: 'John',
      last_name: 'Smith',
      avatar_url: null,
      phone: '+1 555-0101',
      company_name: 'TechCorp Inc.',
      company_size: '50-100',
      industry: 'Technology',
      timezone: 'America/New_York',
      language: 'en',
      email_verified: true,
      last_login: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: '2',
      email: 'sarah.johnson@startupxyz.io',
      first_name: 'Sarah',
      last_name: 'Johnson',
      avatar_url: null,
      phone: '+1 555-0102',
      company_name: 'StartupXYZ',
      company_size: '10-50',
      industry: 'E-commerce',
      timezone: 'America/Los_Angeles',
      language: 'en',
      email_verified: true,
      last_login: new Date().toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: '3',
      email: 'michael.chen@globalretail.com',
      first_name: 'Michael',
      last_name: 'Chen',
      avatar_url: null,
      phone: '+1 555-0103',
      company_name: 'Global Retail Co.',
      company_size: '100-500',
      industry: 'Retail',
      timezone: 'America/Chicago',
      language: 'en',
      email_verified: true,
      last_login: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: '4',
      email: 'emma.wilson@healthplus.org',
      first_name: 'Emma',
      last_name: 'Wilson',
      avatar_url: null,
      phone: '+1 555-0104',
      company_name: 'HealthPlus Clinic',
      company_size: '10-50',
      industry: 'Healthcare',
      timezone: 'America/Denver',
      language: 'en',
      email_verified: false,
      last_login: null,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    },
    {
      id: '5',
      email: 'david.brown@financegroup.com',
      first_name: 'David',
      last_name: 'Brown',
      avatar_url: null,
      phone: '+1 555-0105',
      company_name: 'Finance Group LLC',
      company_size: '50-100',
      industry: 'Finance',
      timezone: 'America/New_York',
      language: 'en',
      email_verified: true,
      last_login: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: '6',
      email: 'lisa.martinez@edulearn.edu',
      first_name: 'Lisa',
      last_name: 'Martinez',
      avatar_url: null,
      phone: '+1 555-0106',
      company_name: 'EduLearn Academy',
      company_size: '10-50',
      industry: 'Education',
      timezone: 'America/Phoenix',
      language: 'es',
      email_verified: true,
      last_login: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
  ];

  // Sample chatbots data
  const sampleChatbots = [
    { id: 'c1', customer_id: '1', chatbot_id: 'bot-001', name: 'TechCorp Support Bot', status: 'active', used_messages: 4500, max_messages_per_month: 10000, subscription_tier: 'Pro' },
    { id: 'c2', customer_id: '1', chatbot_id: 'bot-002', name: 'TechCorp Sales Bot', status: 'active', used_messages: 2300, max_messages_per_month: 10000, subscription_tier: 'Pro' },
    { id: 'c3', customer_id: '2', chatbot_id: 'bot-003', name: 'StartupXYZ Assistant', status: 'active', used_messages: 1200, max_messages_per_month: 5000, subscription_tier: 'Starter' },
    { id: 'c4', customer_id: '3', chatbot_id: 'bot-004', name: 'Retail Customer Service', status: 'active', used_messages: 8900, max_messages_per_month: 20000, subscription_tier: 'Enterprise' },
    { id: 'c5', customer_id: '5', chatbot_id: 'bot-005', name: 'Finance FAQ Bot', status: 'paused', used_messages: 500, max_messages_per_month: 5000, subscription_tier: 'Starter' },
    { id: 'c6', customer_id: '6', chatbot_id: 'bot-006', name: 'EduLearn Tutor', status: 'active', used_messages: 3400, max_messages_per_month: 10000, subscription_tier: 'Pro' },
  ];

  const { data: dbUsers = [] } = useQuery({
    queryKey: ['portal-users-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('portal_users').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  
  const { data: dbChatbots = [] } = useQuery({
    queryKey: ['customer-chatbots-all'],
    queryFn: async () => {
      const { data, error } = await supabase.from('customer_chatbots').select('*');
      if (error) throw error;
      return data;
    },
  });

  // Combine sample data with database data - use sample if DB is empty
  const users = dbUsers.length > 0 ? dbUsers : sampleUsers;
  const allChatbots = dbChatbots.length > 0 ? dbChatbots : sampleChatbots;
  const isLoading = false;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof users[0] | null>(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUserChatbots = (userId: string) => 
    allChatbots.filter(c => c.customer_id === userId);

  const openUserProfile = (user: typeof users[0]) => {
    setSelectedUser(user);
    setProfileDialogOpen(true);
  };

  const getStatusBadge = (user: typeof users[0]) => {
    if (user.email_verified) {
      return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Verified</Badge>;
    }
    return <Badge variant="secondary">Pending</Badge>;
  };

  const stats = {
    totalUsers: users.length,
    verifiedUsers: users.filter(u => u.email_verified).length,
    activeToday: users.filter(u => {
      if (!u.last_login) return false;
      const lastLogin = new Date(u.last_login);
      const today = new Date();
      return lastLogin.toDateString() === today.toDateString();
    }).length,
    totalChatbots: allChatbots.length,
  };

  return (
    <ChatFlowLayout title="Users Management">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered customers</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
              <p className="text-xs text-muted-foreground">Email verified</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Today</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeToday}</div>
              <p className="text-xs text-muted-foreground">Logged in today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Chatbots</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalChatbots}</div>
              <p className="text-xs text-muted-foreground">Customer chatbots</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Registered Customers</CardTitle>
                <CardDescription>Manage and monitor your customer base</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Chatbots</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => openUserProfile(user)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback>
                              {(user.first_name?.[0] || '') + (user.last_name?.[0] || user.email?.[0] || 'U')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}` 
                                : 'No name'}
                            </p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.company_name || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="gap-1">
                          <Bot className="h-3 w-3" />
                          {getUserChatbots(user.id).length}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(user)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {user.last_login 
                            ? format(new Date(user.last_login), 'MMM d, yyyy HH:mm')
                            : 'Never'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {user.created_at 
                            ? format(new Date(user.created_at), 'MMM d, yyyy')
                            : '-'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openUserProfile(user); }}>
                              <Eye className="h-4 w-4 mr-2" /> View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                              <Mail className="h-4 w-4 mr-2" /> Send Email
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => e.stopPropagation()} className="text-destructive">
                              <Ban className="h-4 w-4 mr-2" /> Suspend User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? 'Try adjusting your search query' : 'No customers have registered yet'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>Detailed customer information</DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <Tabs defaultValue="overview" className="mt-4">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="chatbots">Chatbots</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-4">
                {/* Profile Header */}
                <div className="flex items-start gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={selectedUser.avatar_url || undefined} />
                    <AvatarFallback className="text-2xl">
                      {(selectedUser.first_name?.[0] || '') + (selectedUser.last_name?.[0] || selectedUser.email?.[0] || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {selectedUser.first_name && selectedUser.last_name 
                        ? `${selectedUser.first_name} ${selectedUser.last_name}` 
                        : 'No name provided'}
                    </h3>
                    <p className="text-muted-foreground">{selectedUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      {getStatusBadge(selectedUser)}
                      {selectedUser.industry && (
                        <Badge variant="outline">{selectedUser.industry}</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid gap-4 md:grid-cols-2">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Contact Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{selectedUser.email}</span>
                      </div>
                      {selectedUser.phone && (
                        <div className="flex items-center gap-3">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.phone}</span>
                        </div>
                      )}
                      {selectedUser.timezone && (
                        <div className="flex items-center gap-3">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.timezone}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Company Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedUser.company_name && (
                        <div className="flex items-center gap-3">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.company_name}</span>
                        </div>
                      )}
                      {selectedUser.company_size && (
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.company_size} employees</span>
                        </div>
                      )}
                      {selectedUser.industry && (
                        <div className="flex items-center gap-3">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedUser.industry}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{getUserChatbots(selectedUser.id).length}</p>
                          <p className="text-xs text-muted-foreground">Active Chatbots</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <MessageSquare className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-xs text-muted-foreground">Total Messages</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                          <Calendar className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {selectedUser.created_at 
                              ? Math.floor((Date.now() - new Date(selectedUser.created_at).getTime()) / (1000 * 60 * 60 * 24))
                              : 0}
                          </p>
                          <p className="text-xs text-muted-foreground">Days Active</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Timestamps */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Account Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Created</span>
                        <span className="text-sm font-medium">
                          {selectedUser.created_at 
                            ? format(new Date(selectedUser.created_at), 'PPpp')
                            : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Login</span>
                        <span className="text-sm font-medium">
                          {selectedUser.last_login 
                            ? format(new Date(selectedUser.last_login), 'PPpp')
                            : 'Never'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Updated</span>
                        <span className="text-sm font-medium">
                          {selectedUser.updated_at 
                            ? format(new Date(selectedUser.updated_at), 'PPpp')
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chatbots" className="mt-4">
                <div className="space-y-4">
                  {getUserChatbots(selectedUser.id).length > 0 ? (
                    getUserChatbots(selectedUser.id).map((chatbot) => (
                      <Card key={chatbot.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Bot className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{chatbot.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {chatbot.chatbot_id}
                                </p>
                              </div>
                            </div>
                            <Badge variant={chatbot.status === 'active' ? 'default' : 'secondary'}>
                              {chatbot.status}
                            </Badge>
                          </div>
                          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
                            <span>Messages: {chatbot.used_messages || 0}/{chatbot.max_messages_per_month || 1000}</span>
                            <span>Tier: {chatbot.subscription_tier || 'Free'}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No chatbots created yet</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Activity logs will appear here</p>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="mt-4">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">User Preferences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Language</span>
                          <Badge variant="outline">{selectedUser.language || 'en'}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Timezone</span>
                          <Badge variant="outline">{selectedUser.timezone || 'UTC'}</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      <Mail className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                    <Button variant="destructive" className="flex-1">
                      <Ban className="h-4 w-4 mr-2" />
                      Suspend Account
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </ChatFlowLayout>
  );
}
