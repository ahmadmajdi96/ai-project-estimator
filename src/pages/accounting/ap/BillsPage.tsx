import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { FileText } from 'lucide-react';

interface Bill {
  id: string;
  vendor: string;
  date: string;
  dueDate: string;
  amount: number;
  status: string;
}

const initialBills: Bill[] = [
  { id: 'BILL-001', vendor: 'Office Supplies Co', date: '2024-01-15', dueDate: '2024-02-15', amount: 2500, status: 'pending' },
  { id: 'BILL-002', vendor: 'Tech Equipment Ltd', date: '2024-01-10', dueDate: '2024-02-10', amount: 15000, status: 'overdue' },
  { id: 'BILL-003', vendor: 'Utility Services', date: '2024-01-20', dueDate: '2024-02-20', amount: 1200, status: 'pending' },
  { id: 'BILL-004', vendor: 'Marketing Agency', date: '2024-01-05', dueDate: '2024-02-05', amount: 8000, status: 'paid' },
  { id: 'BILL-005', vendor: 'Cloud Services Inc', date: '2024-01-01', dueDate: '2024-02-01', amount: 3500, status: 'paid' },
];

const columns: Column<Bill>[] = [
  { key: 'id', label: 'Bill #', type: 'text' },
  { key: 'vendor', label: 'Vendor', type: 'text' },
  { key: 'date', label: 'Bill Date', type: 'date' },
  { key: 'dueDate', label: 'Due Date', type: 'date' },
  { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'pending', label: 'Pending' },
      { value: 'paid', label: 'Paid' },
      { value: 'overdue', label: 'Overdue' },
    ],
    badgeVariant: (value) => {
      if (value === 'paid') return 'default';
      if (value === 'overdue') return 'destructive';
      return 'secondary';
    },
  },
];

export default function BillsPage() {
  return (
    <AccountingLayout title="Bills">
      <AccountingDataTable
        title="Bills"
        icon={FileText}
        data={initialBills}
        columns={columns}
        addButtonLabel="Record Bill"
        searchPlaceholder="Search bills..."
      />
    </AccountingLayout>
  );
}
