import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet, Download, Printer } from 'lucide-react';

const trialBalanceData = [
  { account: '1000 - Cash', debit: 125000, credit: 0 },
  { account: '1100 - Accounts Receivable', debit: 45000, credit: 0 },
  { account: '1200 - Inventory', debit: 32000, credit: 0 },
  { account: '2000 - Accounts Payable', debit: 0, credit: 28000 },
  { account: '2100 - Accrued Liabilities', debit: 0, credit: 15000 },
  { account: '3000 - Owner Equity', debit: 0, credit: 100000 },
  { account: '4000 - Revenue', debit: 0, credit: 180000 },
  { account: '5000 - Cost of Goods Sold', debit: 76000, credit: 0 },
  { account: '6000 - Operating Expenses', debit: 45000, credit: 0 },
];

export default function TrialBalancePage() {
  const totalDebit = trialBalanceData.reduce((sum, row) => sum + row.debit, 0);
  const totalCredit = trialBalanceData.reduce((sum, row) => sum + row.credit, 0);

  return (
    <AccountingLayout title="Trial Balance">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Trial Balance Report</h2>
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
              <FileSpreadsheet className="h-5 w-5" />
              Trial Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalanceData.map((row) => (
                  <TableRow key={row.account}>
                    <TableCell className="font-medium">{row.account}</TableCell>
                    <TableCell className="text-right">
                      {row.debit > 0 ? `$${row.debit.toLocaleString()}` : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      {row.credit > 0 ? `$${row.credit.toLocaleString()}` : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold bg-muted/50">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">${totalDebit.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${totalCredit.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
