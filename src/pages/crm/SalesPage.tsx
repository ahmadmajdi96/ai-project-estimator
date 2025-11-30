import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useQuotes, useAddQuote, useUpdateQuote, useDeleteQuote } from '@/hooks/useQuotes';
import { useClients } from '@/hooks/useClients';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Eye, Search, FileText, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';

interface QuoteForm {
  title: string;
  client_id: string;
  status: QuoteStatus;
  subtotal: number;
  discount_percent: number;
  total: number;
  notes: string;
  valid_until: string;
}

const initialForm: QuoteForm = {
  title: '',
  client_id: '',
  status: 'draft',
  subtotal: 0,
  discount_percent: 0,
  total: 0,
  notes: '',
  valid_until: '',
};

export default function SalesPage() {
  const { data: quotes = [], isLoading } = useQuotes();
  const { data: clients = [] } = useClients();
  const addQuote = useAddQuote();
  const updateQuote = useUpdateQuote();
  const deleteQuote = useDeleteQuote();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<any>(null);
  const [viewingQuote, setViewingQuote] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuoteForm>(initialForm);

  const filteredQuotes = quotes.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenNew = () => {
    setEditingQuote(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleEdit = (quote: any) => {
    setEditingQuote(quote);
    setForm({
      title: quote.title,
      client_id: quote.client_id || '',
      status: quote.status,
      subtotal: quote.subtotal,
      discount_percent: quote.discount_percent || 0,
      total: quote.total,
      notes: quote.notes || '',
      valid_until: quote.valid_until || '',
    });
    setIsDialogOpen(true);
  };

  const handleView = (quote: any) => {
    setViewingQuote(quote);
    setIsViewOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await deleteQuote.mutateAsync(deletingId);
      setIsDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const calculateTotal = (subtotal: number, discountPercent: number) => {
    return subtotal - (subtotal * discountPercent / 100);
  };

  const handleSubtotalChange = (value: number) => {
    const newTotal = calculateTotal(value, form.discount_percent);
    setForm({ ...form, subtotal: value, total: newTotal });
  };

  const handleDiscountChange = (value: number) => {
    const newTotal = calculateTotal(form.subtotal, value);
    setForm({ ...form, discount_percent: value, total: newTotal });
  };

  const handleSubmit = async () => {
    if (!form.title) {
      toast.error('Please enter a title');
      return;
    }

    const data = {
      title: form.title,
      client_id: form.client_id || null,
      status: form.status,
      subtotal: form.subtotal,
      discount_percent: form.discount_percent,
      total: form.total,
      notes: form.notes || null,
      valid_until: form.valid_until || null,
    };

    if (editingQuote) {
      await updateQuote.mutateAsync({ id: editingQuote.id, ...data });
    } else {
      await addQuote.mutateAsync(data);
    }
    setIsDialogOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-muted text-muted-foreground',
      sent: 'bg-blue-500/10 text-blue-500',
      accepted: 'bg-green-500/10 text-green-500',
      rejected: 'bg-red-500/10 text-red-500',
    };
    return <Badge variant="secondary" className={styles[status] || ''}>{status}</Badge>;
  };

  const getClientName = (clientId: string | null) => {
    if (!clientId) return 'N/A';
    const client = clients.find(c => c.id === clientId);
    return client?.client_name || 'Unknown';
  };

  // Stats
  const totalValue = quotes.reduce((sum, q) => sum + q.total, 0);
  const acceptedValue = quotes.filter(q => q.status === 'accepted').reduce((sum, q) => sum + q.total, 0);

  return (
    <CRMLayout title="Sales">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quotes.length}</p>
                <p className="text-xs text-muted-foreground">Total Quotes</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <DollarSign className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(totalValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Total Value</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{quotes.filter(q => q.status === 'accepted').length}</p>
                <p className="text-xs text-muted-foreground">Accepted</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">${(acceptedValue / 1000).toFixed(0)}k</p>
                <p className="text-xs text-muted-foreground">Accepted Value</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters & Actions */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search quotes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleOpenNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Quote
            </Button>
          </div>
        </Card>

        {/* Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell className="font-medium">{quote.title}</TableCell>
                  <TableCell>{getClientName(quote.client_id)}</TableCell>
                  <TableCell>{getStatusBadge(quote.status)}</TableCell>
                  <TableCell className="text-right">${quote.subtotal.toLocaleString()}</TableCell>
                  <TableCell className="text-right">{quote.discount_percent || 0}%</TableCell>
                  <TableCell className="text-right font-semibold">${quote.total.toLocaleString()}</TableCell>
                  <TableCell>
                    {quote.valid_until ? format(new Date(quote.valid_until), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>{format(new Date(quote.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => handleView(quote)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(quote)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(quote.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredQuotes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    {isLoading ? 'Loading...' : 'No quotes found'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingQuote ? 'Edit Quote' : 'New Quote'}</DialogTitle>
            <DialogDescription>
              {editingQuote ? 'Update the quote details below' : 'Create a new quote for a client'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Quote title"
              />
            </div>
            <div>
              <Label>Client</Label>
              <Select value={form.client_id || 'none'} onValueChange={(v) => setForm({ ...form, client_id: v === 'none' ? '' : v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Client</SelectItem>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.client_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v: QuoteStatus) => setForm({ ...form, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Subtotal ($)</Label>
                <Input
                  type="number"
                  value={form.subtotal}
                  onChange={(e) => handleSubtotalChange(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Discount (%)</Label>
                <Input
                  type="number"
                  value={form.discount_percent}
                  onChange={(e) => handleDiscountChange(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
            <div>
              <Label>Total</Label>
              <Input value={`$${form.total.toLocaleString()}`} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={addQuote.isPending || updateQuote.isPending}>
              {editingQuote ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Quote Details</DialogTitle>
          </DialogHeader>
          {viewingQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium">{viewingQuote.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium">{getClientName(viewingQuote.client_id)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(viewingQuote.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="font-medium">{format(new Date(viewingQuote.created_at), 'MMM d, yyyy')}</p>
                </div>
              </div>
              <div className="border-t pt-4">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${viewingQuote.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Discount</span>
                  <span>{viewingQuote.discount_percent || 0}%</span>
                </div>
                <div className="flex justify-between py-2 border-t font-semibold">
                  <span>Total</span>
                  <span>${viewingQuote.total.toLocaleString()}</span>
                </div>
              </div>
              {viewingQuote.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="text-sm mt-1">{viewingQuote.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this quote? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </CRMLayout>
  );
}
