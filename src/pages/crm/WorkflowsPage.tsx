import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  useWorkflowRules, 
  useWorkflowLogs, 
  useAddWorkflowRule, 
  useUpdateWorkflowRule, 
  useDeleteWorkflowRule,
  TRIGGER_TYPES,
  ACTION_TYPES,
  WorkflowRule
} from '@/hooks/useWorkflows';
import { 
  Workflow, 
  Plus, 
  Zap, 
  History, 
  Play, 
  Pause, 
  Trash2, 
  Edit, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  Clock,
  Settings2
} from 'lucide-react';
import { format } from 'date-fns';

const WorkflowsPage = () => {
  const { data: rules = [], isLoading: rulesLoading } = useWorkflowRules();
  const { data: logs = [], isLoading: logsLoading } = useWorkflowLogs();
  const addRule = useAddWorkflowRule();
  const updateRule = useUpdateWorkflowRule();
  const deleteRule = useDeleteWorkflowRule();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<WorkflowRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    trigger_type: '',
    action_type: '',
    is_active: true,
    trigger_config: {} as Record<string, any>,
    action_config: {} as Record<string, any>,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      trigger_type: '',
      action_type: '',
      is_active: true,
      trigger_config: {},
      action_config: {},
    });
    setEditingRule(null);
  };

  const handleOpenDialog = (rule?: WorkflowRule) => {
    if (rule) {
      setEditingRule(rule);
      setFormData({
        name: rule.name,
        description: rule.description || '',
        trigger_type: rule.trigger_type,
        action_type: rule.action_type,
        is_active: rule.is_active,
        trigger_config: rule.trigger_config,
        action_config: rule.action_config,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.trigger_type || !formData.action_type) return;

    if (editingRule) {
      await updateRule.mutateAsync({ id: editingRule.id, ...formData });
    } else {
      await addRule.mutateAsync({
        ...formData,
        created_by: null,
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleToggleActive = async (rule: WorkflowRule) => {
    await updateRule.mutateAsync({ id: rule.id, is_active: !rule.is_active });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this workflow rule?')) {
      await deleteRule.mutateAsync(id);
    }
  };

  const getTriggerLabel = (type: string) => TRIGGER_TYPES.find(t => t.value === type)?.label || type;
  const getActionLabel = (type: string) => ACTION_TYPES.find(a => a.value === type)?.label || type;

  return (
    <CRMLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
              <Workflow className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Workflow Automation</h1>
              <p className="text-muted-foreground">Automate tasks and streamline your sales process</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingRule ? 'Edit Workflow Rule' : 'Create New Workflow Rule'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Workflow Name</Label>
                    <Input
                      placeholder="e.g., Follow-up on new leads"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                      />
                      <Label>Active</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Describe what this workflow does..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      Trigger (When)
                    </Label>
                    <Select
                      value={formData.trigger_type}
                      onValueChange={(value) => setFormData({ ...formData, trigger_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select trigger..." />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIGGER_TYPES.map((trigger) => (
                          <SelectItem key={trigger.value} value={trigger.value}>
                            <div>
                              <div className="font-medium">{trigger.label}</div>
                              <div className="text-xs text-muted-foreground">{trigger.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-green-500" />
                      Action (Then)
                    </Label>
                    <Select
                      value={formData.action_type}
                      onValueChange={(value) => setFormData({ ...formData, action_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select action..." />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map((action) => (
                          <SelectItem key={action.value} value={action.value}>
                            <div>
                              <div className="font-medium">{action.label}</div>
                              <div className="text-xs text-muted-foreground">{action.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Trigger Configuration */}
                {formData.trigger_type === 'stage_change' && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Trigger Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs">From Stage</Label>
                          <Select
                            value={formData.trigger_config.from_stage || ''}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              trigger_config: { ...formData.trigger_config, from_stage: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any Stage</SelectItem>
                              <SelectItem value="pre_sales">Pre-Sales</SelectItem>
                              <SelectItem value="negotiation">Negotiation</SelectItem>
                              <SelectItem value="closing">Closing</SelectItem>
                              <SelectItem value="post_sales">Post-Sales</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs">To Stage</Label>
                          <Select
                            value={formData.trigger_config.to_stage || ''}
                            onValueChange={(value) => setFormData({
                              ...formData,
                              trigger_config: { ...formData.trigger_config, to_stage: value }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Any stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any Stage</SelectItem>
                              <SelectItem value="pre_sales">Pre-Sales</SelectItem>
                              <SelectItem value="negotiation">Negotiation</SelectItem>
                              <SelectItem value="closing">Closing</SelectItem>
                              <SelectItem value="post_sales">Post-Sales</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {formData.trigger_type === 'inactivity' && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Trigger Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label className="text-xs">Days of Inactivity</Label>
                        <Input
                          type="number"
                          placeholder="7"
                          value={formData.trigger_config.days || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            trigger_config: { ...formData.trigger_config, days: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Action Configuration */}
                {formData.action_type === 'create_task' && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Action Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Task Title</Label>
                        <Input
                          placeholder="Follow up with {client_name}"
                          value={formData.action_config.task_title || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            action_config: { ...formData.action_config, task_title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Due in (days)</Label>
                        <Input
                          type="number"
                          placeholder="3"
                          value={formData.action_config.due_days || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            action_config: { ...formData.action_config, due_days: parseInt(e.target.value) }
                          })}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {formData.action_type === 'send_reminder' && (
                  <Card className="bg-muted/50">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Action Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label className="text-xs">Reminder Title</Label>
                        <Input
                          placeholder="Check in with {client_name}"
                          value={formData.action_config.reminder_title || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            action_config: { ...formData.action_config, reminder_title: e.target.value }
                          })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Priority</Label>
                        <Select
                          value={formData.action_config.priority || 'medium'}
                          onValueChange={(value) => setFormData({
                            ...formData,
                            action_config: { ...formData.action_config, priority: value }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={!formData.name || !formData.trigger_type || !formData.action_type}>
                    {editingRule ? 'Update' : 'Create'} Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="rules" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Workflow Rules
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Execution History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            {rulesLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : rules.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Workflow className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Workflow Rules</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Create your first automation rule to streamline your sales process
                  </p>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Workflow
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {rules.map((rule) => (
                  <Card key={rule.id} className={`transition-all ${!rule.is_active ? 'opacity-60' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{rule.name}</h3>
                            <Badge variant={rule.is_active ? 'default' : 'secondary'}>
                              {rule.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          {rule.description && (
                            <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="gap-1">
                              <Zap className="h-3 w-3 text-amber-500" />
                              {getTriggerLabel(rule.trigger_type)}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className="gap-1">
                              <Play className="h-3 w-3 text-green-500" />
                              {getActionLabel(rule.action_type)}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(rule)}
                          >
                            {rule.is_active ? (
                              <Pause className="h-4 w-4 text-amber-500" />
                            ) : (
                              <Play className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(rule)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {logsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : logs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Execution History</h3>
                  <p className="text-muted-foreground text-center">
                    Workflow executions will appear here once they're triggered
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {logs.map((log) => (
                      <div key={log.id} className="flex items-center gap-4 p-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          log.status === 'success' ? 'bg-green-100 text-green-600' : 
                          log.status === 'failed' ? 'bg-red-100 text-red-600' : 
                          'bg-amber-100 text-amber-600'
                        }`}>
                          {log.status === 'success' ? <CheckCircle className="h-4 w-4" /> : 
                           log.status === 'failed' ? <XCircle className="h-4 w-4" /> : 
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{log.trigger_event}</p>
                          <p className="text-sm text-muted-foreground">{log.action_taken}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={log.status === 'success' ? 'default' : log.status === 'failed' ? 'destructive' : 'secondary'}>
                            {log.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(log.created_at), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
};

export default WorkflowsPage;
