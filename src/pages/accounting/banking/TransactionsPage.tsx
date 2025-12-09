import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, CreditCard } from 'lucide-react';

const transactions = [
  { id: 'TXN-001', date: '2024-01-15', description: 'Client Payment - ABC Corp', account: 'Main Operating', amount: 5000, type: 'deposit', reconciled: true },
  { id: 'TXN-002', date: '2024-01-14', description: 'Office Rent Payment', account: 'Main Operating', amount: -5000, type: 'withdrawal', reconciled: true },
  { id: 'TXN-003', date: '2024-01-13', description: 'Payroll Disbursement', account: 'Payroll Account', amount: -45000, type: 'withdrawal', reconciled: false },
  { id: 'TXN-004', date: '2024-01-12', description: 'Vendor Payment - Tech Equipment', account: 'Main Operating', amount: -15000, type: 'withdrawal', reconciled: true },
  { id: 'TXN-005', date: '2024-01-11', description: 'Client Payment - XYZ Ltd', account: 'Main Operating', amount: 3500, type: 'deposit', reconciled: false },
  { id: 'TXN-006', date: '2024-01-10', description: 'Transfer to Savings', account: 'Main Operating', amount: -10000, type: 'transfer', reconciled: true },
];

export default function TransactionsPage() {
  return (
    <AccountingLayout title="Bank Transactions">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Reconciled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell className="font-medium">{txn.description}</TableCell>
                    <TableCell>{txn.account}</TableCell>
                    <TableCell className={`text-right font-semibold ${txn.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {txn.amount >= 0 ? '+' : ''}${Math.abs(txn.amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={txn.reconciled ? 'default' : 'secondary'}>
                        {txn.reconciled ? 'Reconciled' : 'Pending'}
                      </Badge>
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
