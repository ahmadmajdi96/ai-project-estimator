import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useCalendarEvents, useAddCalendarEvent, useDeleteCalendarEvent } from '@/hooks/useCalendarEvents';
import { useClients } from '@/hooks/useClients';
import { EVENT_TYPES, EventType } from '@/types/crm';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function CalendarPage() {
  const { data: events = [] } = useCalendarEvents();
  const { data: clients = [] } = useClients();
  const addEvent = useAddCalendarEvent();
  const deleteEvent = useDeleteCalendarEvent();
  const navigate = useNavigate();

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
      title: event.title,
      start: event.start_datetime,
      end: event.end_datetime,
      backgroundColor: eventType?.color || '#06b6d4',
      borderColor: eventType?.color || '#06b6d4',
      extendedProps: {
        client_id: event.client_id,
        event_type: event.event_type,
      },
    };
  });

  const handleDateClick = (info: any) => {
    setSelectedDate(new Date(info.date));
    setDialogOpen(true);
  };

  const handleEventClick = (info: any) => {
    const clientId = info.event.extendedProps.client_id;
    if (clientId) {
      navigate(`/crm/clients/${clientId}`);
    }
  };

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

  return (
    <CRMLayout title="Calendar">
      <div className="bg-card/50 rounded-lg border border-border/50 p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="auto"
          eventDisplay="block"
          dayMaxEvents={3}
        />
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Add Event - {selectedDate && format(selectedDate, 'MMM d, yyyy')}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Event title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
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
              <Label>Client (Optional)</Label>
              <Select
                value={formData.client_id}
                onValueChange={(v) => setFormData({ ...formData, client_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No client</SelectItem>
                  {clients.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Meeting location"
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

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addEvent.isPending}>
                Add Event
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
