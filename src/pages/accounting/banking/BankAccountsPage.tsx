import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Landmark } from 'lucide-react';

interface BankAccount {
  id: string;
  name: string;
  bank: string;
  type: string;
  accountNumber: string;
  balance: number;
  status: string;
}

const initialAccounts: BankAccount[] = [
  { id: 'BA-001', name: 'Main Operating Account', bank: 'First National Bank', type: 'Checking', accountNumber: '****1234', balance: 125000, status: 'active' },
  { id: 'BA-002', name: 'Payroll Account', bank: 'First National Bank', type: 'Checking', accountNumber: '****5678', balance: 45000, status: 'active' },
  { id: 'BA-003', name: 'Savings Reserve', bank: 'Capital Savings', type: 'Savings', accountNumber: '****9012', balance: 250000, status: 'active' },
  { id: 'BA-004', name: 'Petty Cash', bank: 'Local Credit Union', type: 'Checking', accountNumber: '****3456', balance: 5000, status: 'active' },
  { id: 'BA-005', name: 'Investment Account', bank: 'Investment Bank', type: 'Money Market', accountNumber: '****7890', balance: 100000, status: 'active' },
];

const columns: Column<BankAccount>[] = [
  { key: 'name', label: 'Account Name', type: 'text' },
  { key: 'bank', label: 'Bank', type: 'text' },
  { key: 'type', label: 'Type', type: 'select', options: [
    { value: 'Checking', label: 'Checking' },
    { value: 'Savings', label: 'Savings' },
    { value: 'Money Market', label: 'Money Market' },
  ]},
  { key: 'accountNumber', label: 'Account #', type: 'text' },
  { key: 'balance', label: 'Balance', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    badgeVariant: (value) => value === 'active' ? 'default' : 'secondary',
  },
];

export default function BankAccountsPage() {
  const totalBalance = initialAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <AccountingLayout title="Bank Accounts">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Cash Position</div>
              <div className="text-2xl font-bold text-primary">${totalBalance.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Active Accounts</div>
              <div className="text-2xl font-bold">{initialAccounts.filter(a => a.status === 'active').length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Last Sync</div>
              <div className="text-2xl font-bold">Just now</div>
            </CardContent>
          </Card>
        </div>

        <AccountingDataTable
          title="Bank Accounts"
          icon={Landmark}
          data={initialAccounts}
          columns={columns}
          addButtonLabel="Add Account"
          searchPlaceholder="Search accounts..."
        />
      </div>
    </AccountingLayout>
  );
}
