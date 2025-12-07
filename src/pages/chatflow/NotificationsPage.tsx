import { useState } from 'react';
import { ChatFlowLayout } from '@/components/chatflow/ChatFlowLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  Check, 
  Trash2, 
  Mail, 
  MessageSquare, 
  Bot, 
  AlertCircle,
  CheckCircle,
  Clock,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';

// Mock notifications data
const mockNotifications = [
  {
    id: '1',
    type: 'chatbot',
    title: 'Chatbot activated',
    message: 'Your chatbot "Customer Support" is now live and ready to handle conversations.',
    read: false,
    createdAt: new Date().toISOString(),
    icon: Bot,
  },
  {
    id: '2',
    type: 'alert',
    title: 'High message volume',
    message: 'Your chatbot "Sales Assistant" is experiencing higher than usual traffic.',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    icon: AlertCircle,
  },
  {
    id: '3',
    type: 'success',
    title: 'Training completed',
    message: 'AI model training for "FAQ Bot" has been completed successfully.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    icon: CheckCircle,
  },
  {
    id: '4',
    type: 'message',
    title: 'New conversation',
    message: 'A new conversation was started on the Website widget.',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    icon: MessageSquare,
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    chatbotAlerts: true,
    conversationAlerts: true,
    trainingAlerts: true,
    usageAlerts: true,
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'alert':
        return 'text-yellow-500';
      case 'success':
        return 'text-green-500';
      case 'chatbot':
        return 'text-primary';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <ChatFlowLayout title="Notifications">
      <Tabs defaultValue="all" className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              All
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-1.5">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAll}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear all
            </Button>
          </div>
        </div>

        <TabsContent value="all" className="space-y-4">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`transition-colors ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg bg-muted ${getIconColor(notification.type)}`}>
                      <notification.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                        </span>
                        <div className="flex gap-2">
                          {!notification.read && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => markAsRead(notification.id)}
                            >
                              Mark as read
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No notifications</h3>
                <p className="text-muted-foreground text-center">
                  You're all caught up! New notifications will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications.filter(n => !n.read).length > 0 ? (
            notifications
              .filter(n => !n.read)
              .map((notification) => (
                <Card 
                  key={notification.id} 
                  className="bg-primary/5 border-primary/20"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-lg bg-muted ${getIconColor(notification.type)}`}>
                        <notification.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(notification.createdAt), 'MMM d, HH:mm')}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => markAsRead(notification.id)}
                          >
                            Mark as read
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No unread notifications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about important events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Delivery Methods</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Notification Types</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Chatbot Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Status changes, errors, and updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.chatbotAlerts}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, chatbotAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Conversation Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      New conversations and escalations
                    </p>
                  </div>
                  <Switch
                    checked={settings.conversationAlerts}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, conversationAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Training Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      AI model training status updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.trainingAlerts}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, trainingAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Usage Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Billing and usage limit warnings
                    </p>
                  </div>
                  <Switch
                    checked={settings.usageAlerts}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({ ...prev, usageAlerts: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ChatFlowLayout>
  );
}
