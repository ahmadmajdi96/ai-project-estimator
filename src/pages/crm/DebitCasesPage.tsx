import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useDebitCases, useAddDebitCase, useUpdateDebitCase, useDeleteDebitCase, DebitCase } from '@/hooks/useDebitCases';
import { useDebitCollectors } from '@/hooks/useDebitCollectors';
import { useDebitPipelineStages } from '@/hooks/useDebitPipelineStages';
import { useClients } from '@/hooks/useClients';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Edit, Trash2, Loader2, DollarSign } from 'lucide-react';

export default function DebitCasesPage() {
  const { data: cases = [], isLoading } = useDebitCases();
  const { data: collectors = [] } = useDebitCollectors();
  const { data: stages = [] } = useDebitPipelineStages();
  const { data: clients = [] } = useClients();
  const addCase = useAddDebitCase();
  const updateCase = useUpdateDebitCase();
  const deleteCase = useDeleteDebitCase();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DebitCase | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    client_id: '',
    collector_id: '',
    original_amount: 0,
    current_amount: 0,
    priority: 'medium',
    due_date: '',
  });

  const handleSave = async () => {
    if (!form.title) return;
    const payload = {
      ...form,
      client_id: form.client_id || null,
      collector_id: form.collector_id || null,
      due_date: form.due_date || null,
    };
    if (editing) {
      await updateCase.mutateAsync({ id: editing.id, ...payload });
    } else {
      await addCase.mutateAsync(payload);
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ title: '', description: '', client_id: '', collector_id: '', original_amount: 0, current_amount: 0, priority: 'medium', due_date: '' });
  };

  const handleEdit = (c: DebitCase) => {
    setEditing(c);
    setForm({
      title: c.title,
      description: c.description || '',
      client_id: c.client_id || '',
      collector_id: c.collector_id || '',
      original_amount: c.original_amount,
      current_amount: c.current_amount,
      priority: c.priority,
      due_date: c.due_date || '',
    });
    setDialogOpen(true);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const caseId = result.draggableId;
    const newStage = result.destination.droppableId;
    updateCase.mutate({ id: caseId, stage: newStage });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Debit Cases</h1>
            <p className="text-muted-foreground">Manage debt collection cases</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setEditing(null); setForm({ title: '', description: '', client_id: '', collector_id: '', original_amount: 0, current_amount: 0, priority: 'medium', due_date: '' }); }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Case</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Case</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select value={form.client_id} onValueChange={(v) => setForm({ ...form, client_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Collector</Label>
                    <Select value={form.collector_id} onValueChange={(v) => setForm({ ...form, collector_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Select collector" /></SelectTrigger>
                      <SelectContent>
                        {collectors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Original Amount</Label>
                    <Input type="number" value={form.original_amount} onChange={(e) => setForm({ ...form, original_amount: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Amount</Label>
                    <Input type="number" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
                  </div>
                </div>
                <Button onClick={handleSave} className="w-full" disabled={addCase.isPending || updateCase.isPending}>
                  {editing ? 'Update' : 'Add'} Case
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageCases = cases.filter(c => c.stage === stage.value);
              const stageTotal = stageCases.reduce((sum, c) => sum + (c.current_amount || 0), 0);
              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span className="font-semibold">{stage.name}</span>
                      <Badge variant="secondary">{stageCases.length}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">${stageTotal.toLocaleString()}</span>
                  </div>
                  <Droppable droppableId={stage.value}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[200px] p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : 'bg-muted/30'}`}
                      >
                        {stageCases.map((c, index) => (
                          <Draggable key={c.id} draggableId={c.id} index={index}>
                            {(provided) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 bg-card cursor-grab active:cursor-grabbing"
                              >
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-medium text-sm">{c.title}</h4>
                                  <div className="flex gap-1">
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEdit(c)}><Edit className="h-3 w-3" /></Button>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteCase.mutate(c.id)}><Trash2 className="h-3 w-3" /></Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-semibold">${c.current_amount.toLocaleString()}</span>
                                </div>
                                {c.clients && <p className="text-xs text-muted-foreground mb-1">{c.clients.client_name}</p>}
                                <div className="flex items-center justify-between">
                                  <Badge variant={getPriorityColor(c.priority) as any}>{c.priority}</Badge>
                                  {c.debit_collectors && <span className="text-xs text-muted-foreground">{c.debit_collectors.name}</span>}
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </CRMLayout>
  );
}
