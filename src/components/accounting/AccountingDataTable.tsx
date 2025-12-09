import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, Filter, MoreHorizontal, Pencil, Trash2, X, Download, Eye, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LucideIcon } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  label: string;
  type?: 'text' | 'number' | 'date' | 'currency' | 'badge' | 'select';
  options?: { value: string; label: string }[];
  badgeVariant?: (value: any) => 'default' | 'secondary' | 'destructive' | 'outline';
  render?: (row: T) => React.ReactNode;
  editable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface FilterConfig {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface AccountingDataTableProps<T extends { id: string }> {
  title?: string;
  icon?: LucideIcon;
  data: T[];
  columns: Column<T>[];
  filters?: FilterConfig[];
  onAdd?: (item: Partial<T>) => void;
  onEdit?: (item: T) => void;
  onDelete?: (id: string) => void;
  onView?: (item: T) => void;
  addButtonLabel?: string;
  searchPlaceholder?: string;
  isLoading?: boolean;
}

export function AccountingDataTable<T extends { id: string }>({
  title,
  icon: Icon,
  data,
  columns,
  filters = [],
  onAdd,
  onEdit,
  onDelete,
  onView,
  addButtonLabel = 'Add New',
  searchPlaceholder = 'Search...',
  isLoading = false,
}: AccountingDataTableProps<T>) {
  const [items, setItems] = useState<T[]>(data);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColumn, setFilterColumn] = useState<string>('all');
  const [filterValue, setFilterValue] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState<Partial<T>>({});

  // Sync items with data prop
  useEffect(() => {
    setItems(data);
  }, [data]);

  const filterableColumns = columns.filter(col => col.filterable !== false && col.type !== 'currency');

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        columns.some(col => {
          const value = getValue(item, col.key as string);
          return value?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });

      // Column filter
      let matchesFilter = true;
      if (filterColumn !== 'all' && filterValue !== '') {
        const itemValue = getValue(item, filterColumn);
        matchesFilter = itemValue?.toString().toLowerCase() === filterValue.toLowerCase();
      }

      return matchesSearch && matchesFilter;
    });
  }, [items, searchQuery, filterColumn, filterValue, columns]);

  const handleAdd = () => {
    const id = `NEW-${Date.now()}`;
    const itemToAdd = { ...newItem, id } as T;
    setItems([itemToAdd, ...items]);
    onAdd?.(newItem);
    setNewItem({});
    setIsAddDialogOpen(false);
    toast.success('Item added successfully');
  };

  const handleEdit = () => {
    if (!editingItem) return;
    setItems(items.map(item => item.id === editingItem.id ? editingItem : item));
    onEdit?.(editingItem);
    setEditingItem(null);
    setIsEditDialogOpen(false);
    toast.success('Item updated successfully');
  };

  const handleDelete = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    onDelete?.(id);
    setDeleteId(null);
    toast.success('Item deleted successfully');
  };

  const handleExport = () => {
    const csv = [
      columns.map(c => c.label).join(','),
      ...filteredItems.map(item => 
        columns.map(col => getValue(item, col.key as string) ?? '').join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'data').toLowerCase().replace(/\s/g, '-')}-export.csv`;
    a.click();
    toast.success('Data exported successfully');
  };

  const getValue = (item: any, key: string) => {
    return key.split('.').reduce((obj, k) => obj?.[k], item);
  };

  const renderCell = (item: T, col: Column<T>) => {
    if (col.render) return col.render(item);
    
    const value = getValue(item, col.key as string);
    
    switch (col.type) {
      case 'currency':
        return (
          <span className={Number(value) >= 0 ? 'text-foreground' : 'text-red-500'}>
            {Number(value) >= 0 ? '' : '-'}${Math.abs(Number(value)).toLocaleString()}
          </span>
        );
      case 'badge':
        return (
          <Badge variant={col.badgeVariant?.(value) || 'default'}>
            {value}
          </Badge>
        );
      case 'date':
        return value ? new Date(value).toLocaleDateString() : '-';
      default:
        return value ?? '-';
    }
  };

  const renderEditField = (col: Column<T>, value: any, onChange: (val: any) => void) => {
    if (col.type === 'select' && col.options) {
      return (
        <Select value={value || ''} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border shadow-md z-50">
            {col.options.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    
    return (
      <Input
        type={col.type === 'number' || col.type === 'currency' ? 'number' : col.type === 'date' ? 'date' : 'text'}
        value={value || ''}
        onChange={(e) => onChange(col.type === 'number' || col.type === 'currency' ? Number(e.target.value) : e.target.value)}
      />
    );
  };

  const hasActions = onEdit || onDelete || onView;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder={searchPlaceholder}
              className="pl-9 w-64" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {(filterColumn !== 'all' || filterValue) && (
              <Badge variant="secondary" className="ml-2 h-5 px-1">1</Badge>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        {onAdd && (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {addButtonLabel}
          </Button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Filter by</Label>
              <Select value={filterColumn} onValueChange={(v) => { setFilterColumn(v); setFilterValue(''); }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border shadow-md z-50">
                  <SelectItem value="all">All columns</SelectItem>
                  {filters.length > 0 ? (
                    filters.map(f => (
                      <SelectItem key={f.key} value={f.key}>{f.label}</SelectItem>
                    ))
                  ) : (
                    filterableColumns.map(col => (
                      <SelectItem key={col.key as string} value={col.key as string}>
                        {col.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            {filterColumn !== 'all' && (
              <div className="space-y-1">
                <Label className="text-xs">Value</Label>
                {filters.find(f => f.key === filterColumn)?.options ? (
                  <Select value={filterValue} onValueChange={setFilterValue}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Select value" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border shadow-md z-50">
                      {filters.find(f => f.key === filterColumn)?.options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input 
                    placeholder="Filter value..."
                    className="w-48"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                )}
              </div>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => { setFilterColumn('all'); setFilterValue(''); }}
            >
              Clear filters
            </Button>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        {title && (
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2 text-base">
              {Icon && <Icon className="h-5 w-5" />}
              {title}
              <Badge variant="secondary" className="ml-2">{filteredItems.length}</Badge>
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className={title ? "p-0" : "p-0 pt-4"}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map(col => (
                    <TableHead 
                      key={col.key as string}
                      className={col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}
                    >
                      {col.label}
                    </TableHead>
                  ))}
                  {hasActions && <TableHead className="w-12">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                      No data found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className={onView ? "cursor-pointer hover:bg-muted/50" : ""} onClick={() => onView?.(item)}>
                      {columns.map(col => (
                        <TableCell 
                          key={col.key as string}
                          className={`${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''} ${col.key === 'id' || col.key === columns[0].key ? 'font-medium' : ''}`}
                        >
                          {renderCell(item, col)}
                        </TableCell>
                      ))}
                      {hasActions && (
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border shadow-md z-50">
                              {onView && (
                                <DropdownMenuItem onClick={() => onView(item)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </DropdownMenuItem>
                              )}
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(item)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              {onDelete && (
                                <DropdownMenuItem 
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => setDeleteId(item.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      {onAdd && (
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add {(title || 'Item').replace(/s$/, '')}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {columns.filter(col => col.editable !== false && col.key !== 'id').map(col => (
                <div key={col.key as string} className="space-y-1">
                  <Label>{col.label}</Label>
                  {renderEditField(col, (newItem as any)[col.key], (val) => setNewItem({ ...newItem, [col.key]: val }))}
                </div>
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAdd}>Add</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {(title || 'Item').replace(/s$/, '')}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              {columns.filter(col => col.editable !== false).map(col => (
                <div key={col.key as string} className="space-y-1">
                  <Label>{col.label}</Label>
                  {col.key === 'id' ? (
                    <Input value={(editingItem as any)[col.key] || ''} disabled />
                  ) : (
                    renderEditField(col, (editingItem as any)[col.key], (val) => setEditingItem({ ...editingItem, [col.key]: val }))
                  )}
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
