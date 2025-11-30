import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { 
  useUsersWithRoles, 
  useUserInvitations, 
  usePagePermissions,
  useUpdateUserRole, 
  useSetPagePermission,
  useInviteUser,
  useDeleteInvitation,
  UserWithRole
} from '@/hooks/useUserManagement';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Clock, 
  Trash2, 
  Settings,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

const ROLES = [
  { value: 'ceo', label: 'CEO', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'department_head', label: 'Department Head', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'team_lead', label: 'Team Lead', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'employee', label: 'Employee', color: 'bg-slate-500/20 text-slate-400' },
];

const CRM_PAGES = [
  { path: '/crm', label: 'Dashboard' },
  { path: '/crm/clients', label: 'Clients' },
  { path: '/crm/salesmen', label: 'Salesmen' },
  { path: '/crm/pipeline', label: 'Sales Pipeline' },
  { path: '/crm/status', label: 'Status Board' },
  { path: '/crm/calendar', label: 'Calendar' },
  { path: '/crm/quotes', label: 'Quotes & Estimator' },
  { path: '/crm/departments', label: 'Departments' },
  { path: '/crm/employees', label: 'Employees' },
  { path: '/crm/tasks', label: 'Tasks' },
  { path: '/crm/roadmaps', label: 'Roadmaps' },
  { path: '/crm/kpis', label: 'KPIs' },
  { path: '/crm/ai-chat', label: 'AI Chat' },
  { path: '/crm/config', label: 'Configuration' },
];

export function UserManagement() {
  const { data: users = [], isLoading: usersLoading } = useUsersWithRoles();
  const { data: invitations = [], isLoading: invitationsLoading } = useUserInvitations();
  
  const updateRole = useUpdateUserRole();
  const setPermission = useSetPagePermission();
  const inviteUser = useInviteUser();
  const deleteInvitation = useDeleteInvitation();
  
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [inviteForm, setInviteForm] = useState<{ email: string; role: 'ceo' | 'department_head' | 'team_lead' | 'employee' }>({ email: '', role: 'employee' });

  const { data: userPermissions = [] } = usePagePermissions(selectedUser?.id);

  const handleInvite = async () => {
    if (!inviteForm.email) return;
    await inviteUser.mutateAsync(inviteForm);
    setInviteDialogOpen(false);
    setInviteForm({ email: '', role: 'employee' });
  };

  const handlePermissionChange = async (pagePath: string, canAccess: boolean) => {
    if (!selectedUser) return;
    await setPermission.mutateAsync({ userId: selectedUser.id, pagePath, canAccess });
  };

  const getPermissionStatus = (pagePath: string) => {
    const perm = userPermissions.find(p => p.page_path === pagePath);
    return perm ? perm.can_access : true; // Default to true if no specific permission
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
    <Card className="p-6 bg-card/50 border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">User Management</h3>
            <p className="text-sm text-muted-foreground">{users.length} users, {invitations.filter(i => !i.accepted).length} pending invites</p>
          </div>
        </div>
        
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Invite User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="user@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={inviteForm.role} onValueChange={(v) => setInviteForm({ ...inviteForm, role: v as 'ceo' | 'department_head' | 'team_lead' | 'employee' })}>
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
              <Button onClick={handleInvite} className="w-full" disabled={inviteUser.isPending}>
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Users className="h-4 w-4" />
            Active Users
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2">
            <Mail className="h-4 w-4" />
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {users.map(user => {
                const roleInfo = ROLES.find(r => r.value === user.role);
                return (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
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
                      <Select 
                        value={user.role} 
                        onValueChange={(v) => updateRole.mutate({ userId: user.id, role: v as 'ceo' | 'department_head' | 'team_lead' | 'employee' })}
                      >
                        <SelectTrigger className="w-[150px]">
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
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="invitations">
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {invitations.map(invitation => {
                const roleInfo = ROLES.find(r => r.value === invitation.role);
                const isExpired = new Date(invitation.expires_at) < new Date();
                return (
                  <div key={invitation.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${invitation.accepted ? 'bg-emerald-500/20' : isExpired ? 'bg-red-500/20' : 'bg-amber-500/20'}`}>
                        {invitation.accepted ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : isExpired ? (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                          <Clock className="h-4 w-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{invitation.email}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge className={roleInfo?.color}>{roleInfo?.label}</Badge>
                          <span>•</span>
                          <span>{invitation.accepted ? 'Accepted' : isExpired ? 'Expired' : 'Pending'}</span>
                        </div>
                      </div>
                    </div>
                    {!invitation.accepted && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => deleteInvitation.mutate(invitation.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
              {invitations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No invitations yet
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Page Permissions - {selectedUser?.full_name || selectedUser?.email}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {CRM_PAGES.map(page => (
                <div key={page.path} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                  <span className="text-sm">{page.label}</span>
                  <Checkbox
                    checked={getPermissionStatus(page.path)}
                    onCheckedChange={(checked) => handlePermissionChange(page.path, checked as boolean)}
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