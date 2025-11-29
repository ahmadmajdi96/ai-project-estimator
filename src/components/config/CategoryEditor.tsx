import { useState } from 'react';
import { useCategories, useAddCategory, useUpdateCategory, useDeleteCategory, Category } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit2, Trash2, Plus, Loader2, FolderOpen, Globe, FileText, Bot, ShoppingCart, Shield, Code, Image, BarChart3, Sparkles } from 'lucide-react';
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

const colors = [
  '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4', '#84cc16'
];

interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  color: string;
}

export function CategoryEditor() {
  const { data: categories, isLoading } = useCategories();
  const addCategory = useAddCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'Sparkles',
    color: '#3b82f6',
  });

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: 'Sparkles', color: '#3b82f6' });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || 'Sparkles',
      color: category.color || '#3b82f6',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...formData }, {
        onSuccess: () => { setIsDialogOpen(false); resetForm(); },
      });
    } else {
      addCategory.mutate(formData, {
        onSuccess: () => { setIsDialogOpen(false); resetForm(); },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Categories</h2>
          <p className="text-sm text-muted-foreground">Manage quote & estimator categories</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="sm">
              <Plus className="h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Category Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Marketing"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
                />
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

              <div className="space-y-2">
                <Label>Color</Label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        'w-8 h-8 rounded-lg border-2 transition-all',
                        formData.color === color ? 'border-foreground scale-110' : 'border-transparent'
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" variant="gradient" disabled={addCategory.isPending || updateCategory.isPending}>
                  {(addCategory.isPending || updateCategory.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {categories?.map((category) => {
          const IconComponent = icons.find((i) => i.name === category.icon)?.Icon || Sparkles;
          return (
            <div
              key={category.id}
              className="group flex items-center justify-between p-3 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="flex h-9 w-9 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${category.color}20`, color: category.color }}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(category)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => deleteCategory.mutate(category.id)}
                  disabled={deleteCategory.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          );
        })}

        {categories?.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No categories yet</p>
          </div>
        )}
      </div>
    </div>
  );
}