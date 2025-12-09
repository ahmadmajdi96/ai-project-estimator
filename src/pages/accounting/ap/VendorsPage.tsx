import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Building2 } from 'lucide-react';

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  balance: number;
  status: string;
}

const initialVendors: Vendor[] = [
  { id: 'V-001', name: 'Office Supplies Co', contact: 'John Smith', email: 'john@officesupplies.com', phone: '555-0201', balance: 2500, status: 'active' },
  { id: 'V-002', name: 'Tech Equipment Ltd', contact: 'Jane Doe', email: 'jane@techequip.com', phone: '555-0202', balance: 15000, status: 'active' },
  { id: 'V-003', name: 'Utility Services', contact: 'Bob Wilson', email: 'bob@utilities.com', phone: '555-0203', balance: 1200, status: 'active' },
  { id: 'V-004', name: 'Marketing Agency', contact: 'Alice Brown', email: 'alice@marketing.com', phone: '555-0204', balance: 8000, status: 'active' },
  { id: 'V-005', name: 'Cloud Services Inc', contact: 'Mike Johnson', email: 'mike@cloudservices.com', phone: '555-0205', balance: 3500, status: 'inactive' },
];

const columns: Column<Vendor>[] = [
  { key: 'id', label: 'Vendor ID', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'contact', label: 'Contact', type: 'text' },
  { key: 'email', label: 'Email', type: 'text' },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'balance', label: 'Balance Due', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
    ],
    badgeVariant: (value) => value === 'active' ? 'default' : 'secondary',
  },
];

export default function VendorsPage() {
  return (
    <AccountingLayout title="Vendors">
      <AccountingDataTable
        title="Vendors"
        icon={Building2}
        data={initialVendors}
        columns={columns}
        addButtonLabel="Add Vendor"
        searchPlaceholder="Search vendors..."
      />
    </AccountingLayout>
  );
}
