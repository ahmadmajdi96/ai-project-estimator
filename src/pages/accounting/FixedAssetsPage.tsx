import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Briefcase } from 'lucide-react';

interface FixedAsset {
  id: string;
  name: string;
  category: string;
  purchaseDate: string;
  cost: number;
  depreciation: number;
  bookValue: number;
  status: string;
}

const initialAssets: FixedAsset[] = [
  { id: 'FA-001', name: 'Office Building', category: 'Buildings', purchaseDate: '2020-01-15', cost: 500000, depreciation: 50000, bookValue: 450000, status: 'active' },
  { id: 'FA-002', name: 'Company Vehicles', category: 'Vehicles', purchaseDate: '2022-06-01', cost: 75000, depreciation: 25000, bookValue: 50000, status: 'active' },
  { id: 'FA-003', name: 'Office Furniture', category: 'Furniture', purchaseDate: '2021-03-15', cost: 25000, depreciation: 7500, bookValue: 17500, status: 'active' },
  { id: 'FA-004', name: 'Computer Equipment', category: 'Equipment', purchaseDate: '2023-01-10', cost: 50000, depreciation: 10000, bookValue: 40000, status: 'active' },
  { id: 'FA-005', name: 'Manufacturing Equipment', category: 'Machinery', purchaseDate: '2019-08-20', cost: 200000, depreciation: 80000, bookValue: 120000, status: 'active' },
];

const columns: Column<FixedAsset>[] = [
  { key: 'id', label: 'Asset ID', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'select', options: [
    { value: 'Buildings', label: 'Buildings' },
    { value: 'Vehicles', label: 'Vehicles' },
    { value: 'Furniture', label: 'Furniture' },
    { value: 'Equipment', label: 'Equipment' },
    { value: 'Machinery', label: 'Machinery' },
  ]},
  { key: 'purchaseDate', label: 'Purchase Date', type: 'date' },
  { key: 'cost', label: 'Cost', type: 'currency', align: 'right' },
  { key: 'depreciation', label: 'Depreciation', type: 'currency', align: 'right' },
  { key: 'bookValue', label: 'Book Value', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'disposed', label: 'Disposed' },
    ],
    badgeVariant: (value) => value === 'active' ? 'default' : 'secondary',
  },
];

export default function FixedAssetsPage() {
  return (
    <AccountingLayout title="Fixed Assets">
      <AccountingDataTable
        title="Fixed Assets"
        icon={Briefcase}
        data={initialAssets}
        columns={columns}
        addButtonLabel="Add Asset"
        searchPlaceholder="Search assets..."
      />
    </AccountingLayout>
  );
}
