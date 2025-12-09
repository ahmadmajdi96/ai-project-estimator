import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { FileSpreadsheet, Check } from 'lucide-react';

const unreconciledItems = [
  { id: 1, date: '2024-01-13', description: 'Payroll Disbursement', bookAmount: -45000, bankAmount: -45000, matched: true },
  { id: 2, date: '2024-01-11', description: 'Client Payment - XYZ Ltd', bookAmount: 3500, bankAmount: 3500, matched: true },
  { id: 3, date: '2024-01-09', description: 'Bank Service Charge', bookAmount: 0, bankAmount: -25, matched: false },
  { id: 4, date: '2024-01-08', description: 'Interest Income', bookAmount: 0, bankAmount: 125, matched: false },
];

export default function ReconciliationPage() {
  return (
    <AccountingLayout title="Bank Reconciliation">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Book Balance</div>
              <div className="text-2xl font-bold">$125,000</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Bank Balance</div>
              <div className="text-2xl font-bold">$125,100</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Difference</div>
              <div className="text-2xl font-bold text-yellow-600">$100</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Items to Reconcile
            </CardTitle>
            <Button>
              <Check className="h-4 w-4 mr-2" />
              Complete Reconciliation
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Book Amount</TableHead>
                  <TableHead className="text-right">Bank Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unreconciledItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox checked={item.matched} />
                    </TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.bookAmount !== 0 ? `$${item.bookAmount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.bankAmount !== 0 ? `$${item.bankAmount.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.matched ? 'default' : 'secondary'}>
                        {item.matched ? 'Matched' : 'Unmatched'}
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
