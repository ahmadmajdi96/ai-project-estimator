import { useState } from 'react';
import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { useAccountingAuth } from '@/hooks/useAccountingAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Search, Filter, Mail, Phone, DollarSign, FileText, MoreHorizontal, Building2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Customer {
  id: string;
  customer_number: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  payment_terms: number;
  credit_limit: number;
  current_balance: number;
  is_active: boolean;
}

// Sample customers
const sampleCustomers: Customer[] = [
  { id: '1', customer_number: 'C-001', name: 'Acme Corporation', contact_name: 'John Smith', email: 'john@acme.com', phone: '+1 555-0101', payment_terms: 30, credit_limit: 50000000, current_balance: 15000000, is_active: true },
  { id: '2', customer_number: 'C-002', name: 'TechStart Inc', contact_name: 'Sarah Johnson', email: 'sarah@techstart.io', phone: '+1 555-0102', payment_terms: 15, credit_limit: 25000000, current_balance: 8500000, is_active: true },
  { id: '3', customer_number: 'C-003', name: 'Global Enterprises', contact_name: 'Michael Brown', email: 'michael@globalent.com', phone: '+1 555-0103', payment_terms: 45, credit_limit: 100000000, current_balance: 42000000, is_active: true },
  { id: '4', customer_number: 'C-004', name: 'Sunrise Media', contact_name: 'Emily Davis', email: 'emily@sunrisemedia.com', phone: '+1 555-0104', payment_terms: 30, credit_limit: 30000000, current_balance: 5200000, is_active: true },
  { id: '5', customer_number: 'C-005', name: 'Metro Solutions', contact_name: 'David Wilson', email: 'david@metrosol.com', phone: '+1 555-0105', payment_terms: 30, credit_limit: 40000000, current_balance: 0, is_active: false },
];

export default function CustomersPage() {
  const { company } = useAccountingAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customers] = useState<Customer[]>(sampleCustomers);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: company?.currency || 'USD',
    }).format(cents / 100);
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceivables = customers.reduce((sum, c) => sum + c.current_balance, 0);
  const activeCustomers = customers.filter(c => c.is_active).length;

  return (
    <AccountingLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Customers</h1>
            <p className="text-slate-400">Manage your customer accounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Customer</DialogTitle>
                <DialogDescription className="text-slate-400">
                  Add a new customer to your accounts receivable.
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Customer Number</Label>
                    <Input placeholder="C-006" className="bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Company Name</Label>
                    <Input placeholder="Company Inc." className="bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Contact Name</Label>
                    <Input placeholder="John Doe" className="bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Email</Label>
                    <Input type="email" placeholder="contact@company.com" className="bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Phone</Label>
                    <Input placeholder="+1 555-0100" className="bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Payment Terms (days)</Label>
                    <Input type="number" placeholder="30" className="bg-slate-700/50 border-slate-600 text-white" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Credit Limit</Label>
                  <Input type="number" placeholder="50000" className="bg-slate-700/50 border-slate-600 text-white" />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-600 text-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    Create Customer
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Customers</p>
                  <p className="text-2xl font-bold text-white">{customers.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Building2 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Active Customers</p>
                  <p className="text-2xl font-bold text-white">{activeCustomers}</p>
                </div>
                <div className="p-3 bg-emerald-500/20 rounded-full">
                  <Building2 className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Receivables</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(totalReceivables)}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-full">
                  <DollarSign className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white"
              />
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Customer</TableHead>
                  <TableHead className="text-slate-400">Contact</TableHead>
                  <TableHead className="text-slate-400">Terms</TableHead>
                  <TableHead className="text-slate-400">Credit Limit</TableHead>
                  <TableHead className="text-slate-400">Balance</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-slate-700 text-white">
                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-white">{customer.name}</p>
                          <p className="text-sm text-slate-500">{customer.customer_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-slate-300">{customer.contact_name}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-300">Net {customer.payment_terms}</TableCell>
                    <TableCell className="text-slate-300">{formatCurrency(customer.credit_limit)}</TableCell>
                    <TableCell>
                      <span className={customer.current_balance > 0 ? 'text-emerald-400' : 'text-slate-400'}>
                        {formatCurrency(customer.current_balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={customer.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                        {customer.is_active ? 'Active' : 'Inactive'}
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
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300">
                            <FileText className="mr-2 h-4 w-4" />
                            Create Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-slate-300">
                            <DollarSign className="mr-2 h-4 w-4" />
                            Record Payment
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
