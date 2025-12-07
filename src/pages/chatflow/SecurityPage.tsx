import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  Shield, 
  Lock, 
  Key, 
  Smartphone, 
  Globe, 
  AlertTriangle,
  CheckCircle,
  Clock,
  LogOut,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';

// Mock sessions data
const mockSessions = [
  {
    id: '1',
    device: 'Chrome on Windows',
    location: 'New York, US',
    ip: '192.168.1.1',
    lastActive: new Date().toISOString(),
    current: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    location: 'Los Angeles, US',
    ip: '192.168.1.2',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    current: false,
  },
];

// Mock activity log
const mockActivityLog = [
  {
    id: '1',
    action: 'Login successful',
    location: 'New York, US',
    device: 'Chrome on Windows',
    timestamp: new Date().toISOString(),
    status: 'success',
  },
  {
    id: '2',
    action: 'Password changed',
    location: 'New York, US',
    device: 'Chrome on Windows',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: 'success',
  },
  {
    id: '3',
    action: 'Failed login attempt',
    location: 'Unknown',
    device: 'Firefox on Linux',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: 'warning',
  },
];

export default function SecurityPage() {
  const [sessions] = useState(mockSessions);
  const [activityLog] = useState(mockActivityLog);
  const [settings, setSettings] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: true,
    ipWhitelist: false,
  });

  return (
    <ChatFlowLayout title="Security">
      <div className="space-y-6">
        {/* Security Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Shield className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security Score</p>
                  <p className="text-2xl font-bold">Good</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Smartphone className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold">{sessions.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security Alerts</p>
                  <p className="text-2xl font-bold">1</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Configure your account security preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  <Label>Two-Factor Authentication</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.twoFactor}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, twoFactor: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <Label>Login Alerts</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Get notified when someone logs into your account
                </p>
              </div>
              <Switch
                checked={settings.loginAlerts}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, loginAlerts: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <Label>Session Timeout</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Automatically log out after 24 hours of inactivity
                </p>
              </div>
              <Switch
                checked={settings.sessionTimeout}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, sessionTimeout: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <Label>IP Whitelist</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Only allow access from specific IP addresses
                </p>
              </div>
              <Switch
                checked={settings.ipWhitelist}
                onCheckedChange={(checked) => 
                  setSettings(prev => ({ ...prev, ipWhitelist: checked }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Password */}
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password or set up a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>
              <div></div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>
            </div>
            <Button>Update Password</Button>
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                  Manage devices where you're logged in
                </CardDescription>
              </div>
              <Button variant="outline" className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign out all devices
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map((session) => (
              <div 
                key={session.id} 
                className={`p-4 rounded-lg border ${session.current ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.current && (
                          <Badge variant="default" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{session.location}</span>
                        <span>IP: {session.ip}</span>
                        <span>Last active: {format(new Date(session.lastActive), 'MMM d, HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm" className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign out
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Security Activity</CardTitle>
            <CardDescription>
              Recent security-related events on your account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityLog.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
              >
                {activity.status === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{activity.device}</span>
                    <span>{activity.location}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(activity.timestamp), 'MMM d, HH:mm')}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </ChatFlowLayout>
  );
}
