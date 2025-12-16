import { useState } from "react";
import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Plus, Filter, Download, Upload, MoreHorizontal, User } from "lucide-react";
import { useEmployees, useAddEmployee } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function HREmployeesPage() {
  const { data: employees, isLoading } = useEmployees();
  const { data: departments } = useDepartments();
  const addEmployee = useAddEmployee();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newEmployee, setNewEmployee] = useState<{
    position: string;
    department_id: string;
    employee_code: string;
    salary: number;
    status: "active" | "inactive" | "on_leave";
  }>({
    position: "",
    department_id: "",
    employee_code: "",
    salary: 0,
    status: "active",
  });

  const filteredEmployees = employees?.filter((emp) => {
    const matchesSearch = 
      emp.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || emp.department_id === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const handleAddEmployee = async () => {
    if (!newEmployee.position) return;
    
    await addEmployee.mutateAsync({
      full_name: newEmployee.position,
      position: newEmployee.position,
      department_id: newEmployee.department_id || undefined,
      employee_code: newEmployee.employee_code || undefined,
      salary: newEmployee.salary || undefined,
      status: newEmployee.status,
    });
    
    setIsAddDialogOpen(false);
    setNewEmployee({
      position: "",
      department_id: "",
      employee_code: "",
      salary: 0,
      status: "active",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      active: "default",
      inactive: "secondary",
      on_leave: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employee Directory</h1>
            <p className="text-muted-foreground">Manage your organization's employees</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Employee</DialogTitle>
                  <DialogDescription>Enter the employee's information</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Employee Code</Label>
                    <Input
                      value={newEmployee.employee_code}
                      onChange={(e) => setNewEmployee({ ...newEmployee, employee_code: e.target.value })}
                      placeholder="EMP001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Position *</Label>
                    <Input
                      value={newEmployee.position}
                      onChange={(e) => setNewEmployee({ ...newEmployee, position: e.target.value })}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={newEmployee.department_id}
                      onValueChange={(value) => setNewEmployee({ ...newEmployee, department_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments?.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input
                      type="number"
                      value={newEmployee.salary}
                      onChange={(e) => setNewEmployee({ ...newEmployee, salary: Number(e.target.value) })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={newEmployee.status}
                      onValueChange={(value) => 
                        setNewEmployee({ ...newEmployee, status: value as "active" | "inactive" | "on_leave" })
                      }
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
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddEmployee} disabled={addEmployee.isPending}>
                    {addEmployee.isPending ? "Adding..." : "Add Employee"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on_leave">On Leave</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments?.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Employee Table */}
        <Card>
          <CardHeader>
            <CardTitle>Employees ({filteredEmployees?.length || 0})</CardTitle>
            <CardDescription>A list of all employees in your organization</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading employees...</div>
            ) : (
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
                  {filteredEmployees?.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{employee.employee_code || 'N/A'}</p>
                            <p className="text-sm text-muted-foreground">ID: {employee.id.slice(0, 8)}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{employee.position || 'N/A'}</TableCell>
                      <TableCell>{employee.departments?.name || 'Unassigned'}</TableCell>
                      <TableCell>{getStatusBadge(employee.status)}</TableCell>
                      <TableCell>{new Date(employee.hire_date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>View Documents</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredEmployees?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
