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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Trash2
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

const ALL_PORTALS = [
  { path: '/crm', label: 'CRM Portal' },
  { path: '/management', label: 'Management Portal' },
  { path: '/hr', label: 'HR Portal' },
  { path: '/accounting', label: 'Accounting Portal' },
  { path: '/logistics', label: 'Logistics Portal' },
  { path: '/chatflow', label: 'ChatFlow Portal' },
  { path: '/cortacentral', label: 'CortaCentral Portal' },
  { path: '/customer-portal', label: 'Customer Portal' },
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
      // Create auth user
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

      // Set role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert([{ user_id: authData.user.id, role: form.role }]);
      
      if (roleError) throw roleError;

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
    return perm ? perm.can_access : true;
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
        <ScrollArea className="h-[400px]">
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

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Portal Permissions - {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {ALL_PORTALS.map(portal => (
                <div key={portal.path} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50">
                  <span className="text-sm font-medium">{portal.label}</span>
                  <Checkbox
                    checked={getPermissionStatus(portal.path)}
                    onCheckedChange={(checked) => {
                      if (selectedUser) {
                        setPermission.mutate({ 
                          userId: selectedUser.id, 
                          pagePath: portal.path, 
                          canAccess: checked as boolean 
                        });
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
