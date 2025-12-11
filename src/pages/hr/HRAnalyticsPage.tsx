import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, DollarSign, Target } from "lucide-react";
import { useHRDashboardStats } from "@/hooks/useHR";
import { useEmployees } from "@/hooks/useEmployees";
import { useDepartments } from "@/hooks/useDepartments";

export default function HRAnalyticsPage() {
  const { data: stats } = useHRDashboardStats();
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();

  const activeEmployees = employees?.filter((e) => e.status === 'active').length || 0;
  const totalEmployees = employees?.length || 0;
  const retentionRate = totalEmployees > 0 ? Math.round((activeEmployees / totalEmployees) * 100) : 0;

  const employeesByDept = departments?.map((dept) => ({
    name: dept.name,
    count: employees?.filter((e) => e.department_id === dept.id).length || 0,
  })) || [];

  const employeesByStatus = {
    active: employees?.filter((e) => e.status === 'active').length || 0,
    inactive: employees?.filter((e) => e.status === 'inactive').length || 0,
    on_leave: employees?.filter((e) => e.status === 'on_leave').length || 0,
  };

  return (
    <HRLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Analytics</h1>
          <p className="text-muted-foreground">Workforce insights and metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats?.newHires || 0} this month
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{retentionRate}%</div>
              <p className="text-xs text-muted-foreground">Active employees</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.openJobs || 0}</div>
              <p className="text-xs text-muted-foreground">Active job postings</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingLeaves || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Employee Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Status Distribution</CardTitle>
              <CardDescription>Breakdown by employment status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{employeesByStatus.active}</span>
                    <Badge variant="secondary">
                      {totalEmployees > 0 ? Math.round((employeesByStatus.active / totalEmployees) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Inactive</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{employeesByStatus.inactive}</span>
                    <Badge variant="secondary">
                      {totalEmployees > 0 ? Math.round((employeesByStatus.inactive / totalEmployees) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>On Leave</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{employeesByStatus.on_leave}</span>
                    <Badge variant="secondary">
                      {totalEmployees > 0 ? Math.round((employeesByStatus.on_leave / totalEmployees) * 100) : 0}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Employees by Department</CardTitle>
              <CardDescription>Headcount per department</CardDescription>
            </CardHeader>
            <CardContent>
              {employeesByDept.length > 0 ? (
                <div className="space-y-3">
                  {employeesByDept.sort((a, b) => b.count - a.count).map((dept, index) => (
                    <div key={dept.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-4">{index + 1}.</span>
                        <span>{dept.name}</span>
                      </div>
                      <Badge variant="outline">{dept.count}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No department data</p>
              )}
            </CardContent>
          </Card>

          {/* Recruitment Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Recruitment Pipeline</CardTitle>
              <CardDescription>Candidates by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { stage: 'Applied', count: stats?.candidatesByStage?.applied || 0, color: 'bg-blue-500' },
                  { stage: 'Screening', count: stats?.candidatesByStage?.screening || 0, color: 'bg-yellow-500' },
                  { stage: 'Interview', count: stats?.candidatesByStage?.interview || 0, color: 'bg-purple-500' },
                  { stage: 'Assessment', count: stats?.candidatesByStage?.assessment || 0, color: 'bg-orange-500' },
                  { stage: 'Offer', count: stats?.candidatesByStage?.offer || 0, color: 'bg-green-500' },
                ].map((item) => (
                  <div key={item.stage} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="flex-1">{item.stage}</span>
                    <span className="font-bold">{item.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Attendance Overview</CardTitle>
              <CardDescription>Today's attendance status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <span>Present</span>
                  <span className="text-xl font-bold text-green-600">{stats?.attendance?.present || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                  <span>Late</span>
                  <span className="text-xl font-bold text-yellow-600">{stats?.attendance?.late || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                  <span>Absent</span>
                  <span className="text-xl font-bold text-red-600">{stats?.attendance?.absent || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </HRLayout>
  );
}
