import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, DollarSign, Play } from 'lucide-react';

const payrollRuns = [
  { id: 'PR-2024-01', period: 'Jan 1-15, 2024', employees: 25, grossPay: 125000, taxes: 31250, netPay: 93750, status: 'completed' },
  { id: 'PR-2024-02', period: 'Jan 16-31, 2024', employees: 25, grossPay: 125000, taxes: 31250, netPay: 93750, status: 'completed' },
  { id: 'PR-2024-03', period: 'Feb 1-15, 2024', employees: 26, grossPay: 130000, taxes: 32500, netPay: 97500, status: 'processing' },
  { id: 'PR-2024-04', period: 'Feb 16-28, 2024', employees: 26, grossPay: 130000, taxes: 32500, netPay: 97500, status: 'draft' },
];

export default function PayrollRunsPage() {
  return (
    <AccountingLayout title="Payroll Runs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Payroll Processing</h2>
            <p className="text-sm text-muted-foreground">Manage and run payroll cycles</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Payroll Run
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payroll Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Run ID</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead className="text-center">Employees</TableHead>
                  <TableHead className="text-right">Gross Pay</TableHead>
                  <TableHead className="text-right">Taxes</TableHead>
                  <TableHead className="text-right">Net Pay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell className="font-medium">{run.id}</TableCell>
                    <TableCell>{run.period}</TableCell>
                    <TableCell className="text-center">{run.employees}</TableCell>
                    <TableCell className="text-right">${run.grossPay.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">-${run.taxes.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">${run.netPay.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        run.status === 'completed' ? 'default' :
                        run.status === 'processing' ? 'secondary' : 'outline'
                      }>
                        {run.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {run.status === 'draft' && (
                        <Button size="sm" variant="outline">
                          <Play className="h-3 w-3 mr-1" />
                          Run
                        </Button>
                      )}
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
