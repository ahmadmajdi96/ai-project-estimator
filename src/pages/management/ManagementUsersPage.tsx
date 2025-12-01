import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagementSidebar } from '@/components/management/ManagementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Search, Shield, Trash2 } from 'lucide-react';
import { useUsersWithRoles, useUpdateUserRole, useInviteUser, useUserInvitations, useDeleteInvitation } from '@/hooks/useUserManagement';
import { useDepartments } from '@/hooks/useDepartments';
import { useAuth, AppRole } from '@/hooks/useAuth';

const ROLES: { value: AppRole; label: string; color: string }[] = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500' },
  { value: 'ceo', label: 'CEO', color: 'bg-purple-500' },
  { value: 'department_head', label: 'Department Head', color: 'bg-blue-500' },
  { value: 'team_lead', label: 'Team Lead', color: 'bg-amber-500' },
  { value: 'employee', label: 'Employee', color: 'bg-green-500' },
];

export default function ManagementUsersPage() {
  const [search, setSearch] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('employee');
  const [inviteDepartment, setInviteDepartment] = useState('');

  const { data: users, isLoading } = useUsersWithRoles();
  const { data: invitations } = useUserInvitations();
  const { data: departments } = useDepartments();
  const { role: currentUserRole } = useAuth();
  const updateRole = useUpdateUserRole();
  const inviteUser = useInviteUser();
  const deleteInvitation = useDeleteInvitation();

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    updateRole.mutate({ userId, role: newRole });
  };

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email');
      return;
    }
    
    inviteUser.mutate({
      email: inviteEmail,
      role: inviteRole,
      department_id: inviteDepartment || undefined,
    }, {
      onSuccess: () => {
        setIsInviteOpen(false);
        setInviteEmail('');
        setInviteRole('employee');
        setInviteDepartment('');
      }
    });
  };

  const getRoleBadge = (role: AppRole | null) => {
    const roleInfo = ROLES.find(r => r.value === role);
    return (
      <Badge variant="secondary" className={`${roleInfo?.color || 'bg-gray-500'} text-white`}>
        {roleInfo?.label || role || 'No Role'}
      </Badge>
    );
  };

  const canEditRole = (targetRole: AppRole | null) => {
    if (!currentUserRole) return false;
    const currentLevel = ROLES.findIndex(r => r.value === currentUserRole);
    const targetLevel = ROLES.findIndex(r => r.value === targetRole);
    return currentLevel <= targetLevel || currentUserRole === 'super_admin';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold">Users & Roles</h1>
                <p className="text-muted-foreground">Manage system users and their permissions</p>
              </div>
              <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite New User</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Email</Label>
                      <Input 
                        placeholder="user@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Role</Label>
                      <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as AppRole)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.filter(r => canEditRole(r.value)).map(role => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Department (Optional)</Label>
                      <Select value={inviteDepartment} onValueChange={setInviteDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Department</SelectItem>
                          {departments?.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleInvite} className="w-full">
                      Send Invitation
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Active Users
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search users..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          Loading users...
                        </TableCell>
                      </TableRow>
                    ) : filteredUsers?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers?.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.full_name || 'Unnamed User'}
                          </TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {canEditRole(user.role) && (
                              <Select 
                                value={user.role || 'employee'} 
                                onValueChange={(v) => handleRoleChange(user.id, v as AppRole)}
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLES.filter(r => canEditRole(r.value)).map(role => (
                                    <SelectItem key={role.value} value={role.value}>
                                      {role.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {invitations && invitations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invitations</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Invited</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitations.map((inv) => (
                        <TableRow key={inv.id}>
                          <TableCell>{inv.email}</TableCell>
                          <TableCell>{getRoleBadge(inv.role)}</TableCell>
                          <TableCell>
                            {new Date(inv.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => deleteInvitation.mutate(inv.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
