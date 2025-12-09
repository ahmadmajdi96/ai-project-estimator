import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Package } from 'lucide-react';

const inventory = [
  { sku: 'SKU-001', name: 'Widget A', category: 'Widgets', quantity: 500, unitCost: 25, totalValue: 12500, reorderPoint: 100, status: 'in-stock' },
  { sku: 'SKU-002', name: 'Gadget B', category: 'Gadgets', quantity: 75, unitCost: 150, totalValue: 11250, reorderPoint: 50, status: 'low-stock' },
  { sku: 'SKU-003', name: 'Component C', category: 'Components', quantity: 1000, unitCost: 10, totalValue: 10000, reorderPoint: 200, status: 'in-stock' },
  { sku: 'SKU-004', name: 'Part D', category: 'Parts', quantity: 25, unitCost: 75, totalValue: 1875, reorderPoint: 50, status: 'low-stock' },
  { sku: 'SKU-005', name: 'Assembly E', category: 'Assemblies', quantity: 0, unitCost: 500, totalValue: 0, reorderPoint: 10, status: 'out-of-stock' },
];

export default function InventoryPage() {
  const totalValue = inventory.reduce((sum, i) => sum + i.totalValue, 0);
  const totalItems = inventory.reduce((sum, i) => sum + i.quantity, 0);

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
                {inventory.filter(i => i.status !== 'in-stock').length}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search inventory..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead className="text-right">Total Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.sku}>
                    <TableCell className="font-medium">{item.sku}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">${item.unitCost}</TableCell>
                    <TableCell className="text-right font-semibold">${item.totalValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={
                        item.status === 'in-stock' ? 'default' :
                        item.status === 'low-stock' ? 'secondary' : 'destructive'
                      }>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
