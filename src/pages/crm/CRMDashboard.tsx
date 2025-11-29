import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card } from '@/components/ui/card';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Users, FileText, Calendar, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { CLIENT_STATUSES, SALES_STAGES } from '@/types/crm';
import { format, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function CRMDashboard() {
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: events = [] } = useCalendarEvents();
  const navigate = useNavigate();

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    prospects: clients.filter(c => c.status === 'prospect').length,
    totalValue: clients.reduce((sum, c) => sum + (c.contract_value || 0), 0),
    followUps: clients.filter(c => c.follow_up_needed).length,
    pendingQuotes: quotes.filter(q => q.status === 'sent').length,
  };

  const upcomingEvents = events
    .filter(e => new Date(e.start_datetime) >= new Date())
    .slice(0, 5);

  const recentClients = clients.slice(0, 5);

  const statusDistribution = CLIENT_STATUSES.map(s => ({
    ...s,
    count: clients.filter(c => c.status === s.value).length,
  }));

  const stageDistribution = SALES_STAGES.map(s => ({
    ...s,
    count: clients.filter(c => c.sales_stage === s.value).length,
  }));

  return (
    <CRMLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalClients}</p>
                <p className="text-xs text-muted-foreground">Total Clients</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeClients}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.prospects}</p>
                <p className="text-xs text-muted-foreground">Prospects</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(stats.totalValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.followUps}</p>
                <p className="text-xs text-muted-foreground">Follow-ups</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingQuotes}</p>
                <p className="text-xs text-muted-foreground">Pending Quotes</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Status Distribution */}
          <Card className="p-4 bg-card/50 border-border/50">
            <h3 className="font-semibold mb-4">Client Status</h3>
            <div className="space-y-3">
              {statusDistribution.map(s => (
                <div key={s.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${s.color.split(' ')[0]}`} />
                    <span className="text-sm">{s.label}</span>
                  </div>
                  <span className="font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Pipeline Distribution */}
          <Card className="p-4 bg-card/50 border-border/50">
            <h3 className="font-semibold mb-4">Sales Pipeline</h3>
            <div className="space-y-3">
              {stageDistribution.map(s => (
                <div key={s.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${s.color.split(' ')[0]}`} />
                    <span className="text-sm">{s.label}</span>
                  </div>
                  <span className="font-medium">{s.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-4 bg-card/50 border-border/50">
            <h3 className="font-semibold mb-4">Upcoming Events</h3>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div 
                    key={event.id} 
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/30 cursor-pointer"
                    onClick={() => navigate('/crm/calendar')}
                  >
                    <Calendar className="h-4 w-4 text-primary mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(event.start_datetime), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No upcoming events</p>
            )}
          </Card>
        </div>

        {/* Recent Clients */}
        <Card className="p-4 bg-card/50 border-border/50">
          <h3 className="font-semibold mb-4">Recent Clients</h3>
          <div className="space-y-2">
            {recentClients.map(client => (
              <div 
                key={client.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer"
                onClick={() => navigate(`/crm/clients/${client.id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-medium">
                      {client.client_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{client.client_name}</p>
                    <p className="text-sm text-muted-foreground">{client.industry || 'No industry'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-primary">${client.contract_value?.toLocaleString() || 0}</p>
                  <p className="text-xs text-muted-foreground capitalize">{client.status}</p>
                </div>
              </div>
            ))}
            {recentClients.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No clients yet</p>
            )}
          </div>
        </Card>
      </div>
    </CRMLayout>
  );
}
