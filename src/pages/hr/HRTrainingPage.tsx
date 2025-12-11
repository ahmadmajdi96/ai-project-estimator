import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, BookOpen, Award, Plus, Clock, CheckCircle } from "lucide-react";
import { useTrainingCourses, useEmployeeTraining } from "@/hooks/useHR";
import { format } from "date-fns";

export default function HRTrainingPage() {
  const { data: courses, isLoading: coursesLoading } = useTrainingCourses();
  const { data: employeeTraining, isLoading: trainingLoading } = useEmployeeTraining();

  const getDifficultyBadge = (difficulty: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      beginner: { variant: "secondary", className: "bg-green-500/10 text-green-600" },
      intermediate: { variant: "secondary", className: "bg-yellow-500/10 text-yellow-600" },
      advanced: { variant: "secondary", className: "bg-red-500/10 text-red-600" },
    };
    return (
      <Badge variant={config[difficulty]?.variant || "secondary"} className={config[difficulty]?.className}>
        {difficulty}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      assigned: { variant: "secondary" },
      in_progress: { variant: "default", className: "bg-blue-500" },
      completed: { variant: "default", className: "bg-green-500" },
      expired: { variant: "destructive" },
    };
    return (
      <Badge variant={config[status]?.variant || "default"} className={config[status]?.className}>
        {status?.replace("_", " ")}
      </Badge>
    );
  };

  const totalCourses = courses?.length || 0;
  const completedTrainings = employeeTraining?.filter((t: any) => t.status === 'completed').length || 0;
  const inProgressTrainings = employeeTraining?.filter((t: any) => t.status === 'in_progress').length || 0;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Learning & Development</h1>
            <p className="text-muted-foreground">Manage training courses and employee development</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Course
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCourses}</div>
              <p className="text-xs text-muted-foreground">Available courses</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTrainings}</div>
              <p className="text-xs text-muted-foreground">Active trainings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTrainings}</div>
              <p className="text-xs text-muted-foreground">Finished trainings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {employeeTraining?.filter((t: any) => t.certificate_url).length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Earned</p>
            </CardContent>
          </Card>
        </div>

        {/* Course Library */}
        <Card>
          <CardHeader>
            <CardTitle>Course Library</CardTitle>
            <CardDescription>Available training courses</CardDescription>
          </CardHeader>
          <CardContent>
            {coursesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : courses && courses.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {courses.map((course: any) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <GraduationCap className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-sm">{course.title}</CardTitle>
                            <CardDescription className="text-xs">{course.category || 'General'}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {course.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between">
                        {getDifficultyBadge(course.difficulty)}
                        <span className="text-xs text-muted-foreground">
                          {course.duration_hours ? `${course.duration_hours}h` : 'N/A'}
                        </span>
                      </div>
                      {course.is_mandatory && (
                        <Badge variant="destructive" className="mt-2">Mandatory</Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No courses available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Employee Training */}
        <Card>
          <CardHeader>
            <CardTitle>Employee Training Progress</CardTitle>
            <CardDescription>Track individual training assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {trainingLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : employeeTraining && employeeTraining.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Assigned</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeeTraining.map((training: any) => (
                    <TableRow key={training.id}>
                      <TableCell>
                        <p className="font-medium">{training.employees?.employee_code || 'N/A'}</p>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{training.course?.title || 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">{training.course?.category}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {training.assigned_date ? format(new Date(training.assigned_date), "MMM d, yyyy") : '-'}
                      </TableCell>
                      <TableCell>
                        {training.due_date ? format(new Date(training.due_date), "MMM d, yyyy") : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={training.progress || 0} className="w-16 h-2" />
                          <span className="text-xs">{training.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(training.status)}</TableCell>
                      <TableCell>{training.score ? `${training.score}%` : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No training records found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
