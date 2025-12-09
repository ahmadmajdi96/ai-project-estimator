import { useState } from 'react';
import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { useAccountingAuth } from '@/hooks/useAccountingAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { Plus, Search, Filter, Edit, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

interface Account {
  id: string;
  account_number: string;
  name: string;
  account_type: string;
  sub_type?: string;
  description?: string;
  is_active: boolean;
  current_balance: number;
  parent_account_id?: string;
}

const accountTypes = [
  { value: 'asset', label: 'Asset', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'liability', label: 'Liability', color: 'bg-red-500/20 text-red-400' },
  { value: 'equity', label: 'Equity', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'revenue', label: 'Revenue', color: 'bg-emerald-500/20 text-emerald-400' },
  { value: 'expense', label: 'Expense', color: 'bg-orange-500/20 text-orange-400' },
];

// Sample data for demonstration
const sampleAccounts: Account[] = [
  { id: '1', account_number: '1000', name: 'Cash', account_type: 'asset', sub_type: 'Current Asset', is_active: true, current_balance: 5000000 },
  { id: '2', account_number: '1100', name: 'Accounts Receivable', account_type: 'asset', sub_type: 'Current Asset', is_active: true, current_balance: 15000000 },
  { id: '3', account_number: '1200', name: 'Inventory', account_type: 'asset', sub_type: 'Current Asset', is_active: true, current_balance: 25000000 },
  { id: '4', account_number: '1500', name: 'Equipment', account_type: 'asset', sub_type: 'Fixed Asset', is_active: true, current_balance: 75000000 },
  { id: '5', account_number: '2000', name: 'Accounts Payable', account_type: 'liability', sub_type: 'Current Liability', is_active: true, current_balance: 8500000 },
  { id: '6', account_number: '2100', name: 'Accrued Expenses', account_type: 'liability', sub_type: 'Current Liability', is_active: true, current_balance: 3200000 },
  { id: '7', account_number: '2500', name: 'Long-term Debt', account_type: 'liability', sub_type: 'Long-term Liability', is_active: true, current_balance: 50000000 },
  { id: '8', account_number: '3000', name: 'Common Stock', account_type: 'equity', is_active: true, current_balance: 100000000 },
  { id: '9', account_number: '3100', name: 'Retained Earnings', account_type: 'equity', is_active: true, current_balance: 45000000 },
  { id: '10', account_number: '4000', name: 'Sales Revenue', account_type: 'revenue', is_active: true, current_balance: 320000000 },
  { id: '11', account_number: '4100', name: 'Service Revenue', account_type: 'revenue', is_active: true, current_balance: 85000000 },
  { id: '12', account_number: '5000', name: 'Cost of Goods Sold', account_type: 'expense', is_active: true, current_balance: 180000000 },
  { id: '13', account_number: '6000', name: 'Salaries Expense', account_type: 'expense', is_active: true, current_balance: 95000000 },
  { id: '14', account_number: '6100', name: 'Rent Expense', account_type: 'expense', is_active: true, current_balance: 24000000 },
  { id: '15', account_number: '6200', name: 'Utilities Expense', account_type: 'expense', is_active: true, current_balance: 8500000 },
];

