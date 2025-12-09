import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Landmark, RefreshCw } from 'lucide-react';

const bankAccounts = [
  { id: 'BA-001', name: 'Main Operating Account', bank: 'First National Bank', type: 'Checking', balance: 125000, status: 'active' },
  { id: 'BA-002', name: 'Payroll Account', bank: 'First National Bank', type: 'Checking', balance: 45000, status: 'active' },
  { id: 'BA-003', name: 'Savings Reserve', bank: 'Capital Savings', type: 'Savings', balance: 250000, status: 'active' },
  { id: 'BA-004', name: 'Petty Cash', bank: 'Local Credit Union', type: 'Checking', balance: 5000, status: 'active' },
  { id: 'BA-005', name: 'Investment Account', bank: 'Investment Bank', type: 'Money Market', balance: 100000, status: 'active' },
];

export default function BankAccountsPage() {
  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <AccountingLayout title="Bank Accounts">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Total Cash Position</h2>
            <p className="text-3xl font-bold text-primary">${totalBalance.toLocaleString()}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Account
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Landmark className="h-5 w-5" />
              Bank Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Bank</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bankAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>{account.bank}</TableCell>
                    <TableCell>{account.type}</TableCell>
                    <TableCell className="text-right font-semibold">${account.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="default">{account.status}</Badge>
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
