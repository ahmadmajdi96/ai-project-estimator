import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Settings,
  Loader2,
  Eye,
  EyeOff,
  ChevronRight
} from 'lucide-react';

type AppRole = 'super_admin' | 'ceo' | 'department_head' | 'team_lead' | 'employee';

interface UserWithRole {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: AppRole;
  created_at: string;
}

const ROLES = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500/20 text-red-400' },
  { value: 'ceo', label: 'CEO', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'department_head', label: 'Department Head', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'team_lead', label: 'Team Lead', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'employee', label: 'Employee', color: 'bg-slate-500/20 text-slate-400' },
];

// Define all portals with their pages
const PORTAL_PAGES = [
  {
    portal: 'CRM Portal',
    basePath: '/crm',
    pages: [
      { path: '/crm', label: 'Dashboard' },
      { path: '/crm/clients', label: 'Clients' },
      { path: '/crm/sales-pipeline', label: 'Sales Pipeline' },
      { path: '/crm/opportunities', label: 'Opportunities' },
      { path: '/crm/quotes', label: 'Quotes' },
      { path: '/crm/invoices', label: 'Invoices' },
      { path: '/crm/products', label: 'Products' },
      { path: '/crm/calendar', label: 'Calendar' },
      { path: '/crm/reports', label: 'Reports' },
      { path: '/crm/support-tickets', label: 'Support Tickets' },
      { path: '/crm/support-pipeline', label: 'Support Pipeline' },
      { path: '/crm/ai-chat', label: 'AI Chat' },
      { path: '/crm/ai-insights', label: 'AI Insights' },
    ]
  },
  {
    portal: 'Management Portal',
    basePath: '/management',
    pages: [
      { path: '/management', label: 'Dashboard' },
      { path: '/management/employees', label: 'Employees' },
      { path: '/management/departments', label: 'Departments' },
      { path: '/management/tasks', label: 'Tasks' },
      { path: '/management/kpis', label: 'KPIs' },
      { path: '/management/strategic-goals', label: 'Strategic Goals' },
      { path: '/management/roadmaps', label: 'Roadmaps' },
      { path: '/management/okrs', label: 'OKRs' },
      { path: '/management/documents', label: 'Documents' },
      { path: '/management/workflows', label: 'Workflows' },
      { path: '/management/calendar', label: 'Calendar' },
      { path: '/management/reports', label: 'Reports' },
      { path: '/management/ai-chat', label: 'AI Chat' },
      { path: '/management/ai-insights', label: 'AI Insights' },
    ]
  },
  {
    portal: 'HR Portal',
    basePath: '/hr',
    pages: [
      { path: '/hr', label: 'Dashboard' },
      { path: '/hr/employees', label: 'Employees' },
      { path: '/hr/attendance', label: 'Attendance' },
      { path: '/hr/leave', label: 'Leave Management' },
      { path: '/hr/payroll', label: 'Payroll' },
      { path: '/hr/performance', label: 'Performance' },
      { path: '/hr/training', label: 'Training' },
      { path: '/hr/onboarding', label: 'Onboarding' },
      { path: '/hr/candidates', label: 'Candidates' },
      { path: '/hr/jobs', label: 'Jobs' },
      { path: '/hr/benefits', label: 'Benefits' },
      { path: '/hr/documents', label: 'Documents' },
      { path: '/hr/org-chart', label: 'Org Chart' },
      { path: '/hr/analytics', label: 'Analytics' },
    ]
  },
  {
    portal: 'Accounting Portal',
    basePath: '/accounting',
    pages: [
      { path: '/accounting', label: 'Dashboard' },
      { path: '/accounting/gl/chart-of-accounts', label: 'Chart of Accounts' },
      { path: '/accounting/gl/journal-entries', label: 'Journal Entries' },
      { path: '/accounting/gl/trial-balance', label: 'Trial Balance' },
      { path: '/accounting/ar/invoices', label: 'AR Invoices' },
      { path: '/accounting/ar/payments', label: 'AR Payments' },
      { path: '/accounting/ar/customers', label: 'Customers' },
      { path: '/accounting/ap/bills', label: 'Bills' },
      { path: '/accounting/ap/payments', label: 'AP Payments' },
      { path: '/accounting/ap/vendors', label: 'Vendors' },
      { path: '/accounting/banking/accounts', label: 'Bank Accounts' },
      { path: '/accounting/banking/transactions', label: 'Transactions' },
      { path: '/accounting/banking/reconciliation', label: 'Reconciliation' },
      { path: '/accounting/budgets', label: 'Budgets' },
      { path: '/accounting/reports', label: 'Reports' },
    ]
  },
  {
    portal: 'Logistics Portal',
    basePath: '/logistics',
    pages: [
      { path: '/logistics', label: 'Dashboard' },
      { path: '/logistics/shipments', label: 'Shipments' },
      { path: '/logistics/dispatch', label: 'Dispatch' },
      { path: '/logistics/tracking', label: 'Tracking' },
      { path: '/logistics/carriers', label: 'Carriers' },
      { path: '/logistics/equipment', label: 'Equipment' },
      { path: '/logistics/driver-expenses', label: 'Driver Expenses' },
      { path: '/logistics/settlements', label: 'Settlements' },
      { path: '/logistics/billing', label: 'Billing' },
      { path: '/logistics/analytics', label: 'Analytics' },
    ]
  },
  {
    portal: 'ChatFlow Portal',
    basePath: '/chatflow',
    pages: [
      { path: '/chatflow', label: 'Dashboard' },
      { path: '/chatflow/chatbots', label: 'Chatbots' },
      { path: '/chatflow/conversations', label: 'Conversations' },
      { path: '/chatflow/knowledge-base', label: 'Knowledge Base' },
      { path: '/chatflow/templates', label: 'Templates' },
      { path: '/chatflow/integrations', label: 'Integrations' },
      { path: '/chatflow/analytics', label: 'Analytics' },
      { path: '/chatflow/team', label: 'Team' },
    ]
  },
  {
    portal: 'CortaCentral Portal',
    basePath: '/cortacentral',
    pages: [
      { path: '/cortacentral', label: 'Dashboard' },
      { path: '/cortacentral/workflows', label: 'Workflows' },
      { path: '/cortacentral/conversations', label: 'Conversations' },
      { path: '/cortacentral/connectors', label: 'Connectors' },
      { path: '/cortacentral/analytics', label: 'Analytics' },
    ]
  },
  {
    portal: 'Customer Portal',
    basePath: '/customer-portal',
    pages: [
      { path: '/customer-portal', label: 'Dashboard' },
      { path: '/customer-portal/chatbots', label: 'My Chatbots' },
      { path: '/customer-portal/knowledge-base', label: 'Knowledge Base' },
      { path: '/customer-portal/training', label: 'Training' },
    ]
  },
];

