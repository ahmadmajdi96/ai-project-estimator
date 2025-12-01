import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagementSidebar } from '@/components/management/ManagementSidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, Shield, UserCheck } from 'lucide-react';
import { useEmployees } from '@/hooks/useEmployees';
import { useDepartments } from '@/hooks/useDepartments';
import { useUsersWithRoles } from '@/hooks/useUserManagement';

export default function ManagementDashboard() {
  const { data: employees } = useEmployees();
  const { data: departments } = useDepartments();
  const { data: users } = useUsersWithRoles();

  const activeEmployees = employees?.filter(e => e.status === 'active').length || 0;
  const totalDepartments = departments?.length || 0;
  const totalUsers = users?.length || 0;

  const stats = [
    {
      title: 'Total Employees',
      value: employees?.length || 0,
      subtitle: `${activeEmployees} active`,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Departments',
      value: totalDepartments,
      subtitle: 'Organization units',
      icon: Building,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      title: 'System Users',
      value: totalUsers,
      subtitle: 'With portal access',
      icon: Shield,
      gradient: 'from-amber-500 to-orange-500',
    },
    {
      title: 'On Leave',
      value: employees?.filter(e => e.status === 'on_leave').length || 0,
      subtitle: 'Currently away',
      icon: UserCheck,
      gradient: 'from-emerald-500 to-teal-500',
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h1 className="text-3xl font-display font-bold">Management Portal</h1>
              <p className="text-muted-foreground">Employee and organization management</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.title} className="relative overflow-hidden">
                    <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.gradient} opacity-10 rounded-bl-full`} />
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </CardTitle>
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                          <Icon className="h-4 w-4 text-white" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">{stat.value}</div>
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    No recent activity to display.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-muted-foreground text-sm">
                    Use the sidebar to navigate to different management sections.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
