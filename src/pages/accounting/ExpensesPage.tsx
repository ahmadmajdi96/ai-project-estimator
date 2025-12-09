import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Receipt } from 'lucide-react';

const expenses = [
  { id: 'EXP-001', date: '2024-01-15', description: 'Office Supplies', category: 'Supplies', amount: 250, submittedBy: 'John Smith', status: 'approved' },
  { id: 'EXP-002', date: '2024-01-14', description: 'Client Lunch', category: 'Meals', amount: 85, submittedBy: 'Jane Doe', status: 'pending' },
  { id: 'EXP-003', date: '2024-01-13', description: 'Software Subscription', category: 'Software', amount: 500, submittedBy: 'Bob Wilson', status: 'approved' },
  { id: 'EXP-004', date: '2024-01-12', description: 'Travel - Flight', category: 'Travel', amount: 450, submittedBy: 'Alice Brown', status: 'pending' },
  { id: 'EXP-005', date: '2024-01-11', description: 'Marketing Materials', category: 'Marketing', amount: 1200, submittedBy: 'Mike Johnson', status: 'rejected' },
];

export default function ExpensesPage() {
  return (
    <AccountingLayout title="Expenses">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search expenses..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Expense ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Submitted By</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.id}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{expense.category}</Badge>
                    </TableCell>
                    <TableCell>{expense.submittedBy}</TableCell>
                    <TableCell className="text-right">${expense.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        expense.status === 'approved' ? 'default' :
                        expense.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {expense.status}
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
