import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useEmployees, useAddEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserCheck, Plus, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function EmployeesPage() {
  const { data: employees = [], isLoading } = useEmployees();
  const { data: departments = [] } = useDepartments();
  const addEmployee = useAddEmployee();
  const deleteEmployee = useDeleteEmployee();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [position, setPosition] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [salary, setSalary] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim()) {
      toast.error('Position is required');
      return;
    }
    
    await addEmployee.mutateAsync({
      full_name: position,
      position,
      department_id: departmentId || undefined,
      employee_code: employeeCode || undefined,
      salary: salary ? parseFloat(salary) : undefined,
    });
    
    setPosition('');
    setDepartmentId('');
    setEmployeeCode('');
    setSalary('');
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this employee?')) {
      await deleteEmployee.mutateAsync(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-500';
      case 'inactive': return 'bg-gray-500/10 text-gray-500';
      case 'on_leave': return 'bg-yellow-500/10 text-yellow-500';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  return (
    <CRMLayout title="Employees">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Employees</h2>
            <p className="text-muted-foreground">Manage your workforce</p>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Position *</Label>
                  <Input
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Software Engineer"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Employee Code</Label>
                    <Input
                      value={employeeCode}
                      onChange={(e) => setEmployeeCode(e.target.value)}
                      placeholder="EMP001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="50000"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={addEmployee.isPending}>
                  {addEmployee.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add Employee'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : employees.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No employees yet</h3>
              <p className="text-muted-foreground mb-4">Add your first employee to get started</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {emp.employee_code?.slice(0, 2) || 'E'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{emp.employee_code || 'N/A'}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{emp.position || 'N/A'}</TableCell>
                    <TableCell>{emp.departments?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(emp.status)}>
                        {emp.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(emp.hire_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(emp.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </CRMLayout>
  );
}