export default function ChartOfAccountsPage() {
  const { accountingUser, company } = useAccountingAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [expandedTypes, setExpandedTypes] = useState<string[]>(['asset', 'liability', 'equity', 'revenue', 'expense']);

  // Form state
  const [formData, setFormData] = useState({
    account_number: '',
    name: '',
    account_type: 'asset',
    sub_type: '',
    description: '',
  });

  // Fetch accounts
  const { data: accounts = sampleAccounts, isLoading } = useQuery({
    queryKey: ['gl_accounts', accountingUser?.company_id],
    queryFn: async () => {
      if (!accountingUser?.company_id) return sampleAccounts;
      const { data, error } = await supabase
        .from('gl_accounts')
        .select('*')
        .eq('company_id', accountingUser.company_id)
        .order('account_number');
      
      if (error) throw error;
      return data.length > 0 ? data : sampleAccounts;
    },
    enabled: !!accountingUser?.company_id,
  });

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: company?.currency || 'USD',
    }).format(cents / 100);
  };

  const getTypeColor = (type: string) => {
    return accountTypes.find(t => t.value === type)?.color || 'bg-slate-500/20 text-slate-400';
  };

  const toggleTypeExpansion = (type: string) => {
    setExpandedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const filteredAccounts = accounts.filter(account => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to the database
    toast.success(editingAccount ? 'Account updated!' : 'Account created!');
    setIsDialogOpen(false);
    setEditingAccount(null);
    setFormData({ account_number: '', name: '', account_type: 'asset', sub_type: '', description: '' });
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setFormData({
      account_number: account.account_number,
      name: account.name,
      account_type: account.account_type,
      sub_type: account.sub_type || '',
      description: account.description || '',
    });
    setIsDialogOpen(true);
  };

  return (
    <AccountingLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Chart of Accounts</h1>
            <p className="text-slate-400">Manage your general ledger accounts</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingAccount ? 'Edit Account' : 'Create New Account'}
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  {editingAccount ? 'Update the account details below.' : 'Add a new account to your chart of accounts.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Account Number</Label>
                    <Input
                      value={formData.account_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                      placeholder="1000"
                      className="bg-slate-700/50 border-slate-600 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Account Type</Label>
                    <Select
                      value={formData.account_type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, account_type: value }))}
                    >
                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {accountTypes.map(type => (
                          <SelectItem key={type.value} value={type.value} className="text-white">
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Account Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Cash"
                    className="bg-slate-700/50 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Sub Type (Optional)</Label>
                  <Input
                    value={formData.sub_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, sub_type: e.target.value }))}
                    placeholder="Current Asset"
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description (Optional)</Label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Account description..."
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="border-slate-600 text-slate-300">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                    {editingAccount ? 'Update' : 'Create'} Account
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px] bg-slate-700/50 border-slate-600 text-white">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  {accountTypes.map(type => (
                    <SelectItem key={type.value} value={type.value} className="text-white">
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Accounts List */}
        <div className="space-y-4">
          {accountTypes.map(type => {
            const typeAccounts = groupedAccounts[type.value] || [];
            if (typeAccounts.length === 0 && typeFilter !== 'all' && typeFilter !== type.value) return null;
            
            return (
              <Card key={type.value} className="bg-slate-800/50 border-slate-700">
                <CardHeader 
                  className="cursor-pointer hover:bg-slate-700/30 transition-colors"
                  onClick={() => toggleTypeExpansion(type.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedTypes.includes(type.value) ? (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      )}
                      <Badge className={type.color}>{type.label}</Badge>
                      <span className="text-slate-400 text-sm">({typeAccounts.length} accounts)</span>
                    </div>
                    <span className="text-white font-medium">
                      {formatCurrency(typeAccounts.reduce((sum, a) => sum + a.current_balance, 0))}
                    </span>
                  </div>
                </CardHeader>
                {expandedTypes.includes(type.value) && typeAccounts.length > 0 && (
                  <CardContent className="pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700 hover:bg-transparent">
                          <TableHead className="text-slate-400">Account #</TableHead>
                          <TableHead className="text-slate-400">Name</TableHead>
                          <TableHead className="text-slate-400">Sub Type</TableHead>
                          <TableHead className="text-slate-400 text-right">Balance</TableHead>
                          <TableHead className="text-slate-400 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {typeAccounts.map((account) => (
                          <TableRow key={account.id} className="border-slate-700 hover:bg-slate-700/30">
                            <TableCell className="font-mono text-slate-300">{account.account_number}</TableCell>
                            <TableCell className="text-white font-medium">{account.name}</TableCell>
                            <TableCell className="text-slate-400">{account.sub_type || '-'}</TableCell>
                            <TableCell className="text-right text-white">{formatCurrency(account.current_balance)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(account)}
                                  className="text-slate-400 hover:text-white"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-slate-400 hover:text-red-400"
                                >
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
