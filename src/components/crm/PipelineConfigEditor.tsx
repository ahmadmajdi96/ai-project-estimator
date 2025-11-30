import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePipelineStages, useAddPipelineStage, useUpdatePipelineStage, useDeletePipelineStage, PipelineStage } from '@/hooks/usePipelineStages';
import { useStatusConfigs, useAddStatusConfig, useUpdateStatusConfig, useDeleteStatusConfig, StatusConfig } from '@/hooks/useStatusConfigs';
import { Plus, Edit, Trash2, GitBranch, Users, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function PipelineConfigEditor() {
  const { data: stages = [], isLoading: stagesLoading } = usePipelineStages();
  const { data: statuses = [], isLoading: statusesLoading } = useStatusConfigs();
  
  const addStage = useAddPipelineStage();
  const updateStage = useUpdatePipelineStage();
  const deleteStage = useDeletePipelineStage();
  
  const addStatus = useAddStatusConfig();
  const updateStatus = useUpdateStatusConfig();
  const deleteStatus = useDeleteStatusConfig();
  
  const [stageDialogOpen, setStageDialogOpen] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStage | null>(null);
  const [editingStatus, setEditingStatus] = useState<StatusConfig | null>(null);
  
  const [stageForm, setStageForm] = useState({ name: '', value: '', color: '#3b82f6' });
  const [statusForm, setStatusForm] = useState({ name: '', value: '', color: '#3b82f6' });

  const handleSaveStage = async () => {
    if (!stageForm.name || !stageForm.value) return;
    
    if (editingStage) {
      await updateStage.mutateAsync({ id: editingStage.id, ...stageForm });
    } else {
      await addStage.mutateAsync({ ...stageForm, sort_order: stages.length });
    }
    
    setStageDialogOpen(false);
    setEditingStage(null);
    setStageForm({ name: '', value: '', color: '#3b82f6' });
  };

  const handleSaveStatus = async () => {
    if (!statusForm.name || !statusForm.value) return;
    
    if (editingStatus) {
      await updateStatus.mutateAsync({ id: editingStatus.id, ...statusForm });
    } else {
      await addStatus.mutateAsync({ ...statusForm, sort_order: statuses.length });
    }
    
    setStatusDialogOpen(false);
    setEditingStatus(null);
    setStatusForm({ name: '', value: '', color: '#3b82f6' });
  };

  const handleEditStage = (stage: PipelineStage) => {
    setEditingStage(stage);
    setStageForm({ name: stage.name, value: stage.value, color: stage.color });
    setStageDialogOpen(true);
  };

  const handleEditStatus = (status: StatusConfig) => {
    setEditingStatus(status);
    setStatusForm({ name: status.name, value: status.value, color: status.color });
    setStatusDialogOpen(true);
  };

  if (stagesLoading || statusesLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-5 bg-card/50 border-border/50">
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pipeline" className="gap-2">
            <GitBranch className="h-4 w-4" />
            Pipeline Stages
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-2">
            <Users className="h-4 w-4" />
            Client Statuses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Sales Pipeline Stages</h3>
            <Dialog open={stageDialogOpen} onOpenChange={(open) => {
              setStageDialogOpen(open);
              if (!open) {
                setEditingStage(null);
                setStageForm({ name: '', value: '', color: '#3b82f6' });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Stage
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingStage ? 'Edit Stage' : 'Add Pipeline Stage'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={stageForm.name}
                      onChange={(e) => setStageForm({ ...stageForm, name: e.target.value })}
                      placeholder="e.g., Qualification"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value (unique key)</Label>
                    <Input
                      value={stageForm.value}
                      onChange={(e) => setStageForm({ ...stageForm, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="e.g., qualification"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={stageForm.color}
                        onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={stageForm.color}
                        onChange={(e) => setStageForm({ ...stageForm, color: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveStage} className="w-full" disabled={addStage.isPending || updateStage.isPending}>
                    {editingStage ? 'Update' : 'Add'} Stage
                  </Button>
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
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStage(stage)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => deleteStage.mutate(stage.id)}
                    disabled={deleteStage.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="status" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Client Statuses</h3>
            <Dialog open={statusDialogOpen} onOpenChange={(open) => {
              setStatusDialogOpen(open);
              if (!open) {
                setEditingStatus(null);
                setStatusForm({ name: '', value: '', color: '#3b82f6' });
              }
            }}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1">
                  <Plus className="h-4 w-4" /> Add Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingStatus ? 'Edit Status' : 'Add Client Status'}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={statusForm.name}
                      onChange={(e) => setStatusForm({ ...statusForm, name: e.target.value })}
                      placeholder="e.g., VIP"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Value (unique key)</Label>
                    <Input
                      value={statusForm.value}
                      onChange={(e) => setStatusForm({ ...statusForm, value: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                      placeholder="e.g., vip"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={statusForm.color}
                        onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={statusForm.color}
                        onChange={(e) => setStatusForm({ ...statusForm, color: e.target.value })}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveStatus} className="w-full" disabled={addStatus.isPending || updateStatus.isPending}>
                    {editingStatus ? 'Update' : 'Add'} Status
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="space-y-2">
            {statuses.map((status, index) => (
              <div key={status.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: status.color }} />
                  <span className="font-medium">{status.name}</span>
                  <Badge variant="outline" className="text-xs">{status.value}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditStatus(status)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-destructive" 
                    onClick={() => deleteStatus.mutate(status.id)}
                    disabled={deleteStatus.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}