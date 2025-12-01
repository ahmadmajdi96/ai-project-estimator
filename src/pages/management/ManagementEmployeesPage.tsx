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
import { Plus, Search, Users, Edit, Trash2 } from 'lucide-react';
import { useEmployees, useAddEmployee, useUpdateEmployee, useDeleteEmployee, Employee } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';

export default function ManagementEmployeesPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    position: '',
    department_id: '',
    employee_code: '',
    salary: '',
    skills: '',
    status: 'active' as 'active' | 'inactive' | 'on_leave',
  });

  const { data: employees, isLoading } = useEmployees();
  const { data: departments } = useDepartments();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  const filteredEmployees = employees?.filter(emp => 
    emp.position?.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(search.toLowerCase()) ||
    emp.departments?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      position: '',
      department_id: '',
      employee_code: '',
      salary: '',
      skills: '',
      status: 'active',
    });
  };

  const handleAdd = () => {
    addEmployee.mutate({
      position: formData.position,
      department_id: formData.department_id || undefined,
      employee_code: formData.employee_code || undefined,
      salary: formData.salary ? parseFloat(formData.salary) : undefined,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : undefined,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        resetForm();
      }
    });
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      position: employee.position || '',
      department_id: employee.department_id || '',
      employee_code: employee.employee_code || '',
      salary: employee.salary?.toString() || '',
      skills: employee.skills?.join(', ') || '',
      status: employee.status,
    });
  };

  const handleUpdate = () => {
    if (!editingEmployee) return;
    updateEmployee.mutate({
      id: editingEmployee.id,
      position: formData.position,
      department_id: formData.department_id || null,
      employee_code: formData.employee_code || null,
      salary: formData.salary ? parseFloat(formData.salary) : null,
      skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : null,
      status: formData.status,
    }, {
      onSuccess: () => {
        setEditingEmployee(null);
        resetForm();
      }
    });
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      inactive: 'bg-gray-500',
      on_leave: 'bg-amber-500',
    };
    return (
      <Badge className={`${colors[status] || 'bg-gray-500'} text-white`}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const EmployeeForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div>
        <Label>Position *</Label>
        <Input 
          placeholder="e.g., Software Engineer"
          value={formData.position}
          onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
        />
      </div>
      <div>
        <Label>Department</Label>
        <Select 
          value={formData.department_id || "__none__"} 
          onValueChange={(v) => setFormData(prev => ({ ...prev, department_id: v === "__none__" ? "" : v }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">No Department</SelectItem>
            {departments?.map(dept => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Employee Code</Label>
        <Input 
          placeholder="e.g., EMP001"
          value={formData.employee_code}
          onChange={(e) => setFormData(prev => ({ ...prev, employee_code: e.target.value }))}
        />
      </div>
      <div>
        <Label>Salary</Label>
        <Input 
          type="number"
          placeholder="e.g., 50000"
          value={formData.salary}
          onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
        />
      </div>
      <div>
        <Label>Skills (comma-separated)</Label>
        <Input 
          placeholder="e.g., React, TypeScript, Node.js"
          value={formData.skills}
          onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
        />
      </div>
      <div>
        <Label>Status</Label>
        <Select 
          value={formData.status} 
          onValueChange={(v) => setFormData(prev => ({ ...prev, status: v as typeof formData.status }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSubmit} className="w-full">
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold">Employees</h1>
                <p className="text-muted-foreground">Manage company employees</p>
              </div>
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                  </DialogHeader>
                  <EmployeeForm onSubmit={handleAdd} submitLabel="Add Employee" />
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Employee Directory
                  </CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search employees..."
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
                      <TableHead>Code</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hire Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          Loading employees...
                        </TableCell>
                      </TableRow>
                    ) : filteredEmployees?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No employees found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployees?.map((emp) => (
                        <TableRow key={emp.id}>
                          <TableCell className="font-mono text-sm">
                            {emp.employee_code || '-'}
                          </TableCell>
                          <TableCell className="font-medium">
                            {emp.position || 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            {emp.departments?.name || 'No Department'}
                          </TableCell>
                          <TableCell>{getStatusBadge(emp.status)}</TableCell>
                          <TableCell>
                            {new Date(emp.hire_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleEdit(emp)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => deleteEmployee.mutate(emp.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingEmployee} onOpenChange={(open) => !open && setEditingEmployee(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Employee</DialogTitle>
                </DialogHeader>
                <EmployeeForm onSubmit={handleUpdate} submitLabel="Update Employee" />
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
