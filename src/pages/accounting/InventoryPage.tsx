import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  status: string;
}

const initialInventory: InventoryItem[] = [
  { id: '1', sku: 'SKU-001', name: 'Widget A', category: 'Widgets', quantity: 500, unitCost: 25, totalValue: 12500, status: 'in-stock' },
  { id: '2', sku: 'SKU-002', name: 'Gadget B', category: 'Gadgets', quantity: 75, unitCost: 150, totalValue: 11250, status: 'low-stock' },
  { id: '3', sku: 'SKU-003', name: 'Component C', category: 'Components', quantity: 1000, unitCost: 10, totalValue: 10000, status: 'in-stock' },
  { id: '4', sku: 'SKU-004', name: 'Part D', category: 'Parts', quantity: 25, unitCost: 75, totalValue: 1875, status: 'low-stock' },
  { id: '5', sku: 'SKU-005', name: 'Assembly E', category: 'Assemblies', quantity: 0, unitCost: 500, totalValue: 0, status: 'out-of-stock' },
];

const columns: Column<InventoryItem>[] = [
  { key: 'sku', label: 'SKU', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'select', options: [
    { value: 'Widgets', label: 'Widgets' },
    { value: 'Gadgets', label: 'Gadgets' },
    { value: 'Components', label: 'Components' },
    { value: 'Parts', label: 'Parts' },
    { value: 'Assemblies', label: 'Assemblies' },
  ]},
  { key: 'quantity', label: 'Quantity', type: 'number', align: 'right' },
  { key: 'unitCost', label: 'Unit Cost', type: 'currency', align: 'right' },
  { key: 'totalValue', label: 'Total Value', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'in-stock', label: 'In Stock' },
      { value: 'low-stock', label: 'Low Stock' },
      { value: 'out-of-stock', label: 'Out of Stock' },
    ],
    badgeVariant: (value) => {
      if (value === 'in-stock') return 'default';
      if (value === 'out-of-stock') return 'destructive';
      return 'secondary';
    },
  },
];

export default function InventoryPage() {
  const totalValue = initialInventory.reduce((sum, i) => sum + i.totalValue, 0);
  const totalItems = initialInventory.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AccountingLayout title="Inventory">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Items</div>
              <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold text-primary">${totalValue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Low Stock Items</div>
              <div className="text-2xl font-bold text-yellow-600">
                {initialInventory.filter(i => i.status !== 'in-stock').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <AccountingDataTable
          title="Inventory Items"
          icon={Package}
          data={initialInventory}
          columns={columns}
          addButtonLabel="Add Item"
          searchPlaceholder="Search inventory..."
        />
      </div>
    </AccountingLayout>
  );
}
