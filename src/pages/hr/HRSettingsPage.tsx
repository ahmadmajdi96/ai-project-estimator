import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Clock, Calendar, DollarSign, Shield, Bell } from "lucide-react";
import { useHRSettings } from "@/hooks/useHR";

export default function HRSettingsPage() {
  const { data: settings, isLoading } = useHRSettings();

  const getSetting = (key: string): Record<string, any> => {
    const value = settings?.find((s: any) => s.setting_key === key)?.setting_value;
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
  };

  const workWeek = getSetting('work_week') as { days?: string[]; hours_per_day?: number };
  const overtimeRules = getSetting('overtime_rules') as { rate?: number; max_hours_per_week?: number };
  const probationPeriod = getSetting('probation_period') as { months?: number };

  return (
    <HRLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Settings</h1>
          <p className="text-muted-foreground">Configure HR policies and system settings</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="leave">Leave</TabsTrigger>
            <TabsTrigger value="payroll">Payroll</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>Basic HR configuration options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Probation Period (months)</Label>
                    <Input
                      type="number"
                      defaultValue={probationPeriod.months || 3}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Default Currency</Label>
                    <Input defaultValue="USD" placeholder="USD" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-approve simple leave requests</Label>
                    <p className="text-sm text-muted-foreground">Automatically approve leaves of 1-2 days</p>
                  </div>
                  <Switch />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Work Week Configuration
                </CardTitle>
                <CardDescription>Define standard working hours and days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Working Days</Label>
                    <div className="flex flex-wrap gap-2">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <Button
                          key={day}
                          variant={workWeek.days?.includes(day.toLowerCase()) ? "default" : "outline"}
                          size="sm"
                        >
                          {day.slice(0, 3)}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>Hours per Day</Label>
                      <Input type="number" defaultValue={workWeek.hours_per_day || 8} />
                    </div>
                    <div className="space-y-2">
                      <Label>Work Start Time</Label>
                      <Input type="time" defaultValue="09:00" />
                    </div>
                    <div className="space-y-2">
                      <Label>Work End Time</Label>
                      <Input type="time" defaultValue="17:00" />
                    </div>
                  </div>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Overtime Rules
                </CardTitle>
                <CardDescription>Configure overtime calculation policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Overtime Rate Multiplier</Label>
                    <Input type="number" step="0.1" defaultValue={overtimeRules.rate || 1.5} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Overtime Hours/Week</Label>
                    <Input type="number" defaultValue={overtimeRules.max_hours_per_week || 10} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Manager Approval</Label>
                    <p className="text-sm text-muted-foreground">Overtime must be approved by manager</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leave" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Leave Policies
                </CardTitle>
                <CardDescription>Configure leave types and policies</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Leave Year Start Month</Label>
                    <Input type="number" min="1" max="12" defaultValue="1" placeholder="1" />
                  </div>
                  <div className="space-y-2">
                    <Label>Carry Forward Days</Label>
                    <Input type="number" defaultValue="5" placeholder="5" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Negative Balance</Label>
                    <p className="text-sm text-muted-foreground">Allow employees to take leave in advance</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Multi-level Approval</Label>
                    <p className="text-sm text-muted-foreground">Require HR approval after manager approval</p>
                  </div>
                  <Switch />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payroll" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Payroll Settings
                </CardTitle>
                <CardDescription>Configure payroll processing options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Pay Frequency</Label>
                    <Input defaultValue="Monthly" placeholder="Monthly" />
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Day</Label>
                    <Input type="number" min="1" max="31" defaultValue="25" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-calculate Tax</Label>
                    <p className="text-sm text-muted-foreground">Automatically calculate tax deductions</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Include Overtime in Payroll</Label>
                    <p className="text-sm text-muted-foreground">Auto-sync approved overtime to payroll</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure HR notifications and alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {[
                    { label: 'Leave Request Notifications', desc: 'Notify managers of new leave requests' },
                    { label: 'Document Expiry Alerts', desc: 'Alert before documents expire' },
                    { label: 'Probation End Reminders', desc: 'Remind before probation period ends' },
                    { label: 'Birthday Notifications', desc: 'Notify about employee birthdays' },
                    { label: 'Payroll Processing Alerts', desc: 'Alert before payroll processing deadline' },
                    { label: 'Performance Review Reminders', desc: 'Remind about upcoming reviews' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div>
                        <Label>{item.label}</Label>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </HRLayout>
  );
}
