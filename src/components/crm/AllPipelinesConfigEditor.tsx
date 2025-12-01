import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Edit, Trash2, GitBranch, Target, CheckSquare, Ticket, Users, Loader2, Wallet } from 'lucide-react';

import { usePipelineStages, useAddPipelineStage, useUpdatePipelineStage, useDeletePipelineStage } from '@/hooks/usePipelineStages';
import { useStatusConfigs, useAddStatusConfig, useUpdateStatusConfig, useDeleteStatusConfig } from '@/hooks/useStatusConfigs';
import { useOpportunityStages, useAddOpportunityStage, useUpdateOpportunityStage, useDeleteOpportunityStage } from '@/hooks/useOpportunityStages';
import { useTaskStages, useAddTaskStage, useUpdateTaskStage, useDeleteTaskStage } from '@/hooks/useTaskStages';
import { useSupportStages, useAddSupportStage, useUpdateSupportStage, useDeleteSupportStage } from '@/hooks/useSupportStages';
import { useDebitPipelineStages, useAddDebitPipelineStage, useUpdateDebitPipelineStage, useDeleteDebitPipelineStage } from '@/hooks/useDebitPipelineStages';

interface StageItem {
  id: string;
  name: string;
  value: string;
  color: string;
  sort_order: number;
}

interface StageEditorProps {
  title: string;
  stages: StageItem[];
  isLoading: boolean;
  onAdd: (stage: { name: string; value: string; color: string; sort_order: number }) => Promise<any>;
  onUpdate: (stage: { id: string; name: string; value: string; color: string }) => Promise<any>;
  onDelete: (id: string) => void;
  isPending: boolean;
}

