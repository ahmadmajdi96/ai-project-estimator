import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useProducts, useAddProduct } from '@/hooks/useProducts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Package, DollarSign, Layers, TrendingUp } from 'lucide-react';

const PRODUCT_TYPES = [
  { value: 'product', label: 'Product' },
  { value: 'service', label: 'Service' },
  { value: 'subscription', label: 'Subscription' },
];

export default function ProductsPage() {
  const { data: products = [], isLoading } = useProducts();
  const addProduct = useAddProduct();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    type: 'product',
    base_price: 0,
    cost: 0,
  });

  const activeProducts = products.filter(p => p.is_active);
  const totalRevenuePotential = activeProducts.reduce((sum, p) => sum + (p.base_price || 0), 0);
  const avgMargin = activeProducts.length > 0
    ? activeProducts.reduce((sum, p) => sum + ((p.base_price - p.cost) / p.base_price * 100), 0) / activeProducts.length
    : 0;

  const handleSubmit = async () => {
    await addProduct.mutateAsync(formData as any);
    setDialogOpen(false);
    setFormData({ name: '', description: '', category: '', type: 'product', base_price: 0, cost: 0 });
  };

  return (
    <CRMLayout title="Products & Services">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Package className="h-4 w-4" />
              <span className="text-sm">Total Products</span>
            </div>
            <p className="text-2xl font-bold">{products.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Layers className="h-4 w-4" />
              <span className="text-sm">Active</span>
            </div>
            <p className="text-2xl font-bold text-emerald-500">{activeProducts.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Catalog Value</span>
            </div>
            <p className="text-2xl font-bold">${totalRevenuePotential.toLocaleString()}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Avg. Margin</span>
            </div>
            <p className="text-2xl font-bold">{avgMargin.toFixed(1)}%</p>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Button>
        </div>

        {/* Products Table */}
        <Card className="bg-card/50 border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(product => {
                const margin = product.base_price > 0 
                  ? ((product.base_price - product.cost) / product.base_price * 100).toFixed(1)
                  : '0';
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">{product.description}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{product.type}</Badge>
                    </TableCell>
                    <TableCell>{product.category || '-'}</TableCell>
                    <TableCell className="text-right font-medium">${product.base_price?.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-muted-foreground">${product.cost?.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <span className={Number(margin) > 30 ? 'text-emerald-500' : Number(margin) > 15 ? 'text-amber-500' : 'text-red-500'}>
                        {margin}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={product.is_active ? 'bg-emerald-500' : 'bg-slate-500'}>
                        {product.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product/Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Category</Label>
                <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g., Software, Consulting" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Base Price ($)</Label>
                <Input type="number" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Cost ($)</Label>
                <Input type="number" value={formData.cost} onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>
            <Button onClick={handleSubmit} className="w-full" disabled={addProduct.isPending}>
              Add Product
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
