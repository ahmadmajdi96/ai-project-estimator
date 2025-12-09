import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, CreditCard } from 'lucide-react';

const payments = [
  { id: 'PAY-001', date: '2024-01-15', customer: 'ABC Corp', amount: 5000, method: 'Bank Transfer', invoice: 'INV-001' },
  { id: 'PAY-002', date: '2024-01-14', customer: 'XYZ Ltd', amount: 3500, method: 'Credit Card', invoice: 'INV-002' },
  { id: 'PAY-003', date: '2024-01-13', customer: 'Tech Inc', amount: 12000, method: 'Check', invoice: 'INV-003' },
  { id: 'PAY-004', date: '2024-01-12', customer: 'Global Co', amount: 8500, method: 'Bank Transfer', invoice: 'INV-004' },
  { id: 'PAY-005', date: '2024-01-11', customer: 'Local Shop', amount: 1500, method: 'Cash', invoice: 'INV-005' },
];

export default function ARPaymentsPage() {
  return (
    <AccountingLayout title="AR Payments">
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
            Record Payment
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Customer Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>{payment.customer}</TableCell>
                    <TableCell>{payment.invoice}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{payment.method}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-green-600 font-medium">
                      +${payment.amount.toLocaleString()}
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
