import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Clock } from 'lucide-react';

const timeEntries = [
  { id: 'TE-001', date: '2024-01-15', employee: 'John Smith', project: 'Website Redesign', task: 'Frontend Development', hours: 8, rate: 150, amount: 1200, billable: true },
  { id: 'TE-002', date: '2024-01-15', employee: 'Jane Doe', project: 'Mobile App Development', task: 'UI Design', hours: 6, rate: 125, amount: 750, billable: true },
  { id: 'TE-003', date: '2024-01-14', employee: 'Bob Wilson', project: 'ERP Implementation', task: 'Client Meeting', hours: 2, rate: 200, amount: 400, billable: true },
  { id: 'TE-004', date: '2024-01-14', employee: 'Alice Brown', project: 'Internal', task: 'Team Training', hours: 4, rate: 100, amount: 400, billable: false },
  { id: 'TE-005', date: '2024-01-13', employee: 'Mike Johnson', project: 'Security Audit', task: 'Vulnerability Assessment', hours: 8, rate: 175, amount: 1400, billable: true },
];

export default function TimeEntriesPage() {
  const totalHours = timeEntries.reduce((sum, t) => sum + t.hours, 0);
  const billableAmount = timeEntries.filter(t => t.billable).reduce((sum, t) => sum + t.amount, 0);

  return (
    <AccountingLayout title="Time Entries">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Hours</div>
              <div className="text-2xl font-bold">{totalHours}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Billable Amount</div>
              <div className="text-2xl font-bold text-primary">${billableAmount.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Entries This Week</div>
              <div className="text-2xl font-bold">{timeEntries.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search entries..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Log Time
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Task</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Billable</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell className="font-medium">{entry.employee}</TableCell>
                    <TableCell>{entry.project}</TableCell>
                    <TableCell>{entry.task}</TableCell>
                    <TableCell className="text-right">{entry.hours}</TableCell>
                    <TableCell className="text-right">${entry.rate}/hr</TableCell>
                    <TableCell className="text-right font-semibold">${entry.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={entry.billable ? 'default' : 'secondary'}>
                        {entry.billable ? 'Yes' : 'No'}
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
