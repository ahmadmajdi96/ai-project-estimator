import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagementSidebar } from '@/components/management/ManagementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Building, Users, Mail, Phone, Calendar, Briefcase, ChevronDown, ChevronRight } from 'lucide-react';
import { useDepartments, Department } from '@/hooks/useDepartments';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { cn } from '@/lib/utils';

interface DepartmentNodeProps {
  department: Department;
  departments: Department[];
  employees: Employee[];
  level: number;
  onSelectEmployee: (emp: Employee) => void;
}

function DepartmentNode({ department, departments, employees, level, onSelectEmployee }: DepartmentNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const childDepartments = departments.filter(d => d.parent_department_id === department.id);
  const departmentEmployees = employees.filter(e => e.department_id === department.id);
  const hasChildren = childDepartments.length > 0 || departmentEmployees.length > 0;

  return (
    <div className="relative">
      {/* Connection line from parent */}
      {level > 0 && (
        <div className="absolute -left-6 top-0 bottom-0 w-px bg-border" />
      )}
      
      <div 
        className={cn(
          "relative p-4 rounded-lg border bg-card transition-all hover:shadow-md cursor-pointer",
          level > 0 && "ml-6"
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {/* Horizontal connector */}
        {level > 0 && (
          <div className="absolute -left-6 top-1/2 w-6 h-px bg-border" />
        )}
        
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${department.color}20` }}
          >
            <Building className="h-5 w-5" style={{ color: department.color }} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">{department.name}</h3>
            <p className="text-sm text-muted-foreground">
              {departmentEmployees.length} employees
              {childDepartments.length > 0 && ` • ${childDepartments.length} sub-departments`}
            </p>
          </div>
          {hasChildren && (
            <div className="text-muted-foreground">
              {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </div>
          )}
        </div>
      </div>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="mt-2 space-y-2 relative">
          {/* Employees */}
          {departmentEmployees.map((emp) => (
            <div 
              key={emp.id}
              className={cn(
                "relative p-3 rounded-lg border bg-muted/30 transition-all hover:bg-muted/50 cursor-pointer",
                "ml-6"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onSelectEmployee(emp);
              }}
            >
              {/* Connector */}
              <div className="absolute -left-6 top-0 bottom-0 w-px bg-border" />
              <div className="absolute -left-6 top-1/2 w-6 h-px bg-border" />
              
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {emp.position?.slice(0, 2).toUpperCase() || 'EM'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">{emp.position || 'Unassigned'}</p>
                  <p className="text-xs text-muted-foreground">{emp.employee_code || 'No code'}</p>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "text-xs",
                    emp.status === 'active' && "bg-green-500/20 text-green-700",
                    emp.status === 'on_leave' && "bg-amber-500/20 text-amber-700",
                    emp.status === 'inactive' && "bg-gray-500/20 text-gray-700"
                  )}
                >
                  {emp.status}
                </Badge>
              </div>
            </div>
          ))}

          {/* Child Departments */}
          {childDepartments.map((child) => (
            <DepartmentNode
              key={child.id}
              department={child}
              departments={departments}
              employees={employees}
              level={level + 1}
              onSelectEmployee={onSelectEmployee}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgTreePage() {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { data: departments, isLoading: deptLoading } = useDepartments();
  const { data: employees, isLoading: empLoading } = useEmployees();

  const rootDepartments = departments?.filter(d => !d.parent_department_id) || [];
  const unassignedEmployees = employees?.filter(e => !e.department_id) || [];

  const isLoading = deptLoading || empLoading;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-5xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold">Organization Tree</h1>
              <p className="text-muted-foreground">Visualize your company structure</p>
            </div>

            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">
                Loading organization structure...
              </div>
            ) : departments?.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Building className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Departments Yet</h3>
                  <p className="text-muted-foreground">
                    Create departments in the Departments page to see the organization tree.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Root Departments */}
                {rootDepartments.map((dept) => (
                  <DepartmentNode
                    key={dept.id}
                    department={dept}
                    departments={departments || []}
                    employees={employees || []}
                    level={0}
                    onSelectEmployee={setSelectedEmployee}
                  />
                ))}

                {/* Unassigned Employees */}
                {unassignedEmployees.length > 0 && (
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-muted-foreground">
                        <Users className="h-5 w-5" />
                        Unassigned Employees ({unassignedEmployees.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {unassignedEmployees.map((emp) => (
                          <div 
                            key={emp.id}
                            className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-xs">
                                  {emp.position?.slice(0, 2).toUpperCase() || 'EM'}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-sm">{emp.position || 'Unassigned'}</p>
                                <p className="text-xs text-muted-foreground">{emp.employee_code}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Employee Profile Dialog */}
            <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Employee Profile</DialogTitle>
                </DialogHeader>
                {selectedEmployee && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl bg-primary/10 text-primary">
                          {selectedEmployee.position?.slice(0, 2).toUpperCase() || 'EM'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-xl font-semibold">{selectedEmployee.position || 'Unassigned'}</h3>
                        <p className="text-muted-foreground">{selectedEmployee.employee_code || 'No code'}</p>
                        <Badge 
                          className={cn(
                            "mt-1",
                            selectedEmployee.status === 'active' && "bg-green-500",
                            selectedEmployee.status === 'on_leave' && "bg-amber-500",
                            selectedEmployee.status === 'inactive' && "bg-gray-500"
                          )}
                        >
                          {selectedEmployee.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Department</p>
                          <p className="font-medium">
                            {selectedEmployee.departments?.name || 'Unassigned'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Hire Date</p>
                          <p className="font-medium">
                            {new Date(selectedEmployee.hire_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {selectedEmployee.salary && (
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Salary</p>
                            <p className="font-medium">
                              ${selectedEmployee.salary.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}

                      {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                        <div className="p-3 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground mb-2">Skills</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedEmployee.skills.map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
