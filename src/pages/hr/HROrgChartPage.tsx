import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Users, ChevronDown, ChevronRight, Download, User } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";
import { useState } from "react";

export default function HROrgChartPage() {
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: departments, isLoading: departmentsLoading } = useDepartments();
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  const toggleDepartment = (deptId: string) => {
    const newExpanded = new Set(expandedDepts);
    if (newExpanded.has(deptId)) {
      newExpanded.delete(deptId);
    } else {
      newExpanded.add(deptId);
    }
    setExpandedDepts(newExpanded);
  };

  const getEmployeesByDepartment = (deptId: string) => {
    return employees?.filter((e) => e.department_id === deptId) || [];
  };

  const unassignedEmployees = employees?.filter((e) => !e.department_id) || [];

  const isLoading = employeesLoading || departmentsLoading;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Organization Chart</h1>
            <p className="text-muted-foreground">View your organization's structure</p>
          </div>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{employees?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Employees</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Network className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{departments?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Departments</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <User className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unassignedEmployees.length}</p>
                  <p className="text-sm text-muted-foreground">Unassigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Org Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department Structure</CardTitle>
            <CardDescription>Click on a department to expand and view employees</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : (
              <div className="space-y-4">
                {departments?.map((dept: any) => {
                  const deptEmployees = getEmployeesByDepartment(dept.id);
                  const isExpanded = expandedDepts.has(dept.id);
                  
                  return (
                    <div key={dept.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleDepartment(dept.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Network className="h-5 w-5 text-primary" />
                          </div>
                          <div className="text-left">
                            <h3 className="font-medium">{dept.name}</h3>
                            <p className="text-sm text-muted-foreground">{dept.description || 'No description'}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{deptEmployees.length} employees</Badge>
                      </button>
                      
                      {isExpanded && (
                        <div className="border-t bg-muted/30 p-4">
                          {deptEmployees.length > 0 ? (
                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                              {deptEmployees.map((emp) => (
                                <div
                                  key={emp.id}
                                  className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                                >
                                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-sm">{emp.employee_code || 'N/A'}</p>
                                    <p className="text-xs text-muted-foreground">{emp.position || 'No position'}</p>
                                  </div>
                                  <Badge
                                    variant={emp.status === 'active' ? 'default' : 'secondary'}
                                    className="ml-auto text-xs"
                                  >
                                    {emp.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground py-2">No employees in this department</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Unassigned Employees */}
                {unassignedEmployees.length > 0 && (
                  <div className="border rounded-lg overflow-hidden border-dashed">
                    <button
                      onClick={() => toggleDepartment('unassigned')}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedDepts.has('unassigned') ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <User className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-medium">Unassigned</h3>
                          <p className="text-sm text-muted-foreground">Employees without a department</p>
                        </div>
                      </div>
                      <Badge variant="outline">{unassignedEmployees.length} employees</Badge>
                    </button>
                    
                    {expandedDepts.has('unassigned') && (
                      <div className="border-t bg-muted/30 p-4">
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {unassignedEmployees.map((emp) => (
                            <div
                              key={emp.id}
                              className="flex items-center gap-3 p-3 bg-background rounded-lg border"
                            >
                              <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                                <User className="h-5 w-5 text-orange-500" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{emp.employee_code || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground">{emp.position || 'No position'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {departments?.length === 0 && unassignedEmployees.length === 0 && (
                  <div className="text-center py-12">
                    <Network className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No organization structure</h3>
                    <p className="text-muted-foreground">Add departments and employees to build your org chart</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
