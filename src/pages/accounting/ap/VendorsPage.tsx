import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Building2 } from 'lucide-react';

const vendors = [
  { id: 'V-001', name: 'Office Supplies Co', contact: 'John Smith', email: 'john@officesupplies.com', balance: 2500, status: 'active' },
  { id: 'V-002', name: 'Tech Equipment Ltd', contact: 'Jane Doe', email: 'jane@techequip.com', balance: 15000, status: 'active' },
  { id: 'V-003', name: 'Utility Services', contact: 'Bob Wilson', email: 'bob@utilities.com', balance: 1200, status: 'active' },
  { id: 'V-004', name: 'Marketing Agency', contact: 'Alice Brown', email: 'alice@marketing.com', balance: 8000, status: 'active' },
  { id: 'V-005', name: 'Cloud Services Inc', contact: 'Mike Johnson', email: 'mike@cloudservices.com', balance: 3500, status: 'inactive' },
];

export default function VendorsPage() {
  return (
    <AccountingLayout title="Vendors">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search vendors..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vendor
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vendor ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Balance Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendors.map((vendor) => (
                  <TableRow key={vendor.id}>
                    <TableCell className="font-medium">{vendor.id}</TableCell>
                    <TableCell>{vendor.name}</TableCell>
                    <TableCell>{vendor.contact}</TableCell>
                    <TableCell>{vendor.email}</TableCell>
                    <TableCell className="text-right">${vendor.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                        {vendor.status}
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
