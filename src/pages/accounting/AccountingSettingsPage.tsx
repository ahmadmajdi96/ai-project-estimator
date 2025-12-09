import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { useAccountingAuth } from '@/hooks/useAccountingAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Users, Shield, Bell, Palette, Globe, CreditCard, FileText } from 'lucide-react';
import { toast } from 'sonner';

export default function AccountingSettingsPage() {
  const { accountingUser, company, isAdmin } = useAccountingAuth();

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-slate-400">Manage your accounting system configuration</p>
        </div>

        <Tabs defaultValue="company" className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="company" className="data-[state=active]:bg-emerald-600">
              <Building2 className="mr-2 h-4 w-4" />
              Company
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-emerald-600">
              <Users className="mr-2 h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-emerald-600">
              <Palette className="mr-2 h-4 w-4" />
              Preferences
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-600">
              <Bell className="mr-2 h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-emerald-600">
              <Shield className="mr-2 h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Company Information</CardTitle>
                <CardDescription className="text-slate-400">
                  Basic information about your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Company Name</Label>
                    <Input 
                      defaultValue={company?.name || ''} 
                      className="bg-slate-700/50 border-slate-600 text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Legal Name</Label>
                    <Input 
                      defaultValue={company?.legal_name || ''} 
                      className="bg-slate-700/50 border-slate-600 text-white" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Tax ID</Label>
                    <Input 
                      defaultValue={company?.tax_id || ''} 
                      className="bg-slate-700/50 border-slate-600 text-white" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Currency</Label>
                    <Select defaultValue={company?.currency || 'USD'}>
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="USD" className="text-white">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR" className="text-white">EUR - Euro</SelectItem>
                        <SelectItem value="GBP" className="text-white">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD" className="text-white">CAD - Canadian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Fiscal Year Start</Label>
                  <Select defaultValue={String(company?.fiscal_year_start || 1)}>
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="1" className="text-white">January</SelectItem>
                      <SelectItem value="4" className="text-white">April</SelectItem>
                      <SelectItem value="7" className="text-white">July</SelectItem>
                      <SelectItem value="10" className="text-white">October</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">User Management</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage users and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="text-white font-medium">{accountingUser?.first_name} {accountingUser?.last_name}</p>
                      <p className="text-sm text-slate-400">{accountingUser?.email}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-emerald-400 capitalize">{accountingUser?.role}</span>
                      <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
                        Edit
                      </Button>
                    </div>
                  </div>
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Users className="mr-2 h-4 w-4" />
                    Invite User
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Display Preferences</CardTitle>
                <CardDescription className="text-slate-400">
                  Customize how information is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Date Format</p>
                    <p className="text-sm text-slate-400">Choose your preferred date format</p>
                  </div>
                  <Select defaultValue="mdy">
                    <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="mdy" className="text-white">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy" className="text-white">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd" className="text-white">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Number Format</p>
                    <p className="text-sm text-slate-400">Choose your preferred number format</p>
                  </div>
                  <Select defaultValue="us">
                    <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="us" className="text-white">1,234.56</SelectItem>
                      <SelectItem value="eu" className="text-white">1.234,56</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Dark Mode</p>
                    <p className="text-sm text-slate-400">Use dark theme for the interface</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Email Notifications</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure email notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Invoice Reminders</p>
                    <p className="text-sm text-slate-400">Get notified about overdue invoices</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Payment Received</p>
                    <p className="text-sm text-slate-400">Get notified when payments are received</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Bill Due Reminders</p>
                    <p className="text-sm text-slate-400">Get notified about upcoming bills</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Weekly Summary</p>
                    <p className="text-sm text-slate-400">Receive a weekly financial summary</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage security and access controls
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-slate-400">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    Enable 2FA
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Session Timeout</p>
                    <p className="text-sm text-slate-400">Automatically log out after inactivity</p>
                  </div>
                  <Select defaultValue="30">
                    <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="15" className="text-white">15 minutes</SelectItem>
                      <SelectItem value="30" className="text-white">30 minutes</SelectItem>
                      <SelectItem value="60" className="text-white">1 hour</SelectItem>
                      <SelectItem value="never" className="text-white">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="pt-4 border-t border-slate-700">
                  <Button variant="outline" className="border-slate-600 text-slate-300">
                    View Audit Log
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AccountingLayout>
  );
}
