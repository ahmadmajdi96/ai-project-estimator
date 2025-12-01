import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDebitCollectors, useAddDebitCollector, useUpdateDebitCollector, useDeleteDebitCollector, DebitCollector } from '@/hooks/useDebitCollectors';
import { useDebitCases } from '@/hooks/useDebitCases';
import { Plus, Edit, Trash2, Loader2, Phone, Mail } from 'lucide-react';

export default function DebitCollectorsPage() {
  const { data: collectors = [], isLoading } = useDebitCollectors();
  const { data: cases = [] } = useDebitCases();
  const addCollector = useAddDebitCollector();
  const updateCollector = useUpdateDebitCollector();
  const deleteCollector = useDeleteDebitCollector();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DebitCollector | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    target_amount: 0,
    commission_rate: 0,
    status: 'active',
  });

  const handleSave = async () => {
    if (!form.name) return;
    if (editing) {
      await updateCollector.mutateAsync({ id: editing.id, ...form });
    } else {
      await addCollector.mutateAsync(form as any);
    }
    setDialogOpen(false);
    setEditing(null);
    setForm({ name: '', email: '', phone: '', target_amount: 0, commission_rate: 0, status: 'active' });
  };

  const handleEdit = (collector: DebitCollector) => {
    setEditing(collector);
    setForm({
      name: collector.name,
      email: collector.email || '',
      phone: collector.phone || '',
      target_amount: collector.target_amount,
      commission_rate: collector.commission_rate,
      status: collector.status,
    });
    setDialogOpen(true);
  };

  const getCollectorStats = (collectorId: string) => {
    const collectorCases = cases.filter(c => c.collector_id === collectorId);
    const totalAssigned = collectorCases.reduce((sum, c) => sum + (c.current_amount || 0), 0);
    const totalCollected = collectorCases.reduce((sum, c) => sum + (c.collected_amount || 0), 0);
    return { caseCount: collectorCases.length, totalAssigned, totalCollected };
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
            <h1 className="text-3xl font-display font-bold">Debit Collectors</h1>
            <p className="text-muted-foreground">Manage your debt collection team</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) { setEditing(null); setForm({ name: '', email: '', phone: '', target_amount: 0, commission_rate: 0, status: 'active' }); }
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="h-4 w-4" /> Add Collector</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editing ? 'Edit' : 'Add'} Collector</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Target Amount</Label>
                    <Input type="number" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Commission Rate (%)</Label>
                    <Input type="number" value={form.commission_rate} onChange={(e) => setForm({ ...form, commission_rate: Number(e.target.value) })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSave} className="w-full" disabled={addCollector.isPending || updateCollector.isPending}>
                  {editing ? 'Update' : 'Add'} Collector
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="bg-card/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collector</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Cases</TableHead>
                <TableHead>Assigned</TableHead>
                <TableHead>Collected</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectors.map((collector) => {
                const stats = getCollectorStats(collector.id);
                return (
                  <TableRow key={collector.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-medium text-primary">{collector.name.charAt(0)}</span>
                        </div>
                        <span className="font-medium">{collector.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1 text-sm">
                        {collector.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{collector.email}</span>}
                        {collector.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{collector.phone}</span>}
                      </div>
                    </TableCell>
                    <TableCell>{stats.caseCount}</TableCell>
                    <TableCell>${stats.totalAssigned.toLocaleString()}</TableCell>
                    <TableCell className="text-primary font-medium">${stats.totalCollected.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={collector.status === 'active' ? 'default' : 'secondary'}>
                        {collector.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(collector)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteCollector.mutate(collector.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>
    </CRMLayout>
  );
}
