import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Bell, Calculator, Link, Shield } from "lucide-react";

export default function SettingsPage() {
  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Configure your logistics portal</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-5 lg:w-[600px]">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Link className="w-4 h-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure general logistics settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" placeholder="Your Company" />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" defaultValue="America/New_York" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="currency">Default Currency</Label>
                    <Input id="currency" defaultValue="USD" />
                  </div>
                  <div>
                    <Label htmlFor="distance">Distance Unit</Label>
                    <Input id="distance" defaultValue="Miles" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-generate Shipment Numbers</Label>
                    <p className="text-sm text-muted-foreground">Automatically generate unique shipment numbers</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Configure when and how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shipment Dispatched</Label>
                    <p className="text-sm text-muted-foreground">Notify when a shipment is dispatched</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Shipment Delivered</Label>
                    <p className="text-sm text-muted-foreground">Notify when a shipment is delivered</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Expense Pending Approval</Label>
                    <p className="text-sm text-muted-foreground">Notify when driver expenses need approval</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Carrier Insurance Expiring</Label>
                    <p className="text-sm text-muted-foreground">Notify when carrier insurance is about to expire</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Billing Settings</CardTitle>
                <CardDescription>Configure billing and invoicing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="payment_terms">Default Payment Terms (days)</Label>
                    <Input id="payment_terms" type="number" defaultValue="30" />
                  </div>
                  <div>
                    <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                    <Input id="invoice_prefix" defaultValue="INV-" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-create Invoice on Delivery</Label>
                    <p className="text-sm text-muted-foreground">Automatically create AR invoice when shipment is delivered</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-create Carrier Bill on Delivery</Label>
                    <p className="text-sm text-muted-foreground">Automatically create AP bill when shipment is delivered</p>
                  </div>
                  <Switch />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="integrations" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrations</CardTitle>
                <CardDescription>Connect with external services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Accounting System</p>
                      <p className="text-sm text-muted-foreground">Sync with your GL and chart of accounts</p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">GPS Tracking</p>
                      <p className="text-sm text-muted-foreground">Real-time vehicle tracking integration</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">ELD Provider</p>
                      <p className="text-sm text-muted-foreground">Electronic logging device integration</p>
                    </div>
                    <Button variant="outline">Connect</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Input type="number" defaultValue="30" className="w-24" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Audit Logging</Label>
                    <p className="text-sm text-muted-foreground">Log all user actions for compliance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Security Settings</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </LogisticsLayout>
  );
}
