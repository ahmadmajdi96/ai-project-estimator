import { CortaCentralLayout } from '@/components/cortacentral/CortaCentralLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCXOTenants, useAddCXOTenant } from '@/hooks/useCortaCentral';
import { Settings, Building, Users, Shield, Bell, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function CXOSettingsPage() {
  const { data: tenants } = useCXOTenants();
  const addTenant = useAddCXOTenant();
  const tenant = tenants?.[0];

  const [tenantForm, setTenantForm] = useState({
    name: '',
    slug: '',
    primary_region: 'us-east-1',
    plan: 'starter',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    providerHealth: true,
    conversationAlerts: true,
    aiInsights: false,
  });

  useEffect(() => {
    if (tenant) {
      setTenantForm({
        name: tenant.name,
        slug: tenant.slug,
        primary_region: tenant.primary_region,
        plan: tenant.plan,
      });
    }
  }, [tenant]);

  const handleCreateTenant = async () => {
    if (!tenantForm.name || !tenantForm.slug) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    await addTenant.mutateAsync({
      name: tenantForm.name,
      slug: tenantForm.slug.toLowerCase().replace(/\s+/g, '-'),
      primary_region: tenantForm.primary_region,
      plan: tenantForm.plan,
    });
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('cxo_notifications', JSON.stringify(notifications));
    toast.success('Notification preferences saved');
  };

  return (
    <CortaCentralLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your CX Orchestrator platform</p>
        </div>

        <Tabs defaultValue="tenant">
          <TabsList>
            <TabsTrigger value="tenant" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Tenant
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tenant" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tenant Configuration</CardTitle>
                <CardDescription>
                  {tenant ? 'Manage your organization settings' : 'Create your organization to get started'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Organization Name</Label>
                    <Input
                      value={tenantForm.name}
                      onChange={(e) => setTenantForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your Company"
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={tenantForm.slug}
                      onChange={(e) => setTenantForm(prev => ({ ...prev, slug: e.target.value }))}
                      placeholder="your-company"
                    />
                  </div>
                  <div>
                    <Label>Primary Region</Label>
                    <Input
                      value={tenantForm.primary_region}
                      onChange={(e) => setTenantForm(prev => ({ ...prev, primary_region: e.target.value }))}
                      placeholder="us-east-1"
                    />
                  </div>
                  <div>
                    <Label>Plan</Label>
                    <Input
                      value={tenantForm.plan}
                      onChange={(e) => setTenantForm(prev => ({ ...prev, plan: e.target.value }))}
                      placeholder="starter"
                      disabled={!!tenant}
                    />
                  </div>
                </div>
                {!tenant && (
                  <Button onClick={handleCreateTenant}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Organization
                  </Button>
                )}
                {tenant && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Tenant ID: <code className="bg-muted px-2 py-1 rounded">{tenant.id}</code>
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Status: <span className="text-green-500 font-medium capitalize">{tenant.status}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure how you receive alerts and updates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Alerts</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailAlerts}
                    onCheckedChange={(v) => setNotifications(prev => ({ ...prev, emailAlerts: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Provider Health Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get notified when providers have issues</p>
                  </div>
                  <Switch
                    checked={notifications.providerHealth}
                    onCheckedChange={(v) => setNotifications(prev => ({ ...prev, providerHealth: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Conversation Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alerts for urgent conversations</p>
                  </div>
                  <Switch
                    checked={notifications.conversationAlerts}
                    onCheckedChange={(v) => setNotifications(prev => ({ ...prev, conversationAlerts: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>AI Insights</Label>
                    <p className="text-sm text-muted-foreground">Weekly AI-generated insights</p>
                  </div>
                  <Switch
                    checked={notifications.aiInsights}
                    onCheckedChange={(v) => setNotifications(prev => ({ ...prev, aiInsights: v }))}
                  />
                </div>
                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Manage security and access controls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">Multi-Tenant Isolation</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your data is isolated at the database and application level. Other tenants cannot access your information.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">Role-Based Access Control</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Users have roles: Agent, Supervisor, Admin, Billing Owner. Manage roles in User Management.
                    </p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium">Audit Logging</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      All administrative actions and workflow changes are logged for compliance and debugging.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CortaCentralLayout>
  );
}
