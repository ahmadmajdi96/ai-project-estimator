import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface TimeEntry {
  id: string;
  date: string;
  employee: string;
  project: string;
  task: string;
  hours: number;
  rate: number;
  amount: number;
  billable: string;
}

const initialEntries: TimeEntry[] = [
  { id: 'TE-001', date: '2024-01-15', employee: 'John Smith', project: 'Website Redesign', task: 'Frontend Development', hours: 8, rate: 150, amount: 1200, billable: 'yes' },
  { id: 'TE-002', date: '2024-01-15', employee: 'Jane Doe', project: 'Mobile App Development', task: 'UI Design', hours: 6, rate: 125, amount: 750, billable: 'yes' },
  { id: 'TE-003', date: '2024-01-14', employee: 'Bob Wilson', project: 'ERP Implementation', task: 'Client Meeting', hours: 2, rate: 200, amount: 400, billable: 'yes' },
  { id: 'TE-004', date: '2024-01-14', employee: 'Alice Brown', project: 'Internal', task: 'Team Training', hours: 4, rate: 100, amount: 400, billable: 'no' },
  { id: 'TE-005', date: '2024-01-13', employee: 'Mike Johnson', project: 'Security Audit', task: 'Vulnerability Assessment', hours: 8, rate: 175, amount: 1400, billable: 'yes' },
];

const columns: Column<TimeEntry>[] = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'employee', label: 'Employee', type: 'text' },
  { key: 'project', label: 'Project', type: 'text' },
  { key: 'task', label: 'Task', type: 'text' },
  { key: 'hours', label: 'Hours', type: 'number', align: 'right' },
  { key: 'rate', label: 'Rate', type: 'currency', align: 'right' },
  { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
  { 
    key: 'billable', 
    label: 'Billable', 
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    badgeVariant: (value) => value === 'yes' ? 'default' : 'secondary',
  },
];

export default function TimeEntriesPage() {
  const totalHours = initialEntries.reduce((sum, t) => sum + t.hours, 0);
  const billableAmount = initialEntries.filter(t => t.billable === 'yes').reduce((sum, t) => sum + t.amount, 0);

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
              <div className="text-2xl font-bold">{initialEntries.length}</div>
            </CardContent>
          </Card>
        </div>

        <AccountingDataTable
          title="Time Entries"
          icon={Clock}
          data={initialEntries}
          columns={columns}
          addButtonLabel="Log Time"
          searchPlaceholder="Search entries..."
        />
      </div>
    </AccountingLayout>
  );
}
