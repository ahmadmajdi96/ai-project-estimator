import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { CreditCard } from 'lucide-react';

interface Payment {
  id: string;
  date: string;
  customer: string;
  invoice: string;
  method: string;
  amount: number;
}

const initialPayments: Payment[] = [
  { id: 'PAY-001', date: '2024-01-15', customer: 'ABC Corp', invoice: 'INV-001', method: 'Bank Transfer', amount: 5000 },
  { id: 'PAY-002', date: '2024-01-14', customer: 'XYZ Ltd', invoice: 'INV-002', method: 'Credit Card', amount: 3500 },
  { id: 'PAY-003', date: '2024-01-13', customer: 'Tech Inc', invoice: 'INV-003', method: 'Check', amount: 12000 },
  { id: 'PAY-004', date: '2024-01-12', customer: 'Global Co', invoice: 'INV-004', method: 'Bank Transfer', amount: 8500 },
  { id: 'PAY-005', date: '2024-01-11', customer: 'Local Shop', invoice: 'INV-005', method: 'Cash', amount: 1500 },
];

const columns: Column<Payment>[] = [
  { key: 'id', label: 'Payment ID', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'customer', label: 'Customer', type: 'text' },
  { key: 'invoice', label: 'Invoice', type: 'text' },
  { key: 'method', label: 'Method', type: 'select', options: [
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Credit Card', label: 'Credit Card' },
    { value: 'Check', label: 'Check' },
    { value: 'Cash', label: 'Cash' },
    { value: 'ACH', label: 'ACH' },
  ]},
  { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
];

export default function ARPaymentsPage() {
  return (
    <AccountingLayout title="AR Payments">
      <AccountingDataTable
        title="Customer Payments"
        icon={CreditCard}
        data={initialPayments}
        columns={columns}
        addButtonLabel="Record Payment"
        searchPlaceholder="Search payments..."
      />
    </AccountingLayout>
  );
}
