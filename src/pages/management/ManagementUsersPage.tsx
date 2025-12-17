import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Shield, UserPlus, Pencil, Trash2, Lock, Loader2, Mail, User, Briefcase } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useUsersWithRoles, useUpdateUserRole } from '@/hooks/useUserManagement';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const ROLES: { value: AppRole; label: string; color: string }[] = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500' },
  { value: 'ceo', label: 'CEO', color: 'bg-purple-500' },
  { value: 'department_head', label: 'Department Head', color: 'bg-orange-500' },
  { value: 'team_lead', label: 'Team Lead', color: 'bg-blue-500' },
  { value: 'employee', label: 'Employee', color: 'bg-green-500' },
];

interface UserForm {
  fullName: string;
  email: string;
  password: string;
  role: AppRole;
  position: string;
  departmentId: string;
}

const initialForm: UserForm = {
  fullName: '',
  email: '',
  password: '',
  role: 'employee',
  position: '',
  departmentId: '',
};

export default function ManagementUsersPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [addForm, setAddForm] = useState<UserForm>(initialForm);
  const [editForm, setEditForm] = useState<UserForm>(initialForm);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: users, isLoading, refetch } = useUsersWithRoles();
  const { data: employees, refetch: refetchEmployees } = useEmployees();
  const { data: departments } = useDepartments();
  const { role: currentUserRole } = useAuth();
  const updateRole = useUpdateUserRole();

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddUser = async () => {
    if (!addForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }
    if (!addForm.email.trim()) {
      toast.error('Email is required');
      return;
    }
    if (!addForm.password || addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsCreating(true);
    
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addForm.email,
        password: addForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: addForm.fullName },
        },
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user account');

      // Create user role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: addForm.role,
      });

      // Create employee record
      const employeeData: any = {
        user_id: authData.user.id,
        full_name: addForm.fullName,
        email: addForm.email,
        status: 'active',
        position: addForm.position || addForm.role,
      };

      if (addForm.departmentId) {
        employeeData.department_id = addForm.departmentId;
      }

      await supabase.from('employees').insert([employeeData]);

      toast.success('User created successfully');
      setIsAddOpen(false);
      setAddForm(initialForm);
      refetch();
      refetchEmployees();
    } catch (error: any) {
      toast.error('Failed to create user: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !editForm.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    try {
      // Update role if changed
      if (editForm.role !== selectedUser.role) {
        await updateRole.mutateAsync({ userId: selectedUser.id, role: editForm.role });
      }

      // Update profile
      await supabase
        .from('profiles')
        .update({ full_name: editForm.fullName })
        .eq('id', selectedUser.id);

      // Update employee record if exists
      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', selectedUser.id)
        .single();

      if (employee) {
        const updateData: any = { 
          full_name: editForm.fullName,
          position: editForm.position,
        };
        if (editForm.departmentId) {
          updateData.department_id = editForm.departmentId;
        }
        
        await supabase
          .from('employees')
          .update(updateData)
          .eq('id', employee.id);
      }

      toast.success('User updated successfully');
      setIsEditOpen(false);
      setSelectedUser(null);
      refetch();
      refetchEmployees();
    } catch (error: any) {
      toast.error('Failed to update user: ' + error.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsDeleting(true);
    try {
      // Delete user role
      await supabase.from('user_roles').delete().eq('user_id', selectedUser.id);
      
      // Delete employee record
      await supabase.from('employees').delete().eq('user_id', selectedUser.id);
      
      // Delete profile
      await supabase.from('profiles').delete().eq('id', selectedUser.id);

      toast.success('User deleted successfully');
      setIsDeleteOpen(false);
      setSelectedUser(null);
      refetch();
      refetchEmployees();
    } catch (error: any) {
      toast.error('Failed to delete user: ' + error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    
    // Find employee record to get position/department
    const employee = employees?.find(e => e.user_id === user.id);
    
    setEditForm({
      fullName: user.full_name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'employee',
      position: employee?.position || '',
      departmentId: employee?.department_id || '',
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
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

  // Get employee info for a user
  const getEmployeeInfo = (userId: string) => {
    return employees?.find(e => e.user_id === userId);
  };

  return (
    <ManagementLayout title="Users & Roles">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Manage system users, roles, and permissions</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={addForm.fullName}
                      onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })}
                      placeholder="John Doe"
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        placeholder="email@company.com"
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        value={addForm.password}
                        onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                        placeholder="Min 6 characters"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Select value={addForm.role} onValueChange={(v) => setAddForm({ ...addForm, role: v as AppRole })}>
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
                  <div className="space-y-2">
                    <Label>Position</Label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={addForm.position}
                        onChange={(e) => setAddForm({ ...addForm, position: e.target.value })}
                        placeholder="e.g. Manager"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={addForm.departmentId} onValueChange={(v) => setAddForm({ ...addForm, departmentId: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments?.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUser} className="w-full" disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Create User
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
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers?.map((user) => {
                    const employee = getEmployeeInfo(user.id);
                    const department = departments?.find(d => d.id === employee?.department_id);
                    
                    return (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {(user.full_name || user.email || 'U').slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{user.full_name || 'Unnamed User'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {employee?.position || '-'}
                        </TableCell>
                        <TableCell>
                          {department?.name || '-'}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {canEditRole(user.role) && (
                              <>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditDialog(user)}
                                  title="Edit user"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openDeleteDialog(user)}
                                  className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                                  title="Delete user"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  placeholder="John Doe"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editForm.email} disabled className="bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={editForm.role} onValueChange={(v) => setEditForm({ ...editForm, role: v as AppRole })}>
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
              <div className="space-y-2">
                <Label>Position</Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={editForm.position}
                    onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                    placeholder="e.g. Manager"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={editForm.departmentId} onValueChange={(v) => setEditForm({ ...editForm, departmentId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={updateRole.isPending}>
              {updateRole.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedUser?.full_name || selectedUser?.email}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteUser}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ManagementLayout>
  );
}
