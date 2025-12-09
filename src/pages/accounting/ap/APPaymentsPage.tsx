import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Wallet } from 'lucide-react';

const payments = [
  { id: 'APAY-001', date: '2024-01-15', vendor: 'Office Supplies Co', amount: 2500, method: 'Bank Transfer', bill: 'BILL-001' },
  { id: 'APAY-002', date: '2024-01-14', vendor: 'Marketing Agency', amount: 8000, method: 'Check', bill: 'BILL-004' },
  { id: 'APAY-003', date: '2024-01-13', vendor: 'Cloud Services Inc', amount: 3500, method: 'ACH', bill: 'BILL-005' },
  { id: 'APAY-004', date: '2024-01-12', vendor: 'Utility Services', amount: 1200, method: 'Bank Transfer', bill: 'BILL-003' },
  { id: 'APAY-005', date: '2024-01-11', vendor: 'Tech Equipment Ltd', amount: 5000, method: 'Wire Transfer', bill: 'BILL-002' },
];

export default function APPaymentsPage() {
  return (
    <AccountingLayout title="AP Payments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search payments..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Make Payment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Vendor Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.vendor}</TableCell>
                    <TableCell>{payment.bill}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-red-600 font-medium">
                      -${payment.amount.toLocaleString()}
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
