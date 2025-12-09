import { useState } from 'react';
import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Plus, Search, Mail, DollarSign, FileText, MoreHorizontal, Building2 } from 'lucide-react';

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

const sampleCustomers: Customer[] = [
  { id: '1', customer_number: 'C-001', name: 'Acme Corporation', contact_name: 'John Smith', email: 'john@acme.com', phone: '+1 555-0101', payment_terms: 30, credit_limit: 50000, current_balance: 15000, is_active: true },
  { id: '2', customer_number: 'C-002', name: 'TechStart Inc', contact_name: 'Sarah Johnson', email: 'sarah@techstart.io', phone: '+1 555-0102', payment_terms: 15, credit_limit: 25000, current_balance: 8500, is_active: true },
  { id: '3', customer_number: 'C-003', name: 'Global Enterprises', contact_name: 'Michael Brown', email: 'michael@globalent.com', phone: '+1 555-0103', payment_terms: 45, credit_limit: 100000, current_balance: 42000, is_active: true },
  { id: '4', customer_number: 'C-004', name: 'Sunrise Media', contact_name: 'Emily Davis', email: 'emily@sunrisemedia.com', phone: '+1 555-0104', payment_terms: 30, credit_limit: 30000, current_balance: 5200, is_active: true },
  { id: '5', customer_number: 'C-005', name: 'Metro Solutions', contact_name: 'David Wilson', email: 'david@metrosol.com', phone: '+1 555-0105', payment_terms: 30, credit_limit: 40000, current_balance: 0, is_active: false },
];

export default function CustomersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const filteredCustomers = sampleCustomers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.customer_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.contact_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalReceivables = sampleCustomers.reduce((sum, c) => sum + c.current_balance, 0);
  const activeCustomers = sampleCustomers.filter(c => c.is_active).length;

  return (
    <AccountingLayout title="Customers">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleCustomers.length}</p>
                <p className="text-xs text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <Building2 className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCustomers}</p>
                <p className="text-xs text-muted-foreground">Active Customers</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalReceivables)}</p>
                <p className="text-xs text-muted-foreground">Total Receivables</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <DollarSign className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{sampleCustomers.filter(c => c.current_balance > 0).length}</p>
                <p className="text-xs text-muted-foreground">With Balance</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search & Actions */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                    <DialogDescription>
                      Add a new customer to your accounts receivable.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Customer Number</Label>
                        <Input placeholder="C-006" />
                      </div>
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input placeholder="Company Inc." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Contact Name</Label>
                        <Input placeholder="John Doe" />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="contact@company.com" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="+1 555-0100" />
                      </div>
                      <div className="space-y-2">
                        <Label>Payment Terms (days)</Label>
                        <Input type="number" placeholder="30" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Credit Limit</Label>
                      <Input type="number" placeholder="50000" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Create Customer</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead className="text-right">Credit Limit</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-muted-foreground">{customer.customer_number}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{customer.contact_name}</p>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {customer.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>Net {customer.payment_terms}</TableCell>
                    <TableCell className="text-right">{formatCurrency(customer.credit_limit)}</TableCell>
                    <TableCell className="text-right">
                      <span className={customer.current_balance > 0 ? 'text-amber-500' : 'text-muted-foreground'}>
                        {formatCurrency(customer.current_balance)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={customer.is_active ? 'default' : 'secondary'}>
                        {customer.is_active ? 'Active' : 'Inactive'}
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
                            <FileText className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Create Invoice
                          </DropdownMenuItem>
                          <DropdownMenuItem>
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
