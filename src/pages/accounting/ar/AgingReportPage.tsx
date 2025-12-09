import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, Download, Printer } from 'lucide-react';

const agingData = [
  { customer: 'ABC Corp', current: 5000, days30: 2500, days60: 0, days90: 0, over90: 0, total: 7500 },
  { customer: 'XYZ Ltd', current: 3000, days30: 1800, days60: 1200, days90: 0, over90: 0, total: 6000 },
  { customer: 'Tech Inc', current: 8000, days30: 0, days60: 0, days90: 3200, over90: 0, total: 11200 },
  { customer: 'Global Co', current: 12000, days30: 5000, days60: 2000, days90: 0, over90: 1500, total: 20500 },
  { customer: 'Local Shop', current: 1500, days30: 800, days60: 0, days90: 0, over90: 0, total: 2300 },
];

export default function AgingReportPage() {
  const totals = agingData.reduce(
    (acc, row) => ({
      current: acc.current + row.current,
      days30: acc.days30 + row.days30,
      days60: acc.days60 + row.days60,
      days90: acc.days90 + row.days90,
      over90: acc.over90 + row.over90,
      total: acc.total + row.total,
    }),
    { current: 0, days30: 0, days60: 0, days90: 0, over90: 0, total: 0 }
  );

  return (
    <AccountingLayout title="AR Aging Report">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Accounts Receivable Aging</h2>
            <p className="text-sm text-muted-foreground">As of January 31, 2024</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Aging Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">1-30 Days</TableHead>
                  <TableHead className="text-right">31-60 Days</TableHead>
                  <TableHead className="text-right">61-90 Days</TableHead>
                  <TableHead className="text-right">Over 90</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agingData.map((row) => (
                  <TableRow key={row.customer}>
                    <TableCell className="font-medium">{row.customer}</TableCell>
                    <TableCell className="text-right">${row.current.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-yellow-600">
                      {row.days30 > 0 ? `$${row.days30.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">
                      {row.days60 > 0 ? `$${row.days60.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      {row.days90 > 0 ? `$${row.days90.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right text-red-700">
                      {row.over90 > 0 ? `$${row.over90.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right font-semibold">${row.total.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">${totals.current.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-yellow-600">${totals.days30.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-orange-600">${totals.days60.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-500">${totals.days90.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-red-700">${totals.over90.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${totals.total.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
