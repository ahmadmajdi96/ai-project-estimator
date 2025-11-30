import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { UserManagement } from '@/components/crm/UserManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, UserPlus, Settings } from 'lucide-react';

export default function UsersRolesPage() {
  return (
    <CRMLayout title="Users & Roles">
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold">Users & Roles Management</h2>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="roles" className="gap-2">
              <Shield className="h-4 w-4" />
              Roles Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <UserManagement />
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
                    Department-level management capabilities
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Manage department members
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      Create tasks & roadmaps
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      View department reports
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
                    Team coordination and task management
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
                    Basic access for daily operations
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
        </Tabs>
      </div>
    </CRMLayout>
  );
}
