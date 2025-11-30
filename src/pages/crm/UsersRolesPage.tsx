import { CRMLayout } from '@/components/crm/CRMLayout';
import { SalesTeamManagement } from '@/components/crm/SalesTeamManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, Briefcase } from 'lucide-react';

const SALES_POSITIONS_INFO = [
  { position: 'Sales Director', role: 'Department Head', color: 'orange' },
  { position: 'Sales Manager', role: 'Team Lead', color: 'blue' },
  { position: 'Senior Salesman', role: 'Team Lead', color: 'blue' },
  { position: 'Salesman', role: 'Employee', color: 'green' },
  { position: 'Junior Salesman', role: 'Employee', color: 'green' },
];

export default function UsersRolesPage() {
  return (
    <CRMLayout title="Users & Roles">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold">Users & Roles Management</h2>
          <p className="text-muted-foreground">Manage sales team roles and permissions based on position</p>
        </div>

        <Tabs defaultValue="team" className="space-y-6">
          <TabsList>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              Sales Team
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              Roles Info
            </TabsTrigger>
            <TabsTrigger value="positions" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Position Mapping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="team">
            <SalesTeamManagement />
          </TabsContent>

          <TabsContent value="roles" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="glass-card border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-red-500" />
                    CEO
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Full system access with complete administrative control
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Manage all users & roles
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Access all pages
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      View audit logs
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      System configuration
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-orange-500" />
                    Department Head
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sales Director level - department management
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Manage team members
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Create tasks & roadmaps
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      View all reports
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      Limited config access
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-blue-500" />
                    Team Lead
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sales Manager / Senior Salesman level
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Manage team tasks
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      View team performance
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                      Limited reporting
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      No user management
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card border-l-4 border-l-green-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5 text-green-500" />
                    Employee
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">
                    Salesman / Junior Salesman level
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      View assigned tasks
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Update own tasks
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      View calendars
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      Read-only dashboards
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Permission Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Feature</th>
                        <th className="text-center py-3 px-4">CEO</th>
                        <th className="text-center py-3 px-4">Dept. Head</th>
                        <th className="text-center py-3 px-4">Team Lead</th>
                        <th className="text-center py-3 px-4">Employee</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { feature: 'User Management', ceo: true, head: false, lead: false, emp: false },
                        { feature: 'Role Assignment', ceo: true, head: false, lead: false, emp: false },
                        { feature: 'View All Clients', ceo: true, head: true, lead: true, emp: true },
                        { feature: 'Edit Clients', ceo: true, head: true, lead: true, emp: false },
                        { feature: 'Create Quotes', ceo: true, head: true, lead: true, emp: false },
                        { feature: 'View Financials', ceo: true, head: true, lead: false, emp: false },
                        { feature: 'System Config', ceo: true, head: true, lead: false, emp: false },
                        { feature: 'Audit Logs', ceo: true, head: false, lead: false, emp: false },
                        { feature: 'AI Configuration', ceo: true, head: true, lead: false, emp: false },
                      ].map((row) => (
                        <tr key={row.feature} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium">{row.feature}</td>
                          <td className="text-center py-3 px-4">
                            {row.ceo ? '✓' : '—'}
                          </td>
                          <td className="text-center py-3 px-4">
                            {row.head ? '✓' : '—'}
                          </td>
                          <td className="text-center py-3 px-4">
                            {row.lead ? '✓' : '—'}
                          </td>
                          <td className="text-center py-3 px-4">
                            {row.emp ? '✓' : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="positions" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Position to Role Mapping
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">
                  Roles are automatically assigned based on the sales team member's position. 
                  This ensures consistent access control without manual role assignment.
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4">Position</th>
                        <th className="text-left py-3 px-4">Assigned Role</th>
                        <th className="text-left py-3 px-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {SALES_POSITIONS_INFO.map((item) => (
                        <tr key={item.position} className="border-b border-border/50">
                          <td className="py-3 px-4 font-medium">{item.position}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-${item.color}-500/20 text-${item.color}-400`}>
                              <Shield className="h-3 w-3" />
                              {item.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {item.position === 'Sales Director' && 'Manages entire sales department, full reporting access'}
                            {item.position === 'Sales Manager' && 'Leads sales teams, manages quotas and targets'}
                            {item.position === 'Senior Salesman' && 'Experienced salesperson, mentors juniors'}
                            {item.position === 'Salesman' && 'Standard sales role, handles clients and deals'}
                            {item.position === 'Junior Salesman' && 'Entry-level, learning the sales process'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="text-primary">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <h4 className="font-medium mb-2">Add Team Member</h4>
                    <p className="text-sm text-muted-foreground">
                      Add a new salesman with their position. An employee record is automatically created.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <h4 className="font-medium mb-2">Role Auto-Assigned</h4>
                    <p className="text-sm text-muted-foreground">
                      Based on their position, the appropriate CRM role is automatically assigned.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-lg">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center mb-3">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <h4 className="font-medium mb-2">Customize Access</h4>
                    <p className="text-sm text-muted-foreground">
                      Fine-tune page permissions for individual users as needed.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
