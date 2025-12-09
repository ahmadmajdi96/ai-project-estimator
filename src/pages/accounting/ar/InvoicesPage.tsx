import { useState } from 'react';
import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { useAccountingAuth } from '@/hooks/useAccountingAuth';
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
import { Plus, Search, Filter, FileText, Send, DollarSign, MoreHorizontal, Eye, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  { id: '1', invoice_number: 'INV-2024-001', customer_name: 'Acme Corporation', invoice_date: '2024-01-01', due_date: '2024-01-31', total_amount: 1500000, balance_due: 1500000, status: 'sent' },
  { id: '2', invoice_number: 'INV-2024-002', customer_name: 'TechStart Inc', invoice_date: '2024-01-05', due_date: '2024-01-20', total_amount: 850000, balance_due: 0, status: 'paid' },
  { id: '3', invoice_number: 'INV-2024-003', customer_name: 'Global Enterprises', invoice_date: '2024-01-08', due_date: '2024-02-22', total_amount: 4200000, balance_due: 2100000, status: 'partial' },
  { id: '4', invoice_number: 'INV-2024-004', customer_name: 'Sunrise Media', invoice_date: '2024-01-10', due_date: '2024-02-09', total_amount: 520000, balance_due: 520000, status: 'overdue' },
  { id: '5', invoice_number: 'INV-2024-005', customer_name: 'Metro Solutions', invoice_date: '2024-01-12', due_date: '2024-02-11', total_amount: 1280000, balance_due: 1280000, status: 'draft' },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-slate-500/20 text-slate-400' },
  sent: { label: 'Sent', color: 'bg-blue-500/20 text-blue-400' },
  partial: { label: 'Partial', color: 'bg-yellow-500/20 text-yellow-400' },
  paid: { label: 'Paid', color: 'bg-emerald-500/20 text-emerald-400' },
  overdue: { label: 'Overdue', color: 'bg-red-500/20 text-red-400' },
  void: { label: 'Void', color: 'bg-slate-500/20 text-slate-400' },
};

export default function InvoicesPage() {
  const { company } = useAccountingAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: company?.currency || 'USD',
    }).format(cents / 100);
  };

  const filteredInvoices = sampleInvoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalOutstanding = sampleInvoices.reduce((sum, inv) => sum + inv.balance_due, 0);
  const totalOverdue = sampleInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.balance_due, 0);

  return (
    <AccountingLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Invoices</h1>
            <p className="text-slate-400">Manage your customer invoices</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Total Invoices</p>
              <p className="text-xl font-bold text-white">{sampleInvoices.length}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Outstanding</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(totalOutstanding)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Overdue</p>
              <p className="text-xl font-bold text-red-400">{formatCurrency(totalOverdue)}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <p className="text-sm text-slate-400">Paid This Month</p>
              <p className="text-xl font-bold text-blue-400">{formatCurrency(850000)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600 text-white">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key} className="text-white">{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Invoice #</TableHead>
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Date</TableHead>
                  <TableHead className="text-slate-400">Due Date</TableHead>
                  <TableHead className="text-slate-400 text-right">Total</TableHead>
                  <TableHead className="text-slate-400 text-right">Balance</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell className="font-mono text-emerald-400">{invoice.invoice_number}</TableCell>
                    <TableCell className="text-white">{invoice.customer_name}</TableCell>
                    <TableCell className="text-slate-300">{format(new Date(invoice.invoice_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-slate-300">{format(new Date(invoice.due_date), 'MMM d, yyyy')}</TableCell>
                    <TableCell className="text-right text-white">{formatCurrency(invoice.total_amount)}</TableCell>
                    <TableCell className="text-right">
                      <span className={invoice.balance_due > 0 ? 'text-yellow-400' : 'text-emerald-400'}>
                        {formatCurrency(invoice.balance_due)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig[invoice.status]?.color}>
                        {statusConfig[invoice.status]?.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-slate-400">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                          <DropdownMenuItem className="text-slate-300">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300">
                            <Send className="mr-2 h-4 w-4" />
                            Send
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Record Payment
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300">
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
