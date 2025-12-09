import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Briefcase } from 'lucide-react';

const assets = [
  { id: 'FA-001', name: 'Office Building', category: 'Buildings', purchaseDate: '2020-01-15', cost: 500000, depreciation: 50000, bookValue: 450000, status: 'active' },
  { id: 'FA-002', name: 'Company Vehicles', category: 'Vehicles', purchaseDate: '2022-06-01', cost: 75000, depreciation: 25000, bookValue: 50000, status: 'active' },
  { id: 'FA-003', name: 'Office Furniture', category: 'Furniture', purchaseDate: '2021-03-15', cost: 25000, depreciation: 7500, bookValue: 17500, status: 'active' },
  { id: 'FA-004', name: 'Computer Equipment', category: 'Equipment', purchaseDate: '2023-01-10', cost: 50000, depreciation: 10000, bookValue: 40000, status: 'active' },
  { id: 'FA-005', name: 'Manufacturing Equipment', category: 'Machinery', purchaseDate: '2019-08-20', cost: 200000, depreciation: 80000, bookValue: 120000, status: 'active' },
];

export default function FixedAssetsPage() {
  const totalCost = assets.reduce((sum, a) => sum + a.cost, 0);
  const totalDepreciation = assets.reduce((sum, a) => sum + a.depreciation, 0);
  const totalBookValue = assets.reduce((sum, a) => sum + a.bookValue, 0);

  return (
    <AccountingLayout title="Fixed Assets">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Total Cost</div>
              <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Accumulated Depreciation</div>
              <div className="text-2xl font-bold text-red-600">-${totalDepreciation.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground">Net Book Value</div>
              <div className="text-2xl font-bold text-primary">${totalBookValue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assets..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Fixed Assets Register
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Purchase Date</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Depreciation</TableHead>
                  <TableHead className="text-right">Book Value</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.id}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.category}</Badge>
                    </TableCell>
                    <TableCell>{asset.purchaseDate}</TableCell>
                    <TableCell className="text-right">${asset.cost.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-red-600">-${asset.depreciation.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">${asset.bookValue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="default">{asset.status}</Badge>
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
