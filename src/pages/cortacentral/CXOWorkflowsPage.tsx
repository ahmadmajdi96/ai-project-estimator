import { CortaCentralLayout } from '@/components/cortacentral/CortaCentralLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCXOWorkflows, useCXOTenants, useAddCXOWorkflow } from '@/hooks/useCortaCentral';
import { Workflow, Plus, Play, Pause, Settings, Phone, Mail, MessageCircle, Globe } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const triggerTypes = [
  { value: 'inbound_voice', label: 'Inbound Voice', icon: Phone, description: 'Triggered when voice call received' },
  { value: 'inbound_sms', label: 'Inbound SMS', icon: MessageCircle, description: 'Triggered when SMS received' },
  { value: 'inbound_email', label: 'Inbound Email', icon: Mail, description: 'Triggered when email received' },
  { value: 'inbound_webchat', label: 'Inbound Webchat', icon: Globe, description: 'Triggered when chat initiated' },
  { value: 'outbound_event', label: 'Outbound Event', icon: Workflow, description: 'Triggered by system event' },
  { value: 'scheduled', label: 'Scheduled', icon: Settings, description: 'Runs on a schedule' },
];

export default function CXOWorkflowsPage() {
  const { data: workflows, isLoading } = useCXOWorkflows();
  const { data: tenants } = useCXOTenants();
  const addWorkflow = useAddCXOWorkflow();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    trigger_type: '',
  });

  const handleSubmit = async () => {
    if (!form.name || !form.trigger_type) return;
    
    const tenantId = tenants?.[0]?.id;
    if (!tenantId) return;

    await addWorkflow.mutateAsync({
      name: form.name,
      description: form.description,
      trigger_type: form.trigger_type as any,
      tenant_id: tenantId,
      is_active: false,
    });
    
    setForm({ name: '', description: '', trigger_type: '' });
    setIsDialogOpen(false);
  };

  const getTriggerInfo = (type: string) => {
    return triggerTypes.find(t => t.value === type);
  };

  return (
    <CortaCentralLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Workflow Designer</h1>
            <p className="text-muted-foreground">Create routing and automation flows</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Workflow Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., VIP Customer Routing"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this workflow does"
                  />
                </div>
                <div>
                  <Label>Trigger Type</Label>
                  <Select value={form.trigger_type} onValueChange={(v) => setForm(prev => ({ ...prev, trigger_type: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      {triggerTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!form.name || !form.trigger_type}>
                    Create Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{workflows?.length || 0}</div>
              <p className="text-sm text-muted-foreground">Total Workflows</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-500">
                {workflows?.filter(w => w.is_active).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-muted-foreground">
                {workflows?.filter(w => !w.is_active).length || 0}
              </div>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Workflow className="h-5 w-5" />
              Workflows
            </CardTitle>
            <CardDescription>
              Visual flows for routing and automation (independent of provider-specific constraints)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !workflows?.length ? (
              <div className="text-center py-12">
                <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No workflows created</p>
                <p className="text-sm text-muted-foreground">Create a workflow to automate routing</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {workflows.map((workflow) => {
                  const triggerInfo = getTriggerInfo(workflow.trigger_type);
                  const TriggerIcon = triggerInfo?.icon || Workflow;
                  return (
                    <div key={workflow.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${workflow.is_active ? 'bg-green-500/10' : 'bg-muted'}`}>
                            <TriggerIcon className={`h-5 w-5 ${workflow.is_active ? 'text-green-500' : 'text-muted-foreground'}`} />
                          </div>
                          <div>
                            <h4 className="font-medium">{workflow.name}</h4>
                            <p className="text-sm text-muted-foreground">{workflow.description || 'No description'}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="capitalize">
                                {triggerInfo?.label || workflow.trigger_type}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Created {format(new Date(workflow.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={workflow.is_active ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}>
                            {workflow.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="icon">
                            {workflow.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workflow Node Types</CardTitle>
            <CardDescription>Available actions for building workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Entry Trigger', desc: 'Starting point for the workflow' },
                { name: 'Condition', desc: 'Branch based on attributes' },
                { name: 'Route to Queue', desc: 'Send to internal queue' },
                { name: 'Route to Provider', desc: 'Send to provider queue' },
                { name: 'Send SMS', desc: 'Send text message via provider' },
                { name: 'Send Email', desc: 'Send email via provider' },
                { name: 'Call Webhook', desc: 'Trigger external API' },
                { name: 'Set Attribute', desc: 'Set conversation metadata' },
                { name: 'End', desc: 'Terminate workflow execution' },
              ].map((node) => (
                <div key={node.name} className="p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">{node.name}</h4>
                  <p className="text-xs text-muted-foreground">{node.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CortaCentralLayout>
  );
}
