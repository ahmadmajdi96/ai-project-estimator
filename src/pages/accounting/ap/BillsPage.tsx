import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, FileText } from 'lucide-react';

const bills = [
  { id: 'BILL-001', vendor: 'Office Supplies Co', date: '2024-01-15', due: '2024-02-15', amount: 2500, status: 'pending' },
  { id: 'BILL-002', vendor: 'Tech Equipment Ltd', date: '2024-01-10', due: '2024-02-10', amount: 15000, status: 'overdue' },
  { id: 'BILL-003', vendor: 'Utility Services', date: '2024-01-20', due: '2024-02-20', amount: 1200, status: 'pending' },
  { id: 'BILL-004', vendor: 'Marketing Agency', date: '2024-01-05', due: '2024-02-05', amount: 8000, status: 'paid' },
  { id: 'BILL-005', vendor: 'Cloud Services Inc', date: '2024-01-01', due: '2024-02-01', amount: 3500, status: 'paid' },
];

export default function BillsPage() {
  return (
    <AccountingLayout title="Bills">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search bills..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Record Bill
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Bills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill #</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Bill Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.id}</TableCell>
                    <TableCell>{bill.vendor}</TableCell>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.due}</TableCell>
                    <TableCell className="text-right">${bill.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        bill.status === 'paid' ? 'default' : 
                        bill.status === 'overdue' ? 'destructive' : 'secondary'
                      }>
                        {bill.status}
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
