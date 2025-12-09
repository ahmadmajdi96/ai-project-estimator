import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Plus, TrendingUp } from 'lucide-react';

const budgets = [
  { category: 'Revenue', budget: 500000, actual: 425000, variance: -75000 },
  { category: 'Payroll', budget: 200000, actual: 185000, variance: 15000 },
  { category: 'Marketing', budget: 50000, actual: 48000, variance: 2000 },
  { category: 'Operations', budget: 75000, actual: 82000, variance: -7000 },
  { category: 'IT & Software', budget: 30000, actual: 28500, variance: 1500 },
  { category: 'Facilities', budget: 25000, actual: 24000, variance: 1000 },
];

export default function BudgetsPage() {
  return (
    <AccountingLayout title="Budgets">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Budget vs Actual</h2>
            <p className="text-sm text-muted-foreground">FY 2024 - Q1</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Budget
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Budget Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="w-48">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {budgets.map((item) => {
                  const percentage = (item.actual / item.budget) * 100;
                  const isRevenue = item.category === 'Revenue';
                  const isOverBudget = isRevenue ? item.actual < item.budget : item.actual > item.budget;
                  
                  return (
                    <TableRow key={item.category}>
                      <TableCell className="font-medium">{item.category}</TableCell>
                      <TableCell className="text-right">${item.budget.toLocaleString()}</TableCell>
                      <TableCell className="text-right">${item.actual.toLocaleString()}</TableCell>
                      <TableCell className={`text-right font-medium ${
                        isOverBudget ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {item.variance >= 0 ? '+' : ''}{item.variance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={Math.min(percentage, 100)} className="h-2" />
                          <span className="text-xs text-muted-foreground w-12">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
