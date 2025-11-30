import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useReminders, 
  useUpcomingReminders, 
  useOverdueReminders,
  useAddReminder, 
  useCompleteReminder, 
  useDeleteReminder,
  REMINDER_TYPES,
  PRIORITY_LEVELS,
  Reminder
} from '@/hooks/useReminders';
import { useClients } from '@/hooks/useClients';
import { useSalesmen } from '@/hooks/useSalesmen';
import { 
  Bell, 
  Plus, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar,
  User,
  Building2,
  Trash2
} from 'lucide-react';
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns';

const RemindersPage = () => {
  const { data: allReminders = [], isLoading } = useReminders();
  const { data: upcomingReminders = [] } = useUpcomingReminders();
  const { data: overdueReminders = [] } = useOverdueReminders();
  const { data: clients = [] } = useClients();
  const { data: salesmen = [] } = useSalesmen();
  const addReminder = useAddReminder();
  const completeReminder = useCompleteReminder();
  const deleteReminder = useDeleteReminder();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_type: 'follow_up',
    due_date: '',
    priority: 'medium',
    related_client_id: '',
    related_salesman_id: '',
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      reminder_type: 'follow_up',
      due_date: '',
      priority: 'medium',
      related_client_id: '',
      related_salesman_id: '',
    });
  };

  const handleSave = async () => {
    if (!formData.title || !formData.due_date) return;

    await addReminder.mutateAsync({
      title: formData.title,
      description: formData.description || null,
      reminder_type: formData.reminder_type,
      due_date: new Date(formData.due_date).toISOString(),
      priority: formData.priority,
      related_client_id: formData.related_client_id || null,
      related_salesman_id: formData.related_salesman_id || null,
      is_completed: false,
      completed_at: null,
      assigned_to: null,
      created_by: null,
    });
    setIsDialogOpen(false);
    resetForm();
  };

  const handleComplete = async (id: string) => {
    await completeReminder.mutateAsync(id);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reminder?')) {
      await deleteReminder.mutateAsync(id);
    }
  };

  const activeReminders = allReminders.filter(r => !r.is_completed);
  const completedReminders = allReminders.filter(r => r.is_completed);

  const getDueDateLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isPast(date) && !isToday(date)) return { text: 'Overdue', variant: 'destructive' as const };
    if (isToday(date)) return { text: 'Today', variant: 'default' as const };
    if (isTomorrow(date)) return { text: 'Tomorrow', variant: 'secondary' as const };
    return { text: formatDistanceToNow(date, { addSuffix: true }), variant: 'outline' as const };
  };

  const getPriorityColor = (priority: string) => {
    return PRIORITY_LEVELS.find(p => p.value === priority)?.color || '#6b7280';
  };

  const getReminderTypeColor = (type: string) => {
    return REMINDER_TYPES.find(t => t.value === type)?.color || '#8b5cf6';
  };

  const ReminderCard = ({ reminder }: { reminder: Reminder }) => {
    const dueLabel = getDueDateLabel(reminder.due_date);
    const isOverdue = isPast(new Date(reminder.due_date)) && !isToday(new Date(reminder.due_date));

    return (
      <Card className={`transition-all hover:shadow-md ${reminder.is_completed ? 'opacity-60' : ''} ${isOverdue && !reminder.is_completed ? 'border-destructive/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={reminder.is_completed}
              onCheckedChange={() => !reminder.is_completed && handleComplete(reminder.id)}
              disabled={reminder.is_completed}
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium ${reminder.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                  {reminder.title}
                </h4>
                <Badge variant={dueLabel.variant} className="text-xs">
                  {dueLabel.text}
                </Badge>
              </div>
              {reminder.description && (
                <p className="text-sm text-muted-foreground mb-2">{reminder.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline" style={{ borderColor: getReminderTypeColor(reminder.reminder_type) }}>
                  {REMINDER_TYPES.find(t => t.value === reminder.reminder_type)?.label}
                </Badge>
                <Badge variant="outline" style={{ borderColor: getPriorityColor(reminder.priority) }}>
                  {PRIORITY_LEVELS.find(p => p.value === reminder.priority)?.label}
                </Badge>
                {reminder.clients && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Building2 className="h-3 w-3" />
                    {reminder.clients.client_name}
                  </span>
                )}
                {reminder.salesmen && (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <User className="h-3 w-3" />
                    {reminder.salesmen.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground">
                {format(new Date(reminder.due_date), 'MMM d, HH:mm')}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleDelete(reminder.id)}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
              <Bell className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Reminders</h1>
              <p className="text-muted-foreground">Stay on top of your follow-ups and tasks</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Reminder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Follow up with John about proposal"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea
                    placeholder="Add more details..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.reminder_type}
                      onValueChange={(value) => setFormData({ ...formData, reminder_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {REMINDER_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) => setFormData({ ...formData, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_LEVELS.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Due Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Related Client (optional)</Label>
                    <Select
                      value={formData.related_client_id}
                      onValueChange={(value) => setFormData({ ...formData, related_client_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select client..." />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.client_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Assign To (optional)</Label>
                    <Select
                      value={formData.related_salesman_id}
                      onValueChange={(value) => setFormData({ ...formData, related_salesman_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select salesman..." />
                      </SelectTrigger>
                      <SelectContent>
                        {salesmen.map((salesman) => (
                          <SelectItem key={salesman.id} value={salesman.id}>
                            {salesman.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.title || !formData.due_date}>
                    Create Reminder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingReminders.length}</p>
                <p className="text-xs text-muted-foreground">Upcoming (7 days)</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overdueReminders.length}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeReminders.length}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedReminders.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="active" className="gap-2">
              <Bell className="h-4 w-4" />
              Active ({activeReminders.length})
            </TabsTrigger>
            <TabsTrigger value="overdue" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Overdue ({overdueReminders.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completedReminders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : activeReminders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Reminders</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create reminders to stay on top of your follow-ups
                  </p>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Reminder
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>

          <TabsContent value="overdue" className="space-y-3">
            {overdueReminders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground text-center">
                    No overdue reminders. Great job!
                  </p>
                </CardContent>
              </Card>
            ) : (
              overdueReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-3">
            {completedReminders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Completed Reminders</h3>
                  <p className="text-muted-foreground text-center">
                    Completed reminders will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              completedReminders.map((reminder) => (
                <ReminderCard key={reminder.id} reminder={reminder} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
};

export default RemindersPage;