export function DashboardUserManagement() {
  const queryClient = useQueryClient();
  const [registerDialogOpen, setRegisterDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'employee' as AppRole
  });

  // Fetch users with roles
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['dashboard_users_with_roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) throw profilesError;
      
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');
      
      if (rolesError) throw rolesError;
      
      return profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'employee',
        } as UserWithRole;
      });
    },
  });

  // Fetch page permissions for selected user
  const { data: userPermissions = [] } = useQuery({
    queryKey: ['page_permissions', selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return [];
      const { data, error } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', selectedUser.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedUser?.id,
  });

  // Register new user mutation
  const registerUser = useMutation({
    mutationFn: async (form: typeof registerForm) => {
      // Create auth user - the trigger will handle profile and role creation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: form.fullName },
        },
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // Update the role if it's not the default 'employee'
      if (form.role !== 'employee') {
        // Wait a moment for the trigger to complete
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: form.role })
          .eq('user_id', authData.user.id);
        
        if (roleError) throw roleError;
      }

      return authData.user;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard_users_with_roles'] });
      toast.success('User registered successfully');
      setRegisterDialogOpen(false);
      setRegisterForm({ email: '', password: '', fullName: '', role: 'employee' });
    },
    onError: (error: Error) => {
      toast.error('Failed to register user: ' + error.message);
    },
  });

  // Update role mutation
  const updateRole = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { data: existing } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role })
          .eq('user_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert([{ user_id: userId, role }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard_users_with_roles'] });
      toast.success('User role updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update role: ' + error.message);
    },
  });

  // Set permission mutation
  const setPermission = useMutation({
    mutationFn: async ({ userId, pagePath, canAccess }: { userId: string; pagePath: string; canAccess: boolean }) => {
      const { data: existing } = await supabase
        .from('page_permissions')
        .select('*')
        .eq('user_id', userId)
        .eq('page_path', pagePath)
        .single();
      
      if (existing) {
        const { error } = await supabase
          .from('page_permissions')
          .update({ can_access: canAccess })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('page_permissions')
          .insert([{ user_id: userId, page_path: pagePath, can_access: canAccess }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_permissions', selectedUser?.id] });
      toast.success('Permission updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update permission: ' + error.message);
    },
  });

  // Bulk toggle portal permissions
  const togglePortalPermissions = useMutation({
    mutationFn: async ({ userId, basePath, pages, enable }: { userId: string; basePath: string; pages: { path: string }[]; enable: boolean }) => {
      for (const page of pages) {
        const { data: existing } = await supabase
          .from('page_permissions')
          .select('*')
          .eq('user_id', userId)
          .eq('page_path', page.path)
          .single();
        
        if (existing) {
          await supabase
            .from('page_permissions')
            .update({ can_access: enable })
            .eq('id', existing.id);
        } else {
          await supabase
            .from('page_permissions')
            .insert([{ user_id: userId, page_path: page.path, can_access: enable }]);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['page_permissions', selectedUser?.id] });
      toast.success('Portal permissions updated');
    },
    onError: (error: Error) => {
      toast.error('Failed to update permissions: ' + error.message);
    },
  });

  const handleRegister = () => {
    if (!registerForm.email || !registerForm.password) {
      toast.error('Email and password are required');
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    registerUser.mutate(registerForm);
  };

  const getPermissionStatus = (pagePath: string) => {
    const perm = userPermissions.find(p => p.page_path === pagePath);
    return perm ? perm.can_access : true; // Default to true (allowed)
  };

  const getPortalPermissionStatus = (pages: { path: string }[]) => {
    const enabledCount = pages.filter(p => getPermissionStatus(p.path)).length;
    if (enabledCount === pages.length) return 'all';
    if (enabledCount === 0) return 'none';
    return 'partial';
  };

  if (usersLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">User Management</CardTitle>
              <p className="text-sm text-muted-foreground">{users.length} registered users</p>
            </div>
          </div>
          
          <Dialog open={registerDialogOpen} onOpenChange={setRegisterDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Register User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="user@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      placeholder="••••••••"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={registerForm.role} 
                    onValueChange={(v) => setRegisterForm({ ...registerForm, role: v as AppRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleRegister} 
                  className="w-full" 
                  disabled={registerUser.isPending}
                >
                  {registerUser.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register User'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {users.map(user => {
              const roleInfo = ROLES.find(r => r.value === user.role);
              return (
                <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {(user.full_name || user.email || 'U').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={roleInfo?.color}>{roleInfo?.label}</Badge>
                    <Select 
                      value={user.role} 
                      onValueChange={(v) => updateRole.mutate({ userId: user.id, role: v as AppRole })}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map(role => (
                          <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setSelectedUser(user);
                        setPermissionsDialogOpen(true);
                      }}
                      title="Manage Permissions"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No users registered yet
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      {/* Permissions Dialog with Dynamic Page Selection */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Portal & Page Permissions - {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <Accordion type="multiple" className="space-y-2">
              {PORTAL_PAGES.map((portalGroup) => {
                const portalStatus = getPortalPermissionStatus(portalGroup.pages);
                return (
                  <AccordionItem 
                    key={portalGroup.basePath} 
                    value={portalGroup.basePath}
                    className="border rounded-lg bg-muted/20"
                  >
                    <AccordionTrigger className="px-4 hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">{portalGroup.portal}</span>
                          <Badge variant={portalStatus === 'all' ? 'default' : portalStatus === 'none' ? 'destructive' : 'secondary'}>
                            {portalStatus === 'all' ? 'Full Access' : portalStatus === 'none' ? 'No Access' : 'Partial'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedUser) {
                                togglePortalPermissions.mutate({
                                  userId: selectedUser.id,
                                  basePath: portalGroup.basePath,
                                  pages: portalGroup.pages,
                                  enable: true
                                });
                              }
                            }}
                            className="text-xs h-7"
                          >
                            Enable All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (selectedUser) {
                                togglePortalPermissions.mutate({
                                  userId: selectedUser.id,
                                  basePath: portalGroup.basePath,
                                  pages: portalGroup.pages,
                                  enable: false
                                });
                              }
                            }}
                            className="text-xs h-7 text-destructive hover:text-destructive"
                          >
                            Disable All
                          </Button>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="grid grid-cols-2 gap-2">
                        {portalGroup.pages.map((page) => (
                          <div 
                            key={page.path} 
                            className="flex items-center justify-between p-2 rounded-md bg-background/50 hover:bg-background"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">{page.label}</span>
                            </div>
                            <Checkbox
                              checked={getPermissionStatus(page.path)}
                              onCheckedChange={(checked) => {
                                if (selectedUser) {
                                  setPermission.mutate({ 
                                    userId: selectedUser.id, 
                                    pagePath: page.path, 
                                    canAccess: checked as boolean 
                                  });
                                }
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
