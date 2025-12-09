import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { FileText } from 'lucide-react';

interface JournalEntry {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  status: string;
}

const initialEntries: JournalEntry[] = [
  { id: 'JE-001', date: '2024-01-15', description: 'Monthly rent payment', debit: 5000, credit: 5000, status: 'posted' },
  { id: 'JE-002', date: '2024-01-14', description: 'Office supplies purchase', debit: 250, credit: 250, status: 'posted' },
  { id: 'JE-003', date: '2024-01-13', description: 'Client payment received', debit: 15000, credit: 15000, status: 'posted' },
  { id: 'JE-004', date: '2024-01-12', description: 'Payroll disbursement', debit: 45000, credit: 45000, status: 'pending' },
  { id: 'JE-005', date: '2024-01-11', description: 'Utility bill payment', debit: 1200, credit: 1200, status: 'posted' },
];

const columns: Column<JournalEntry>[] = [
  { key: 'id', label: 'Entry ID', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'debit', label: 'Debit', type: 'currency', align: 'right' },
  { key: 'credit', label: 'Credit', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'posted', label: 'Posted' },
    ],
    badgeVariant: (value) => value === 'posted' ? 'default' : 'secondary',
  },
];

export default function JournalEntriesPage() {
  return (
    <AccountingLayout title="Journal Entries">
      <AccountingDataTable
        title="Journal Entries"
        icon={FileText}
        data={initialEntries}
        columns={columns}
        addButtonLabel="New Entry"
        searchPlaceholder="Search entries..."
      />
    </AccountingLayout>
  );
}
