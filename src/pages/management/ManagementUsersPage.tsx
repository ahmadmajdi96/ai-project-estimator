import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, Search, Shield, UserPlus } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useUsersWithRoles, useUpdateUserRole, useCreateUserFromEmployee } from '@/hooks/useUserManagement';
import { useAuth, AppRole } from '@/hooks/useAuth';
import { toast } from 'sonner';

const ROLES: { value: AppRole; label: string; color: string }[] = [
  { value: 'super_admin', label: 'Super Admin', color: 'bg-red-500' },
  { value: 'ceo', label: 'CEO', color: 'bg-purple-500' },
  { value: 'department_head', label: 'Department Head', color: 'bg-blue-500' },
  { value: 'team_lead', label: 'Team Lead', color: 'bg-amber-500' },
  { value: 'employee', label: 'Employee', color: 'bg-green-500' },
];

export default function ManagementUsersPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedRole, setSelectedRole] = useState<AppRole>('employee');

  const { data: users, isLoading } = useUsersWithRoles();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { role: currentUserRole } = useAuth();
  const updateRole = useUpdateUserRole();
  const createUser = useCreateUserFromEmployee();

  // Filter employees that don't have user accounts yet
  const availableEmployees = employees?.filter(emp => 
    !users?.some(user => user.email === emp.user_id)
  );

  const filteredUsers = users?.filter(user => 
    user.email?.toLowerCase().includes(search.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleRoleChange = async (userId: string, newRole: AppRole) => {
    updateRole.mutate({ userId, role: newRole });
  };

  const handleAddUser = () => {
    if (!selectedEmployee) {
      toast.error('Please select an employee');
      return;
    }

    createUser.mutate({
      employee_id: selectedEmployee,
      role: selectedRole,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setSelectedEmployee('');
        setSelectedRole('employee');
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
    <ManagementLayout title="Users & Roles">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-muted-foreground">Manage system users and their permissions</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User from Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create User Account</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Select Employee</Label>
                  <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees?.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.position} - {emp.employee_code} ({departments?.find(d => d.id === emp.department_id)?.name || 'No Dept'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
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
                <Button onClick={handleAddUser} className="w-full" disabled={createUser.isPending}>
                  Create User Account
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
      </div>
    </ManagementLayout>
  );
}
