import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Receipt } from 'lucide-react';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  submittedBy: string;
  status: string;
}

const initialExpenses: Expense[] = [
  { id: 'EXP-001', date: '2024-01-15', description: 'Office Supplies', category: 'Supplies', amount: 250, submittedBy: 'John Smith', status: 'approved' },
  { id: 'EXP-002', date: '2024-01-14', description: 'Client Lunch', category: 'Meals', amount: 85, submittedBy: 'Jane Doe', status: 'pending' },
  { id: 'EXP-003', date: '2024-01-13', description: 'Software Subscription', category: 'Software', amount: 500, submittedBy: 'Bob Wilson', status: 'approved' },
  { id: 'EXP-004', date: '2024-01-12', description: 'Travel - Flight', category: 'Travel', amount: 450, submittedBy: 'Alice Brown', status: 'pending' },
  { id: 'EXP-005', date: '2024-01-11', description: 'Marketing Materials', category: 'Marketing', amount: 1200, submittedBy: 'Mike Johnson', status: 'rejected' },
];

const columns: Column<Expense>[] = [
  { key: 'id', label: 'Expense ID', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'description', label: 'Description', type: 'text' },
  { 
    key: 'category', 
    label: 'Category', 
    type: 'select',
    options: [
      { value: 'Supplies', label: 'Supplies' },
      { value: 'Meals', label: 'Meals' },
      { value: 'Software', label: 'Software' },
      { value: 'Travel', label: 'Travel' },
      { value: 'Marketing', label: 'Marketing' },
      { value: 'Utilities', label: 'Utilities' },
      { value: 'Other', label: 'Other' },
    ],
  },
  { key: 'submittedBy', label: 'Submitted By', type: 'text' },
  { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'pending', label: 'Pending' },
      { value: 'approved', label: 'Approved' },
      { value: 'rejected', label: 'Rejected' },
    ],
    badgeVariant: (value) => value === 'approved' ? 'default' : value === 'rejected' ? 'destructive' : 'secondary',
  },
];

export default function ExpensesPage() {
  return (
    <AccountingLayout title="Expenses">
      <AccountingDataTable
        title="Expenses"
        icon={Receipt}
        data={initialExpenses}
        columns={columns}
        addButtonLabel="Add Expense"
        searchPlaceholder="Search expenses..."
      />
    </AccountingLayout>
  );
}
