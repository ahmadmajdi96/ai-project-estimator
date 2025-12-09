import { useState } from 'react';
import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Send, DollarSign, MoreHorizontal, Eye, Download, Receipt, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  invoice_date: string;
  due_date: string;
  total_amount: number;
  balance_due: number;
  status: string;
}

const sampleInvoices: Invoice[] = [
  { id: '1', invoice_number: 'INV-2024-001', customer_name: 'Acme Corporation', invoice_date: '2024-01-01', due_date: '2024-01-31', total_amount: 15000, balance_due: 15000, status: 'sent' },
  { id: '2', invoice_number: 'INV-2024-002', customer_name: 'TechStart Inc', invoice_date: '2024-01-05', due_date: '2024-01-20', total_amount: 8500, balance_due: 0, status: 'paid' },
  { id: '3', invoice_number: 'INV-2024-003', customer_name: 'Global Enterprises', invoice_date: '2024-01-08', due_date: '2024-02-22', total_amount: 42000, balance_due: 21000, status: 'partial' },
  { id: '4', invoice_number: 'INV-2024-004', customer_name: 'Sunrise Media', invoice_date: '2024-01-10', due_date: '2024-02-09', total_amount: 5200, balance_due: 5200, status: 'overdue' },
  { id: '5', invoice_number: 'INV-2024-005', customer_name: 'Metro Solutions', invoice_date: '2024-01-12', due_date: '2024-02-11', total_amount: 12800, balance_due: 12800, status: 'draft' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-muted text-muted-foreground' },
  sent: { label: 'Sent', color: 'bg-blue-500/10 text-blue-500' },
  partial: { label: 'Partial', color: 'bg-amber-500/10 text-amber-500' },
  paid: { label: 'Paid', color: 'bg-emerald-500/10 text-emerald-500' },
  overdue: { label: 'Overdue', color: 'bg-red-500/10 text-red-500' },
  void: { label: 'Void', color: 'bg-muted text-muted-foreground' },
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredInvoices = sampleInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = sampleInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalOutstanding = sampleInvoices.reduce((sum, inv) => sum + inv.balance_due, 0);
  const totalOverdue = sampleInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.balance_due, 0);

  return (
    <AccountingLayout title="Invoices">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleInvoices.length}</p>
                <p className="text-xs text-muted-foreground">Total Invoices</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
                <p className="text-xs text-muted-foreground">Total Invoiced</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalOutstanding)}</p>
                <p className="text-xs text-muted-foreground">Outstanding</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalOverdue)}</p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>{config.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Invoice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-muted/30">
                    <TableCell className="font-mono font-medium text-primary">{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer_name}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(invoice.invoice_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-muted-foreground">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell className="text-right">
                      <span className={invoice.balance_due > 0 ? 'text-amber-500' : 'text-emerald-500'}>
                        {formatCurrency(invoice.balance_due)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={statusConfig[invoice.status]?.color}>
                        {statusConfig[invoice.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
