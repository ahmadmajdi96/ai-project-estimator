import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Users, Edit, Trash2, Eye } from 'lucide-react';
import { useEmployees, useDeleteEmployee, Employee } from '@/hooks/useEmployees';
import { ExpandedEmployeeForm } from '@/components/management/ExpandedEmployeeForm';
import { EmployeeProfileDialog } from '@/components/management/EmployeeProfileDialog';

export default function ManagementEmployeesPage() {
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const { data: employees, isLoading } = useEmployees();
  const deleteEmployee = useDeleteEmployee();

  const filteredEmployees = employees?.filter(emp => 
    emp.position?.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(search.toLowerCase()) ||
    emp.departments?.name?.toLowerCase().includes(search.toLowerCase())
  );

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

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  return (
    <ManagementLayout title="Employees">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage company employees</p>
          </div>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
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
                    <TableRow 
                      key={emp.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleView(emp)}
                    >
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
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleView(emp)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
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

        {/* Add Employee Dialog */}
        <ExpandedEmployeeForm
          open={isAddOpen}
          onOpenChange={setIsAddOpen}
          mode="add"
        />

        {/* Edit Employee Dialog */}
        <ExpandedEmployeeForm
          open={!!editingEmployee}
          onOpenChange={(open) => !open && setEditingEmployee(null)}
          employee={editingEmployee}
          mode="edit"
        />

        {/* View Employee Profile */}
        <EmployeeProfileDialog
          employee={viewingEmployee}
          open={!!viewingEmployee}
          onOpenChange={(open) => !open && setViewingEmployee(null)}
          onEdit={(emp) => {
            setViewingEmployee(null);
            setEditingEmployee(emp);
          }}
        />
      </div>
    </ManagementLayout>
  );
}
