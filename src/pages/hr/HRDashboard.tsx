import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  Clock, 
  Calendar, 
  Briefcase, 
  AlertTriangle,
  TrendingUp,
  DollarSign,
  CheckCircle,
  XCircle,
  UserMinus,
  ArrowRight
} from "lucide-react";
import { useHRDashboardStats } from "@/hooks/useHR";
import { useEmployees } from "@/hooks/useEmployees";
import { Link } from "react-router-dom";

export default function HRDashboard() {
  const { data: stats, isLoading: statsLoading } = useHRDashboardStats();
  const { data: employees, isLoading: employeesLoading } = useEmployees();

  const recentHires = employees?.filter(e => {
    const hireDate = new Date(e.hire_date);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return hireDate >= thirtyDaysAgo;
  }).slice(0, 5) || [];

  return (
    <HRLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">HR Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your HR management center</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/hr/employees">
                <Users className="mr-2 h-4 w-4" />
                View Employees
              </Link>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEmployees || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeEmployees || 0} active
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Hires</CardTitle>
              <UserPlus className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.newHires || 0}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openJobs || 0}</div>
              <p className="text-xs text-muted-foreground">Active job postings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingLeaves || 0}</div>
              <p className="text-xs text-muted-foreground">Leave requests</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Attendance Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Today's Attendance
              </CardTitle>
              <CardDescription>Real-time attendance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Present</span>
                </div>
                <Badge variant="default" className="bg-green-500">{stats?.attendance?.present || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span>Late</span>
                </div>
                <Badge variant="secondary">{stats?.attendance?.late || 0}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span>Absent</span>
                </div>
                <Badge variant="destructive">{stats?.attendance?.absent || 0}</Badge>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/hr/attendance">
                  View Attendance <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recruitment Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Recruitment Pipeline
              </CardTitle>
              <CardDescription>Candidates by stage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { stage: 'Applied', count: stats?.candidatesByStage?.applied || 0, color: 'bg-blue-500' },
                { stage: 'Screening', count: stats?.candidatesByStage?.screening || 0, color: 'bg-yellow-500' },
                { stage: 'Interview', count: stats?.candidatesByStage?.interview || 0, color: 'bg-purple-500' },
                { stage: 'Assessment', count: stats?.candidatesByStage?.assessment || 0, color: 'bg-orange-500' },
                { stage: 'Offer', count: stats?.candidatesByStage?.offer || 0, color: 'bg-green-500' },
              ].map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="flex-1 text-sm">{item.stage}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/hr/candidates">
                  View Candidates <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Leave Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Leave Summary
              </CardTitle>
              <CardDescription>Pending leave requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-4xl font-bold text-primary">{stats?.pendingLeaves || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">Awaiting approval</p>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link to="/hr/leave">
                  Manage Leave <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Hires & Alerts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Hires */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recent Hires
              </CardTitle>
              <CardDescription>New team members (last 30 days)</CardDescription>
            </CardHeader>
            <CardContent>
              {recentHires.length > 0 ? (
                <div className="space-y-3">
                  {recentHires.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium">{employee.employee_code || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">{employee.position}</p>
                      </div>
                      <Badge variant="outline">
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No recent hires</p>
              )}
            </CardContent>
          </Card>

          {/* HR Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                HR Alerts
              </CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.pendingLeaves && stats.pendingLeaves > 0 && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">{stats.pendingLeaves} pending leave requests</span>
                  </div>
                )}
                {stats?.openJobs && stats.openJobs > 0 && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">{stats.openJobs} open positions to fill</span>
                  </div>
                )}
                {(stats?.candidatesByStage?.interview || 0) > 0 && (
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Users className="h-4 w-4 text-purple-500" />
                    <span className="text-sm">{stats.candidatesByStage?.interview} candidates in interview stage</span>
                  </div>
                )}
                {!stats?.pendingLeaves && !stats?.openJobs && (
                  <p className="text-center text-muted-foreground py-4">No alerts at this time</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common HR tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Button variant="outline" className="h-auto py-4 flex-col" asChild>
                <Link to="/hr/employees">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Add Employee</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" asChild>
                <Link to="/hr/jobs">
                  <Briefcase className="h-6 w-6 mb-2" />
                  <span>Post Job</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" asChild>
                <Link to="/hr/leave">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Approve Leave</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-auto py-4 flex-col" asChild>
                <Link to="/hr/payroll">
                  <DollarSign className="h-6 w-6 mb-2" />
                  <span>Run Payroll</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
