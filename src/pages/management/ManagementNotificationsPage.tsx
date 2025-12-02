import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotifications, useMarkNotificationAsRead, useMarkAllNotificationsAsRead } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { CheckCheck, ExternalLink } from 'lucide-react';

export default function ManagementNotificationsPage() {
  const { data: notifications } = useNotifications();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const navigate = useNavigate();

  const unreadCount = notifications?.filter(n => !n.is_read).length || 0;

  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.link_url) {
      navigate(notification.link_url);
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <Button onClick={() => markAllAsRead.mutate()} variant="outline">
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            {notifications && notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.is_read 
                        ? 'bg-background hover:bg-muted/50' 
                        : 'bg-primary/5 hover:bg-primary/10 border-primary/20'
                    } cursor-pointer`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant={notification.is_read ? 'secondary' : 'default'}>
                            {notification.type}
                          </Badge>
                          {!notification.is_read && (
                            <span className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(notification.created_at), 'MMM dd, yyyy HH:mm')}
                        </p>
                      </div>
                      {notification.link_url && (
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                No notifications yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}