function StageEditor({ title, stages, isLoading, onAdd, onUpdate, onDelete, isPending }: StageEditorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<StageItem | null>(null);
  const [form, setForm] = useState({ name: '', value: '', color: '#3b82f6' });

  const handleSave = async () => {
    if (!form.name || !form.value) return;
    if (editing) {
      await onUpdate({ id: editing.id, ...form });
    } else {
      await onAdd({ ...form, sort_order: stages.length });
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ name: '', value: '', color: '#3b82f6' });
  };

  const handleEdit = (stage: StageItem) => {
    setEditing(stage);
    setForm({ name: stage.name, value: stage.value, color: stage.color });
    setDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setEditing(null); setForm({ name: '', value: '', color: '#3b82f6' }); }
        }}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Stage</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? 'Edit Stage' : 'Add Stage'}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., In Progress" />
              </div>
              <div className="space-y-2">
                <Label>Value (unique key)</Label>
                <Input value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })} placeholder="e.g., in_progress" />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex gap-2">
                  <Input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-16 h-10 p-1" />
                  <Input value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} placeholder="#3b82f6" />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full" disabled={isPending}>{editing ? 'Update' : 'Add'} Stage</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {stages.map((stage, index) => (
          <div key={stage.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: stage.color }} />
              <span className="font-medium">{stage.name}</span>
              <Badge variant="outline" className="text-xs">{stage.value}</Badge>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(stage)}><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => onDelete(stage.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AllPipelinesConfigEditor() {
  // Sales Pipeline
  const { data: salesStages = [], isLoading: loadingSales } = usePipelineStages();
  const addSalesStage = useAddPipelineStage();
  const updateSalesStage = useUpdatePipelineStage();
  const deleteSalesStage = useDeletePipelineStage();

  // Client Status
  const { data: clientStatuses = [], isLoading: loadingStatuses } = useStatusConfigs();
  const addStatus = useAddStatusConfig();
  const updateStatus = useUpdateStatusConfig();
  const deleteStatus = useDeleteStatusConfig();

  // Opportunity Stages
  const { data: oppStages = [], isLoading: loadingOpp } = useOpportunityStages();
  const addOppStage = useAddOpportunityStage();
  const updateOppStage = useUpdateOpportunityStage();
  const deleteOppStage = useDeleteOpportunityStage();

  // Task Stages
  const { data: taskStages = [], isLoading: loadingTask } = useTaskStages();
  const addTaskStage = useAddTaskStage();
  const updateTaskStage = useUpdateTaskStage();
  const deleteTaskStage = useDeleteTaskStage();

  // Support Stages
  const { data: supportStages = [], isLoading: loadingSupport } = useSupportStages();
  const addSupportStage = useAddSupportStage();
  const updateSupportStage = useUpdateSupportStage();
  const deleteSupportStage = useDeleteSupportStage();

  // Debit Pipeline Stages
  const { data: debitStages = [], isLoading: loadingDebit } = useDebitPipelineStages();
  const addDebitStage = useAddDebitPipelineStage();
  const updateDebitStage = useUpdateDebitPipelineStage();
  const deleteDebitStage = useDeleteDebitPipelineStage();

  return (
    <Card className="p-5 bg-card/50 border-border/50">
      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="sales" className="gap-2"><GitBranch className="h-4 w-4" />Sales</TabsTrigger>
          <TabsTrigger value="status" className="gap-2"><Users className="h-4 w-4" />Status</TabsTrigger>
          <TabsTrigger value="opportunity" className="gap-2"><Target className="h-4 w-4" />Opportunity</TabsTrigger>
          <TabsTrigger value="task" className="gap-2"><CheckSquare className="h-4 w-4" />Task</TabsTrigger>
          <TabsTrigger value="support" className="gap-2"><Ticket className="h-4 w-4" />Support</TabsTrigger>
          <TabsTrigger value="debit" className="gap-2"><Wallet className="h-4 w-4" />Debit</TabsTrigger>
        </TabsList>

        <TabsContent value="sales">
          <StageEditor
            title="Sales Pipeline Stages"
            stages={salesStages}
            isLoading={loadingSales}
            onAdd={addSalesStage.mutateAsync}
            onUpdate={updateSalesStage.mutateAsync}
            onDelete={(id) => deleteSalesStage.mutate(id)}
            isPending={addSalesStage.isPending || updateSalesStage.isPending}
          />
        </TabsContent>

        <TabsContent value="status">
          <StageEditor
            title="Client Statuses"
            stages={clientStatuses}
            isLoading={loadingStatuses}
            onAdd={addStatus.mutateAsync}
            onUpdate={updateStatus.mutateAsync}
            onDelete={(id) => deleteStatus.mutate(id)}
            isPending={addStatus.isPending || updateStatus.isPending}
          />
        </TabsContent>

        <TabsContent value="opportunity">
          <StageEditor
            title="Opportunity Pipeline Stages"
            stages={oppStages}
            isLoading={loadingOpp}
            onAdd={addOppStage.mutateAsync}
            onUpdate={updateOppStage.mutateAsync}
            onDelete={(id) => deleteOppStage.mutate(id)}
            isPending={addOppStage.isPending || updateOppStage.isPending}
          />
        </TabsContent>

        <TabsContent value="task">
          <StageEditor
            title="Task Stages"
            stages={taskStages}
            isLoading={loadingTask}
            onAdd={addTaskStage.mutateAsync}
            onUpdate={updateTaskStage.mutateAsync}
            onDelete={(id) => deleteTaskStage.mutate(id)}
            isPending={addTaskStage.isPending || updateTaskStage.isPending}
          />
        </TabsContent>

        <TabsContent value="support">
          <StageEditor
            title="Support Pipeline Stages"
            stages={supportStages}
            isLoading={loadingSupport}
            onAdd={addSupportStage.mutateAsync}
            onUpdate={updateSupportStage.mutateAsync}
            onDelete={(id) => deleteSupportStage.mutate(id)}
            isPending={addSupportStage.isPending || updateSupportStage.isPending}
          />
        </TabsContent>

        <TabsContent value="debit">
          <StageEditor
            title="Debit Pipeline Stages"
            stages={debitStages}
            isLoading={loadingDebit}
            onAdd={addDebitStage.mutateAsync}
            onUpdate={updateDebitStage.mutateAsync}
            onDelete={(id) => deleteDebitStage.mutate(id)}
            isPending={addDebitStage.isPending || updateDebitStage.isPending}
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
