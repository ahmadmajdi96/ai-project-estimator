import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PieChart, FileText, TrendingUp, DollarSign, BarChart3, Download } from 'lucide-react';

const reports = [
  { name: 'Income Statement', description: 'Revenue, expenses, and net income', icon: TrendingUp, category: 'Financial' },
  { name: 'Balance Sheet', description: 'Assets, liabilities, and equity', icon: BarChart3, category: 'Financial' },
  { name: 'Cash Flow Statement', description: 'Cash inflows and outflows', icon: DollarSign, category: 'Financial' },
  { name: 'Accounts Receivable Aging', description: 'Outstanding customer invoices', icon: FileText, category: 'AR' },
  { name: 'Accounts Payable Aging', description: 'Outstanding vendor bills', icon: FileText, category: 'AP' },
  { name: 'General Ledger', description: 'All transactions by account', icon: FileText, category: 'GL' },
  { name: 'Trial Balance', description: 'Account balances summary', icon: FileText, category: 'GL' },
  { name: 'Profit & Loss by Department', description: 'Departmental P&L breakdown', icon: PieChart, category: 'Analysis' },
];

export default function ReportsPage() {
  return (
    <AccountingLayout title="Financial Reports">
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold">Reports Library</h2>
          <p className="text-sm text-muted-foreground">Generate and download financial reports</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card key={report.name} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <report.icon className="h-5 w-5 text-primary" />
                  {report.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs bg-muted px-2 py-1 rounded">{report.category}</span>
                  <Button size="sm" variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AccountingLayout>
  );
}
