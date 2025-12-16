import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  User, Building, Calendar, DollarSign, Award, Clock, 
  Mail, Phone, MapPin, Briefcase, Edit 
} from 'lucide-react';
import { format } from 'date-fns';
import { Employee } from '@/hooks/useEmployees';
import { useTasks } from '@/hooks/useTasks';

interface EmployeeProfileDialogProps {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (employee: Employee) => void;
}

export function EmployeeProfileDialog({ employee, open, onOpenChange, onEdit }: EmployeeProfileDialogProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const { data: allTasks = [] } = useTasks();
  
  if (!employee) return null;

  const employeeTasks = allTasks.filter(t => t.assigned_to === employee.id);
  const completedTasks = employeeTasks.filter(t => t.status === 'done').length;
  const pendingTasks = employeeTasks.filter(t => t.status !== 'done').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'on_leave': return 'bg-amber-500';
      default: return 'bg-gray-500';
    }
  };

  const getInitials = (position: string | null) => {
    if (!position) return 'E';
    return position.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl">Employee Profile</DialogTitle>
            {onEdit && (
              <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Profile Header */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="pt-6 text-center">
                <Avatar className="h-24 w-24 mx-auto mb-4">
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {getInitials(employee.position)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold mb-1">
                  {employee.position || 'No Position'}
                </h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {employee.employee_code || 'No Code'}
                </p>
                <Badge className={`${getStatusColor(employee.status)} text-white`}>
                  {employee.status.replace('_', ' ')}
                </Badge>
                
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span>{employee.departments?.name || 'No Department'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Hired: {format(new Date(employee.hire_date), 'MMM d, yyyy')}</span>
                  </div>
                  {employee.salary && (
                    <div className="flex items-center gap-3 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>${employee.salary.toLocaleString()}/year</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Details */}
          <div className="md:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Tasks ({employeeTasks.length})</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-green-500/10">
                          <Award className="h-6 w-6 text-green-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{completedTasks}</p>
                          <p className="text-sm text-muted-foreground">Completed Tasks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                          <Clock className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{pendingTasks}</p>
                          <p className="text-sm text-muted-foreground">Pending Tasks</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Employment Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground">Employee ID</label>
                        <p className="font-medium">{employee.employee_code || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Department</label>
                        <p className="font-medium">{employee.departments?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Position</label>
                        <p className="font-medium">{employee.position || 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Status</label>
                        <p className="font-medium capitalize">{employee.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Hire Date</label>
                        <p className="font-medium">{format(new Date(employee.hire_date), 'MMMM d, yyyy')}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Salary</label>
                        <p className="font-medium">{employee.salary ? `$${employee.salary.toLocaleString()}` : 'N/A'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="mt-4">
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {employeeTasks.length === 0 ? (
                      <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                          No tasks assigned to this employee
                        </CardContent>
                      </Card>
                    ) : (
                      employeeTasks.map((task) => (
                        <Card key={task.id}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{task.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {task.description || 'No description'}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{task.priority}</Badge>
                                <Badge 
                                  variant={task.status === 'done' ? 'default' : 'secondary'}
                                >
                                  {task.status?.replace('_', ' ') || 'todo'}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="skills" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    {employee.skills && employee.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {employee.skills.map((skill, i) => (
                          <Badge key={i} variant="secondary" className="text-sm py-1 px-3">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No skills added yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
