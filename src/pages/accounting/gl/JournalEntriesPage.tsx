import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, FileText } from 'lucide-react';

const journalEntries = [
  { id: 'JE-001', date: '2024-01-15', description: 'Monthly rent payment', debit: 5000, credit: 5000, status: 'posted' },
  { id: 'JE-002', date: '2024-01-14', description: 'Office supplies purchase', debit: 250, credit: 250, status: 'posted' },
  { id: 'JE-003', date: '2024-01-13', description: 'Client payment received', debit: 15000, credit: 15000, status: 'posted' },
  { id: 'JE-004', date: '2024-01-12', description: 'Payroll disbursement', debit: 45000, credit: 45000, status: 'pending' },
  { id: 'JE-005', date: '2024-01-11', description: 'Utility bill payment', debit: 1200, credit: 1200, status: 'posted' },
];

export default function JournalEntriesPage() {
  return (
    <AccountingLayout title="Journal Entries">
      <div className="space-y-6">
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
            New Entry
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entry ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Debit</TableHead>
                  <TableHead className="text-right">Credit</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {journalEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.id}</TableCell>
                    <TableCell>{entry.date}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell className="text-right">${entry.debit.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${entry.credit.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={entry.status === 'posted' ? 'default' : 'secondary'}>
                        {entry.status}
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
