import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Receipt, Download } from 'lucide-react';

const paystubs = [
  { id: 'PS-001', employee: 'John Smith', period: 'Jan 1-15, 2024', grossPay: 3958, taxes: 989, deductions: 200, netPay: 2769 },
  { id: 'PS-002', employee: 'Jane Doe', period: 'Jan 1-15, 2024', grossPay: 3542, taxes: 885, deductions: 150, netPay: 2507 },
  { id: 'PS-003', employee: 'Bob Wilson', period: 'Jan 1-15, 2024', grossPay: 2500, taxes: 625, deductions: 100, netPay: 1775 },
  { id: 'PS-004', employee: 'Alice Brown', period: 'Jan 1-15, 2024', grossPay: 2708, taxes: 677, deductions: 125, netPay: 1906 },
  { id: 'PS-005', employee: 'Mike Johnson', period: 'Jan 1-15, 2024', grossPay: 2800, taxes: 700, deductions: 100, netPay: 2000 },
];

export default function PaystubsPage() {
  return (
    <AccountingLayout title="Paystubs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search paystubs..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Paystubs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Paystub #</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Taxes</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paystubs.map((stub) => (
                  <TableRow key={stub.id}>
                    <TableCell className="font-medium">{stub.id}</TableCell>
                    <TableCell>{stub.employee}</TableCell>
                    <TableCell>{stub.period}</TableCell>
                    <TableCell className="text-right">${stub.grossPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">-${stub.taxes.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-orange-600">-${stub.deductions.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold text-green-600">${stub.netPay.toLocaleString()}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
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
