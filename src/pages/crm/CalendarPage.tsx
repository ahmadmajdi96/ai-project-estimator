import { useState, useRef, useCallback } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useCalendarEvents, useAddCalendarEvent, useDeleteCalendarEvent, useUpdateCalendarEvent } from '@/hooks/useCalendarEvents';
import { useClients } from '@/hooks/useClients';
import { useSalesmen } from '@/hooks/useSalesmen';
import { EVENT_TYPES, EventType } from '@/types/crm';
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, addMonths, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Plus,
  List,
  Grid3X3,
  Clock,
  MapPin,
  User,
  FileText,
  Loader2
} from 'lucide-react';

const CALENDAR_THEMES = {
  common: {
    backgroundColor: 'transparent',
    border: '1px solid hsl(var(--border))',
    gridSelection: {
      backgroundColor: 'hsl(var(--primary) / 0.1)',
      border: '1px solid hsl(var(--primary))',
    },
    dayName: {
      color: 'hsl(var(--muted-foreground))',
    },
    holiday: {
      color: 'hsl(var(--destructive))',
    },
    saturday: {
      color: 'hsl(var(--primary))',
    },
    today: {
      color: 'hsl(var(--primary-foreground))',
      backgroundColor: 'hsl(var(--primary))',
    },
  },
  month: {
    dayExceptThisMonth: {
      color: 'hsl(var(--muted-foreground) / 0.5)',
    },
    moreView: {
      backgroundColor: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    moreViewTitle: {
      backgroundColor: 'hsl(var(--muted))',
    },
  },
  week: {
    dayName: {
      borderLeft: '1px solid hsl(var(--border))',
      borderTop: '1px solid hsl(var(--border))',
      borderBottom: '1px solid hsl(var(--border))',
      backgroundColor: 'hsl(var(--muted) / 0.3)',
    },
    timeGridLeft: {
      backgroundColor: 'hsl(var(--muted) / 0.3)',
    },
    today: {
      backgroundColor: 'hsl(var(--primary) / 0.05)',
    },
    pastTime: {
      color: 'hsl(var(--muted-foreground) / 0.5)',
    },
    futureTime: {
      color: 'hsl(var(--foreground))',
    },
    nowIndicatorLabel: {
      color: 'hsl(var(--primary))',
    },
    nowIndicatorBullet: {
      backgroundColor: 'hsl(var(--primary))',
    },
    nowIndicatorPast: {
      border: '1px dashed hsl(var(--primary))',
    },
    nowIndicatorToday: {
      border: '1px solid hsl(var(--primary))',
    },
  },
};

const CALENDARS = EVENT_TYPES.map(type => ({
  id: type.value,
  name: type.label,
  backgroundColor: type.color,
  borderColor: type.color,
  dragBackgroundColor: type.color,
}));

type ViewType = 'month' | 'week' | 'day';

export default function CalendarPage() {
  const { data: events = [], isLoading } = useCalendarEvents();
  const { data: clients = [] } = useClients();
  const { data: salesmen = [] } = useSalesmen();
  const addEvent = useAddCalendarEvent();
  const updateEvent = useUpdateCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const navigate = useNavigate();
  const calendarRef = useRef<any>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState<ViewType>('month');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    event_type: 'meeting' as EventType,
    location: '',
    notes: '',
    start_time: '09:00',
    end_time: '10:00',
  });

  const calendarEvents = events.map(event => {
    const eventType = EVENT_TYPES.find(t => t.value === event.event_type);
    return {
      id: event.id,
      calendarId: event.event_type,
      title: event.title,
      start: new Date(event.start_datetime),
      end: new Date(event.end_datetime),
      category: 'time',
      location: event.location || '',
      body: event.notes || '',
      raw: {
        client_id: event.client_id,
        event_type: event.event_type,
      },
    };
  });

  const handlePrev = useCallback(() => {
    const instance = calendarRef.current?.getInstance();
    if (instance) {
      instance.prev();
      setCurrentDate(instance.getDate().toDate());
    }
  }, []);

  const handleNext = useCallback(() => {
    const instance = calendarRef.current?.getInstance();
    if (instance) {
      instance.next();
      setCurrentDate(instance.getDate().toDate());
    }
  }, []);

  const handleToday = useCallback(() => {
    const instance = calendarRef.current?.getInstance();
    if (instance) {
      instance.today();
      setCurrentDate(new Date());
    }
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    const instance = calendarRef.current?.getInstance();
    if (instance) {
      instance.changeView(view);
      setCurrentView(view);
    }
  }, []);

  const handleSelectDateTime = useCallback((info: any) => {
    setSelectedDate(new Date(info.start));
    const startTime = format(new Date(info.start), 'HH:mm');
    const endTime = format(new Date(info.end), 'HH:mm');
    setFormData(prev => ({
      ...prev,
      start_time: startTime,
      end_time: endTime,
    }));
    setDialogOpen(true);
  }, []);

  const handleClickEvent = useCallback((info: any) => {
    const clientId = info.event.raw?.client_id;
    if (clientId) {
      navigate(`/crm/clients/${clientId}`);
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !formData.title) return;

    const startDateTime = new Date(selectedDate);
    const [startHour, startMin] = formData.start_time.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMin));

    const endDateTime = new Date(selectedDate);
    const [endHour, endMin] = formData.end_time.split(':');
    endDateTime.setHours(parseInt(endHour), parseInt(endMin));

    await addEvent.mutateAsync({
      title: formData.title,
      client_id: formData.client_id || null,
      event_type: formData.event_type,
      location: formData.location || null,
      notes: formData.notes || null,
      start_datetime: startDateTime.toISOString(),
      end_datetime: endDateTime.toISOString(),
    });

    setDialogOpen(false);
    setFormData({
      title: '',
      client_id: '',
      event_type: 'meeting',
      location: '',
      notes: '',
      start_time: '09:00',
      end_time: '10:00',
    });
  };

  // Stats for sidebar
  const thisMonthEvents = events.filter(e => {
    const eventDate = new Date(e.start_datetime);
    return eventDate >= startOfMonth(currentDate) && eventDate <= endOfMonth(currentDate);
  });

  const upcomingEvents = events
    .filter(e => new Date(e.start_datetime) >= new Date())
    .sort((a, b) => new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <CRMLayout title="Calendar">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Calendar & Scheduling">
      <div className="grid lg:grid-cols-[1fr,320px] gap-6">
        {/* Main Calendar */}
        <div className="space-y-4">
          {/* Calendar Header */}
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handleNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button variant="outline" onClick={handleToday}>Today</Button>
                <h2 className="text-xl font-semibold">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <Button 
                    variant={currentView === 'month' ? 'default' : 'ghost'} 
                    size="sm"
                    className="rounded-none"
                    onClick={() => handleViewChange('month')}
                  >
                    <Grid3X3 className="h-4 w-4 mr-1" />
                    Month
                  </Button>
                  <Button 
                    variant={currentView === 'week' ? 'default' : 'ghost'} 
                    size="sm"
                    className="rounded-none border-l border-border"
                    onClick={() => handleViewChange('week')}
                  >
                    <List className="h-4 w-4 mr-1" />
                    Week
                  </Button>
                  <Button 
                    variant={currentView === 'day' ? 'default' : 'ghost'} 
                    size="sm"
                    className="rounded-none border-l border-border"
                    onClick={() => handleViewChange('day')}
                  >
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Day
                  </Button>
                </div>
                <Button onClick={() => { setSelectedDate(new Date()); setDialogOpen(true); }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Event
                </Button>
              </div>
            </div>
          </Card>

          {/* Calendar Component */}
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <div className="p-1">
              <Calendar
                ref={calendarRef}
                height="650px"
                view={currentView}
                calendars={CALENDARS}
                events={calendarEvents}
                onSelectDateTime={handleSelectDateTime}
                onClickEvent={handleClickEvent}
                useDetailPopup={false}
                useFormPopup={false}
                isReadOnly={false}
                usageStatistics={false}
                theme={CALENDAR_THEMES}
                week={{
                  startDayOfWeek: 1,
                  dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  taskView: false,
                  eventView: ['time'],
                  hourStart: 7,
                  hourEnd: 20,
                }}
                month={{
                  dayNames: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                  startDayOfWeek: 1,
                  visibleWeeksCount: 0,
                }}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Event Types Legend */}
          <Card className="p-4 bg-card/50 border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" />
              Event Types
            </h3>
            <div className="space-y-2">
              {EVENT_TYPES.map(type => {
                const count = thisMonthEvents.filter(e => e.event_type === type.value).length;
                return (
                  <div key={type.value} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }} 
                      />
                      <span className="text-sm">{type.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">{count}</Badge>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Month Stats */}
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <h3 className="font-semibold mb-3">This Month</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-2xl font-bold text-primary">{thisMonthEvents.length}</p>
                <p className="text-xs text-muted-foreground">Events</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-background/50">
                <p className="text-2xl font-bold text-emerald-400">
                  {thisMonthEvents.filter(e => e.event_type === 'meeting').length}
                </p>
                <p className="text-xs text-muted-foreground">Meetings</p>
              </div>
            </div>
          </Card>

          {/* Upcoming Events */}
          <Card className="p-4 bg-card/50 border-border/50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              Upcoming
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map(event => {
                const eventType = EVENT_TYPES.find(t => t.value === event.event_type);
                const client = clients.find(c => c.id === event.client_id);
                return (
                  <div 
                    key={event.id} 
                    className="p-3 rounded-lg bg-muted/30 border-l-4 hover:bg-muted/50 transition-colors cursor-pointer"
                    style={{ borderColor: eventType?.color }}
                    onClick={() => event.client_id && navigate(`/crm/clients/${event.client_id}`)}
                  >
                    <p className="font-medium text-sm">{event.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.start_datetime), 'MMM d, h:mm a')}
                    </p>
                    {client && (
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {client.client_name}
                      </p>
                    )}
                  </div>
                );
              })}
              {upcomingEvents.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No upcoming events
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Event Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate && format(selectedDate, 'MMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Title *
              </Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Start Time
                </Label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.event_type}
                onValueChange={(v) => setFormData({ ...formData, event_type: v as EventType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color }} />
                        {t.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Client (Optional)
              </Label>
              <Select
                value={formData.client_id || "none"}
                onValueChange={(v) => setFormData({ ...formData, client_id: v === "none" ? "" : v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No client</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Meeting location or link"
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addEvent.isPending} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
