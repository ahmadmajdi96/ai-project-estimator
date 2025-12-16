import { useState, useRef, useEffect } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building, Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { useDepartments, useAddDepartment, useUpdateDepartment, useDeleteDepartment, Department } from '@/hooks/useDepartments';
import { useEmployees } from '@/hooks/useEmployees';
import { toast } from 'sonner';

interface FormData {
  name: string;
  description: string;
  budget: string;
  color: string;
  parent_department_id: string;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  budget: '',
  color: '#3b82f6',
  parent_department_id: '',
};

export default function ManagementDepartmentsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const formRef = useRef<FormData>(initialFormData);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const { data: departments, isLoading } = useDepartments();
  const { data: employees } = useEmployees();
  const addDepartment = useAddDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const getEmployeeCount = (deptId: string) => {
    return employees?.filter(e => e.department_id === deptId).length || 0;
  };

  const resetForm = () => {
    formRef.current = initialFormData;
    setFormData(initialFormData);
  };

  useEffect(() => {
    if (editingDepartment) {
      const data = {
        name: editingDepartment.name,
        description: editingDepartment.description || '',
        budget: editingDepartment.budget?.toString() || '',
        color: editingDepartment.color || '#3b82f6',
        parent_department_id: editingDepartment.parent_department_id || '',
      };
      formRef.current = data;
      setFormData(data);
    }
  }, [editingDepartment]);

  const updateField = (field: keyof FormData, value: string) => {
    formRef.current = { ...formRef.current, [field]: value };
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdd = () => {
    const data = formRef.current;
    if (!data.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    addDepartment.mutate({
      name: data.name.trim(),
      description: data.description.trim() || undefined,
      budget: data.budget ? parseFloat(data.budget) : undefined,
      color: data.color,
      parent_department_id: data.parent_department_id || undefined,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        resetForm();
      }
    });
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
  };

  const handleUpdate = () => {
    if (!editingDepartment) return;
    const data = formRef.current;
    
    if (!data.name.trim()) {
      toast.error('Department name is required');
      return;
    }

    updateDepartment.mutate({
      id: editingDepartment.id,
      name: data.name.trim(),
      description: data.description.trim() || null,
      budget: data.budget ? parseFloat(data.budget) : null,
      color: data.color,
      parent_department_id: data.parent_department_id || null,
    }, {
      onSuccess: () => {
        setEditingDepartment(null);
        resetForm();
      }
    });
  };

  const DepartmentForm = ({ onSubmit, submitLabel, isPending }: { onSubmit: () => void; submitLabel: string; isPending: boolean }) => (
    <div className="space-y-4">
      <div>
        <Label>Name *</Label>
        <Input 
          placeholder="e.g., Engineering"
          defaultValue={formData.name}
          onBlur={(e) => updateField('name', e.target.value)}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea 
          placeholder="Department description..."
          defaultValue={formData.description}
          onBlur={(e) => updateField('description', e.target.value)}
        />
      </div>
      <div>
        <Label>Budget</Label>
        <Input 
          type="number"
          placeholder="e.g., 100000"
          defaultValue={formData.budget}
          onBlur={(e) => updateField('budget', e.target.value)}
        />
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex items-center gap-2">
          <Input 
            type="color"
            value={formData.color}
            onChange={(e) => updateField('color', e.target.value)}
            className="w-16 h-10 p-1"
          />
          <Input 
            value={formData.color}
            onChange={(e) => updateField('color', e.target.value)}
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <Label>Parent Department</Label>
        <Select 
          value={formData.parent_department_id || "__none__"} 
          onValueChange={(v) => updateField('parent_department_id', v === "__none__" ? "" : v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="None (Top Level)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">None (Top Level)</SelectItem>
            {departments?.filter(d => d.id !== editingDepartment?.id).map(dept => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={onSubmit} className="w-full" disabled={isPending}>
        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </div>
  );

  return (
    <ManagementLayout title="Departments">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Departments</h1>
            <p className="text-muted-foreground">Manage organizational departments</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsAddOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Department
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Department</DialogTitle>
              </DialogHeader>
              <DepartmentForm 
                onSubmit={handleAdd} 
                submitLabel="Add Department" 
                isPending={addDepartment.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Loading departments...
            </div>
          ) : departments?.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              No departments found. Create your first department.
            </div>
          ) : (
            departments?.map((dept) => (
              <Card key={dept.id} className="relative overflow-hidden">
                <div 
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ backgroundColor: dept.color || '#3b82f6' }}
                />
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${dept.color}20` }}
                      >
                        <Building className="h-4 w-4" style={{ color: dept.color }} />
                      </div>
                      <CardTitle className="text-lg">{dept.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEdit(dept)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteDepartment.mutate(dept.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {dept.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {getEmployeeCount(dept.id)} employees
                    </Badge>
                    {dept.budget && (
                      <span className="text-sm font-medium">
                        ${dept.budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={!!editingDepartment} onOpenChange={(open) => {
          if (!open) {
            setEditingDepartment(null);
            resetForm();
          }
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Department</DialogTitle>
            </DialogHeader>
            <DepartmentForm 
              onSubmit={handleUpdate} 
              submitLabel="Update Department" 
              isPending={updateDepartment.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </ManagementLayout>
  );
}
