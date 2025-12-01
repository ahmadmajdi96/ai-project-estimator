import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// Settings functionality simplified for this page
import { useAIConfigs, useAddAIConfig, useUpdateAIConfig } from '@/hooks/useAIConfig';
import { Settings, Bot, Bell, Shield, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function ManagementConfigPage() {
  const { data: aiConfigs } = useAIConfigs();
  const addAIConfig = useAddAIConfig();
  const updateAIConfig = useUpdateAIConfig();

  const [generalSettings, setGeneralSettings] = useState({
    companyName: '',
    timezone: 'UTC',
    dateFormat: 'MM/dd/yyyy',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    taskReminders: true,
    kpiAlerts: true,
  });

  const [aiSettings, setAiSettings] = useState({
    name: 'Management Assistant',
    systemPrompt: 'You are a helpful management assistant focused on organizational efficiency.',
    personality: 'professional',
    isActive: true,
  });

  const activeAIConfig = aiConfigs?.find(c => c.is_active);

  useEffect(() => {
    if (activeAIConfig) {
      setAiSettings({
        name: activeAIConfig.name,
        systemPrompt: activeAIConfig.system_prompt || '',
        personality: activeAIConfig.personality || 'professional',
        isActive: activeAIConfig.is_active || true,
      });
    }
  }, [activeAIConfig]);

  const handleSaveGeneral = async () => {
    // Settings saved to local storage for now
    localStorage.setItem('management_general_settings', JSON.stringify(generalSettings));
    toast.success('General settings saved');
  };

  const handleSaveNotifications = async () => {
    localStorage.setItem('management_notification_settings', JSON.stringify(notificationSettings));
    toast.success('Notification settings saved');
  };

  const handleSaveAI = async () => {
    try {
      if (activeAIConfig) {
        await updateAIConfig.mutateAsync({
          id: activeAIConfig.id,
          name: aiSettings.name,
          system_prompt: aiSettings.systemPrompt,
          personality: aiSettings.personality,
          is_active: aiSettings.isActive,
        });
      } else {
        await addAIConfig.mutateAsync({
          name: aiSettings.name,
          system_prompt: aiSettings.systemPrompt,
          personality: aiSettings.personality,
          is_active: aiSettings.isActive,
        });
      }
      toast.success('AI settings saved');
    } catch (error) {
      toast.error('Failed to save AI settings');
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">Manage system settings and preferences</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              AI Settings
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure basic system preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Company Name</Label>
                  <Input
                    value={generalSettings.companyName}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="Your Company"
                  />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                    placeholder="UTC"
                  />
                </div>
                <div>
                  <Label>Date Format</Label>
                  <Input
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings(prev => ({ ...prev, dateFormat: e.target.value }))}
                    placeholder="MM/dd/yyyy"
                  />
                </div>
                <Button onClick={handleSaveGeneral}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Control how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, emailNotifications: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming tasks</p>
                  </div>
                  <Switch
                    checked={notificationSettings.taskReminders}
                    onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, taskReminders: v }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>KPI Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alerts when KPIs are below target</p>
                  </div>
                  <Switch
                    checked={notificationSettings.kpiAlerts}
                    onCheckedChange={(v) => setNotificationSettings(prev => ({ ...prev, kpiAlerts: v }))}
                  />
                </div>
                <Button onClick={handleSaveNotifications}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Assistant Configuration</CardTitle>
                <CardDescription>Customize your AI assistant behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Assistant Name</Label>
                  <Input
                    value={aiSettings.name}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Management Assistant"
                  />
                </div>
                <div>
                  <Label>System Prompt</Label>
                  <Textarea
                    value={aiSettings.systemPrompt}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, systemPrompt: e.target.value }))}
                    placeholder="Define the AI's behavior and focus areas"
                    rows={4}
                  />
                </div>
                <div>
                  <Label>Personality</Label>
                  <Input
                    value={aiSettings.personality}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, personality: e.target.value }))}
                    placeholder="professional, friendly, concise"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Active</Label>
                    <p className="text-sm text-muted-foreground">Enable AI assistant</p>
                  </div>
                  <Switch
                    checked={aiSettings.isActive}
                    onCheckedChange={(v) => setAiSettings(prev => ({ ...prev, isActive: v }))}
                  />
                </div>
                <Button onClick={handleSaveAI}>
                  <Save className="h-4 w-4 mr-2" />
                  Save AI Settings
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
                <p className="text-muted-foreground">Security settings are managed through the Users & Roles section.</p>
                <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/management/users'}>
                  Go to Users & Roles
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ManagementLayout>
  );
}
