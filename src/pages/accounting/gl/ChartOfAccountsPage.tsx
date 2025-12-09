import { useState } from 'react';
import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Search, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface Account {
  id: string;
  account_number: string;
  name: string;
  account_type: string;
  sub_type?: string;
  is_active: boolean;
  current_balance: number;
}

const accountTypes = [
  { value: 'asset', label: 'Asset', color: 'bg-blue-500/10 text-blue-500' },
  { value: 'liability', label: 'Liability', color: 'bg-red-500/10 text-red-500' },
  { value: 'equity', label: 'Equity', color: 'bg-purple-500/10 text-purple-500' },
  { value: 'revenue', label: 'Revenue', color: 'bg-emerald-500/10 text-emerald-500' },
  { value: 'expense', label: 'Expense', color: 'bg-amber-500/10 text-amber-500' },
];

const sampleAccounts: Account[] = [
  { id: '1', account_number: '1000', name: 'Cash', account_type: 'asset', sub_type: 'Current Asset', is_active: true, current_balance: 5000000 },
  { id: '2', account_number: '1100', name: 'Accounts Receivable', account_type: 'asset', sub_type: 'Current Asset', is_active: true, current_balance: 15000000 },
  { id: '3', account_number: '1500', name: 'Equipment', account_type: 'asset', sub_type: 'Fixed Asset', is_active: true, current_balance: 75000000 },
  { id: '4', account_number: '2000', name: 'Accounts Payable', account_type: 'liability', sub_type: 'Current Liability', is_active: true, current_balance: 8500000 },
  { id: '5', account_number: '2500', name: 'Long-term Debt', account_type: 'liability', sub_type: 'Long-term Liability', is_active: true, current_balance: 50000000 },
  { id: '6', account_number: '3000', name: 'Common Stock', account_type: 'equity', is_active: true, current_balance: 100000000 },
  { id: '7', account_number: '3100', name: 'Retained Earnings', account_type: 'equity', is_active: true, current_balance: 45000000 },
  { id: '8', account_number: '4000', name: 'Sales Revenue', account_type: 'revenue', is_active: true, current_balance: 320000000 },
  { id: '9', account_number: '5000', name: 'Cost of Goods Sold', account_type: 'expense', is_active: true, current_balance: 180000000 },
  { id: '10', account_number: '6000', name: 'Salaries Expense', account_type: 'expense', is_active: true, current_balance: 95000000 },
];

export default function ChartOfAccountsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedTypes, setExpandedTypes] = useState<string[]>(['asset', 'liability', 'equity', 'revenue', 'expense']);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getTypeColor = (type: string) => {
    return accountTypes.find(t => t.value === type)?.color || 'bg-muted text-muted-foreground';
  };

  const toggleTypeExpansion = (type: string) => {
    setExpandedTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const filteredAccounts = sampleAccounts.filter(account => {
    const matchesSearch = 
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.account_number.includes(searchTerm);
    const matchesType = typeFilter === 'all' || account.account_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const groupedAccounts = accountTypes.reduce((acc, type) => {
    acc[type.value] = filteredAccounts.filter(a => a.account_type === type.value);
    return acc;
  }, {} as Record<string, Account[]>);

  return (
    <AccountingLayout title="Chart of Accounts">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="flex gap-2 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search accounts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {accountTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Account</DialogTitle>
                    <DialogDescription>
                      Add a new account to your chart of accounts.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Account Number</Label>
                        <Input placeholder="1000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Account Type</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {accountTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input placeholder="Cash" />
                    </div>
                    <div className="space-y-2">
                      <Label>Sub Type (Optional)</Label>
                      <Input placeholder="Current Asset" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={() => setIsDialogOpen(false)}>Create Account</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <div className="space-y-4">
          {accountTypes.map(type => {
            const typeAccounts = groupedAccounts[type.value] || [];
            if (typeAccounts.length === 0 && typeFilter !== 'all' && typeFilter !== type.value) return null;
            
            return (
              <Card key={type.value} className="bg-card/50 border-border/50">
                <CardHeader 
                  className="cursor-pointer hover:bg-muted/30 transition-colors py-3"
                  onClick={() => toggleTypeExpansion(type.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedTypes.includes(type.value) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                      <Badge className={type.color}>{type.label}</Badge>
                      <span className="text-muted-foreground text-sm">({typeAccounts.length} accounts)</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(typeAccounts.reduce((sum, a) => sum + a.current_balance, 0))}
                    </span>
                  </div>
                </CardHeader>
                {expandedTypes.includes(type.value) && typeAccounts.length > 0 && (
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Account #</TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Sub Type</TableHead>
                          <TableHead className="text-right">Balance</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeAccounts.map((account) => (
                          <TableRow key={account.id} className="hover:bg-muted/30">
                            <TableCell className="font-mono">{account.account_number}</TableCell>
                            <TableCell className="font-medium">{account.name}</TableCell>
                            <TableCell className="text-muted-foreground">{account.sub_type || '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(account.current_balance)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </AccountingLayout>
  );
}
