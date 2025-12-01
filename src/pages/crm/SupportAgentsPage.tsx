import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useSupportAgents, useAddSupportAgent, useUpdateSupportAgent, useDeleteSupportAgent } from '@/hooks/useSupportAgents';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Plus, Users, Ticket, Clock, Star, TrendingUp, Loader2, Edit, Trash2 } from 'lucide-react';

const SPECIALIZATIONS = ['Technical', 'Billing', 'General', 'Enterprise', 'Onboarding'];

export default function SupportAgentsPage() {
  const { data: agents = [], isLoading } = useSupportAgents();
  const { data: tickets = [] } = useSupportTickets();
  const addAgent = useAddSupportAgent();
  const updateAgent = useUpdateSupportAgent();
  const deleteAgent = useDeleteSupportAgent();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialization: '', max_tickets: 10 });

  const activeAgents = agents.filter(a => a.status === 'active');
  const totalResolved = agents.reduce((sum, a) => sum + (a.total_resolved || 0), 0);
  const avgScore = agents.length > 0 ? agents.reduce((sum, a) => sum + (a.performance_score || 0), 0) / agents.length : 0;

  const handleSubmit = async () => {
    if (editingAgent) {
      await updateAgent.mutateAsync({ id: editingAgent.id, ...formData });
    } else {
      await addAgent.mutateAsync(formData);
    }
    setDialogOpen(false);
    setEditingAgent(null);
    setFormData({ name: '', email: '', phone: '', specialization: '', max_tickets: 10 });
  };

  const openEdit = (agent: any) => {
    setEditingAgent(agent);
    setFormData({ name: agent.name, email: agent.email || '', phone: agent.phone || '', specialization: agent.specialization || '', max_tickets: agent.max_tickets });
    setDialogOpen(true);
  };

  const getAgentTickets = (agentId: string) => tickets.filter(t => t.support_agent_id === agentId);

  if (isLoading) {
    return <CRMLayout title="Support Agents"><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div></CRMLayout>;
  }

  return (
    <CRMLayout title="Support Agents">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="h-4 w-4" /><span className="text-sm">Total Agents</span></div>
            <p className="text-2xl font-bold">{agents.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><TrendingUp className="h-4 w-4" /><span className="text-sm">Active</span></div>
            <p className="text-2xl font-bold text-emerald-500">{activeAgents.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Ticket className="h-4 w-4" /><span className="text-sm">Total Resolved</span></div>
            <p className="text-2xl font-bold">{totalResolved}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Star className="h-4 w-4" /><span className="text-sm">Avg Performance</span></div>
            <p className="text-2xl font-bold">{avgScore.toFixed(1)}%</p>
          </Card>
        </div>

        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Agent Management</h2>
          <Button onClick={() => { setEditingAgent(null); setFormData({ name: '', email: '', phone: '', specialization: '', max_tickets: 10 }); setDialogOpen(true); }}>
            <Plus className="h-4 w-4 mr-2" /> Add Agent
          </Button>
        </div>

        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map(agent => {
            const agentTickets = getAgentTickets(agent.id);
            const workload = agent.max_tickets > 0 ? (agent.current_tickets / agent.max_tickets) * 100 : 0;
            return (
              <Card key={agent.id} className="p-4 bg-card/50 border-border/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary">{agent.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{agent.name}</h3>
                      <p className="text-sm text-muted-foreground">{agent.email}</p>
                    </div>
                  </div>
                  <Badge variant={agent.status === 'active' ? 'default' : 'secondary'}>{agent.status}</Badge>
                </div>

                {agent.specialization && <Badge variant="outline" className="mb-3">{agent.specialization}</Badge>}

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Workload</span>
                    <span>{agent.current_tickets}/{agent.max_tickets} tickets</span>
                  </div>
                  <Progress value={workload} className="h-2" />

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/50">
                    <div className="text-center">
                      <p className="text-lg font-bold">{agent.total_resolved}</p>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{agent.avg_resolution_time?.toFixed(1) || 0}h</p>
                      <p className="text-xs text-muted-foreground">Avg Time</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{agent.performance_score?.toFixed(0) || 0}%</p>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(agent)}>
                    <Edit className="h-3 w-3 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => deleteAgent.mutate(agent.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add Support Agent'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Name *</Label><Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} /></div>
              <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Specialization</Label>
                <Select value={formData.specialization} onValueChange={(v) => setFormData({ ...formData, specialization: v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{SPECIALIZATIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Max Tickets</Label><Input type="number" value={formData.max_tickets} onChange={(e) => setFormData({ ...formData, max_tickets: Number(e.target.value) })} /></div>
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={addAgent.isPending || updateAgent.isPending}>
              {editingAgent ? 'Update' : 'Add'} Agent
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
