import { useState } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { ComponentItem } from '@/types/calculator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Globe, FileText, Bot, ShoppingCart, Shield, Code, Image, BarChart3, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = [
  { name: 'Globe', Icon: Globe },
  { name: 'FileText', Icon: FileText },
  { name: 'Bot', Icon: Bot },
  { name: 'ShoppingCart', Icon: ShoppingCart },
  { name: 'Shield', Icon: Shield },
  { name: 'Code', Icon: Code },
  { name: 'Image', Icon: Image },
  { name: 'BarChart3', Icon: BarChart3 },
  { name: 'Sparkles', Icon: Sparkles },
];

const categories = ['Website', 'AI Services', 'Features', 'Backend', 'Design', 'Integrations'];

interface ComponentFormProps {
  component?: ComponentItem;
  onSave: (component: Omit<ComponentItem, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

function ComponentForm({ component, onSave, onClose }: ComponentFormProps) {
  const [formData, setFormData] = useState({
    name: component?.name || '',
    description: component?.description || '',
    category: component?.category || 'Website',
    baseCost: component?.baseCost || 0,
    basePrice: component?.basePrice || 0,
    isBase: component?.isBase || false,
    icon: component?.icon || 'Sparkles',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: component?.id,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Component Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Custom Dashboard"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the component..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData({ ...formData, category: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Icon</Label>
          <div className="flex flex-wrap gap-2">
            {icons.map(({ name, Icon }) => (
              <button
                key={name}
                type="button"
                onClick={() => setFormData({ ...formData, icon: name })}
                className={cn(
                  'p-2 rounded-lg border transition-all',
                  formData.icon === name
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="baseCost">Base Cost ($)</Label>
          <Input
            id="baseCost"
            type="number"
            min="0"
            value={formData.baseCost}
            onChange={(e) => setFormData({ ...formData, baseCost: Number(e.target.value) })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="basePrice">Base Price ($)</Label>
          <Input
            id="basePrice"
            type="number"
            min="0"
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isBase"
          checked={formData.isBase}
          onChange={(e) => setFormData({ ...formData, isBase: e.target.checked })}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <Label htmlFor="isBase" className="text-sm text-muted-foreground">
          Mark as base component (required in all quotes)
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" variant="gradient">
          {component ? 'Update' : 'Create'} Component
        </Button>
      </div>
    </form>
  );
}

export function ComponentEditor() {
  const { components, addComponent, updateComponent, deleteComponent } = useCalculatorStore();
  const [editingComponent, setEditingComponent] = useState<ComponentItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSave = (data: Omit<ComponentItem, 'id'> & { id?: string }) => {
    if (data.id) {
      updateComponent(data.id, data);
    } else {
      addComponent({
        ...data,
        id: Date.now().toString(),
      } as ComponentItem);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Components</h2>
          <p className="text-sm text-muted-foreground">Manage your pricing components</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="gradient"
              onClick={() => {
                setEditingComponent(null);
                setIsDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Component
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingComponent ? 'Edit Component' : 'New Component'}
              </DialogTitle>
            </DialogHeader>
            <ComponentForm
              component={editingComponent || undefined}
              onSave={handleSave}
              onClose={() => setIsDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {components.map((component) => {
          const IconComponent = icons.find((i) => i.name === component.icon)?.Icon || Sparkles;
          return (
            <div
              key={component.id}
              className="group flex items-center justify-between p-4 rounded-xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-soft transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-foreground">{component.name}</h3>
                    {component.isBase && (
                      <span className="text-xs bg-accent/20 text-accent-foreground px-2 py-0.5 rounded-full">
                        Base
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{component.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Cost / Price</p>
                  <p className="font-medium text-foreground">
                    ${component.baseCost.toLocaleString()} / ${component.basePrice.toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingComponent(component);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => deleteComponent(component.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
