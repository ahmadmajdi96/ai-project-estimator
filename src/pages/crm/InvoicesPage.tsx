import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useInvoices, useAddInvoice, useUpdateInvoice, useAddPayment } from '@/hooks/useInvoices';
import { useClients } from '@/hooks/useClients';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, FileText, DollarSign, Clock, CheckCircle2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-slate-500' },
  { value: 'sent', label: 'Sent', color: 'bg-blue-500' },
  { value: 'paid', label: 'Paid', color: 'bg-emerald-500' },
  { value: 'overdue', label: 'Overdue', color: 'bg-red-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-slate-400' },
];

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();
  const addInvoice = useAddInvoice();
  const updateInvoice = useUpdateInvoice();
  const addPayment = useAddPayment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    client_id: '',
    amount: 0,
    tax_amount: 0,
    due_date: '',
    notes: '',
  });
  const [paymentAmount, setPaymentAmount] = useState(0);

  const filteredInvoices = statusFilter === 'all' 
    ? invoices 
    : invoices.filter(i => i.status === statusFilter);

  const totalOutstanding = invoices.filter(i => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total_amount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid')
    .reduce((sum, i) => sum + i.total_amount, 0);
  const overdueCount = invoices.filter(i => i.status === 'overdue').length;

  const handleSubmit = async () => {
    const total = formData.amount + formData.tax_amount;
    await addInvoice.mutateAsync({
      ...formData,
      total_amount: total,
    } as any);
    setDialogOpen(false);
    setFormData({ client_id: '', amount: 0, tax_amount: 0, due_date: '', notes: '' });
  };

  const handlePayment = async (invoiceId: string) => {
    const invoice = invoices.find(i => i.id === invoiceId);
    if (!invoice) return;
    await addPayment.mutateAsync({
      invoice_id: invoiceId,
      client_id: invoice.client_id,
      amount: paymentAmount,
      payment_date: new Date().toISOString().split('T')[0],
    });
    await updateInvoice.mutateAsync({
      id: invoiceId,
      status: 'paid',
      paid_date: new Date().toISOString().split('T')[0],
    });
    setPaymentDialog(null);
    setPaymentAmount(0);
  };

  return (
    <CRMLayout title="Invoices & Payments">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Total Invoices</span>
            </div>
            <p className="text-2xl font-bold">{invoices.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Outstanding</span>
            </div>
            <p className="text-2xl font-bold text-amber-500">${totalOutstanding.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm">Paid</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">${totalPaid.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Overdue</span>
            </div>
            <p className="text-2xl font-bold text-red-500">{overdueCount}</p>
          </Card>
        </div>

        {/* Filters & Actions */}
        <div className="flex justify-between items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> New Invoice
          </Button>
        </div>

        {/* Invoices Table */}
        <Card className="bg-card/50 border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map(invoice => {
                const status = STATUSES.find(s => s.value === invoice.status);
                return (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.clients?.client_name || '-'}</TableCell>
                    <TableCell className="text-right">${invoice.amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${invoice.tax_amount?.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-bold">${invoice.total_amount?.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={status?.color}>{status?.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {invoice.due_date ? format(new Date(invoice.due_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                        <Button size="sm" variant="outline" onClick={() => {
                          setPaymentDialog(invoice.id);
                          setPaymentAmount(invoice.total_amount);
                        }}>
                          <CreditCard className="h-3 w-3 mr-1" /> Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Invoice Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Client</Label>
              <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.client_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Amount ($)</Label>
                <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Tax ($)</Label>
                <Input type="number" value={formData.tax_amount} onChange={(e) => setFormData({...formData, tax_amount: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-foreground">${(formData.amount + formData.tax_amount).toLocaleString()}</span></p>
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={addInvoice.isPending}>
              Create Invoice
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Payment Amount ($)</Label>
              <Input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(Number(e.target.value))} />
            </div>
            <Button onClick={() => paymentDialog && handlePayment(paymentDialog)} className="w-full" disabled={addPayment.isPending}>
              Record Payment
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
