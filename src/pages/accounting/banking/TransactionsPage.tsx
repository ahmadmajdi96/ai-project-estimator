import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { CreditCard } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  account: string;
  amount: number;
  reconciled: string;
}

const initialTransactions: Transaction[] = [
  { id: 'TXN-001', date: '2024-01-15', description: 'Client Payment - ABC Corp', account: 'Main Operating', amount: 5000, reconciled: 'yes' },
  { id: 'TXN-002', date: '2024-01-14', description: 'Office Rent Payment', account: 'Main Operating', amount: -5000, reconciled: 'yes' },
  { id: 'TXN-003', date: '2024-01-13', description: 'Payroll Disbursement', account: 'Payroll Account', amount: -45000, reconciled: 'no' },
  { id: 'TXN-004', date: '2024-01-12', description: 'Vendor Payment - Tech Equipment', account: 'Main Operating', amount: -15000, reconciled: 'yes' },
  { id: 'TXN-005', date: '2024-01-11', description: 'Client Payment - XYZ Ltd', account: 'Main Operating', amount: 3500, reconciled: 'no' },
  { id: 'TXN-006', date: '2024-01-10', description: 'Transfer to Savings', account: 'Main Operating', amount: -10000, reconciled: 'yes' },
];

const columns: Column<Transaction>[] = [
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'description', label: 'Description', type: 'text' },
  { key: 'account', label: 'Account', type: 'select', options: [
    { value: 'Main Operating', label: 'Main Operating' },
    { value: 'Payroll Account', label: 'Payroll Account' },
    { value: 'Savings Reserve', label: 'Savings Reserve' },
  ]},
  { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
  { 
    key: 'reconciled', 
    label: 'Reconciled', 
    type: 'select',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
    badgeVariant: (value) => value === 'yes' ? 'default' : 'secondary',
  },
];

export default function TransactionsPage() {
  return (
    <AccountingLayout title="Bank Transactions">
      <AccountingDataTable
        title="Transactions"
        icon={CreditCard}
        data={initialTransactions}
        columns={columns}
        addButtonLabel="Add Transaction"
        searchPlaceholder="Search transactions..."
      />
    </AccountingLayout>
  );
}
