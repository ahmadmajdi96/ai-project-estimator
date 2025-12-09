import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Wallet } from 'lucide-react';

interface APPayment {
  id: string;
  date: string;
  vendor: string;
  bill: string;
  method: string;
  amount: number;
}

const initialPayments: APPayment[] = [
  { id: 'APAY-001', date: '2024-01-15', vendor: 'Office Supplies Co', bill: 'BILL-001', method: 'Bank Transfer', amount: 2500 },
  { id: 'APAY-002', date: '2024-01-14', vendor: 'Marketing Agency', bill: 'BILL-004', method: 'Check', amount: 8000 },
  { id: 'APAY-003', date: '2024-01-13', vendor: 'Cloud Services Inc', bill: 'BILL-005', method: 'ACH', amount: 3500 },
  { id: 'APAY-004', date: '2024-01-12', vendor: 'Utility Services', bill: 'BILL-003', method: 'Bank Transfer', amount: 1200 },
  { id: 'APAY-005', date: '2024-01-11', vendor: 'Tech Equipment Ltd', bill: 'BILL-002', method: 'Wire Transfer', amount: 5000 },
];

const columns: Column<APPayment>[] = [
  { key: 'id', label: 'Payment ID', type: 'text' },
  { key: 'date', label: 'Date', type: 'date' },
  { key: 'vendor', label: 'Vendor', type: 'text' },
  { key: 'bill', label: 'Bill #', type: 'text' },
  { key: 'method', label: 'Method', type: 'select', options: [
    { value: 'Bank Transfer', label: 'Bank Transfer' },
    { value: 'Check', label: 'Check' },
    { value: 'ACH', label: 'ACH' },
    { value: 'Wire Transfer', label: 'Wire Transfer' },
    { value: 'Credit Card', label: 'Credit Card' },
  ]},
  { key: 'amount', label: 'Amount', type: 'currency', align: 'right' },
];

export default function APPaymentsPage() {
  return (
    <AccountingLayout title="AP Payments">
      <AccountingDataTable
        title="Vendor Payments"
        icon={Wallet}
        data={initialPayments}
        columns={columns}
        addButtonLabel="Make Payment"
        searchPlaceholder="Search payments..."
      />
    </AccountingLayout>
  );
}
