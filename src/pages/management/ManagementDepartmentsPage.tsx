import { useState } from 'react';
import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Building, Edit, Trash2, Users } from 'lucide-react';
import { useDepartments, useAddDepartment, useUpdateDepartment, useDeleteDepartment, Department } from '@/hooks/useDepartments';
import { useEmployees } from '@/hooks/useEmployees';

export default function ManagementDepartmentsPage() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    color: '#3b82f6',
    parent_department_id: '',
  });

  const { data: departments, isLoading } = useDepartments();
  const { data: employees } = useEmployees();
  const addDepartment = useAddDepartment();
  const updateDepartment = useUpdateDepartment();
  const deleteDepartment = useDeleteDepartment();

  const getEmployeeCount = (deptId: string) => {
    return employees?.filter(e => e.department_id === deptId).length || 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      budget: '',
      color: '#3b82f6',
      parent_department_id: '',
    });
  };

  const handleAdd = () => {
    addDepartment.mutate({
      name: formData.name,
      description: formData.description || undefined,
      budget: formData.budget ? parseFloat(formData.budget) : undefined,
      color: formData.color,
      parent_department_id: formData.parent_department_id || undefined,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        resetForm();
      }
    });
  };

  const handleEdit = (dept: Department) => {
    setEditingDepartment(dept);
    setFormData({
      name: dept.name,
      description: dept.description || '',
      budget: dept.budget?.toString() || '',
      color: dept.color || '#3b82f6',
      parent_department_id: dept.parent_department_id || '',
    });
  };

  const handleUpdate = () => {
    if (!editingDepartment) return;
    updateDepartment.mutate({
      id: editingDepartment.id,
      name: formData.name,
      description: formData.description || null,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      color: formData.color,
      parent_department_id: formData.parent_department_id || null,
    }, {
      onSuccess: () => {
        setEditingDepartment(null);
        resetForm();
      }
    });
  };

  const DepartmentForm = ({ onSubmit, submitLabel }: { onSubmit: () => void; submitLabel: string }) => (
    <div className="space-y-4">
      <div>
        <Label>Name *</Label>
        <Input 
          placeholder="e.g., Engineering"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea 
          placeholder="Department description..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>
      <div>
        <Label>Budget</Label>
        <Input 
          type="number"
          placeholder="e.g., 100000"
          value={formData.budget}
          onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
        />
      </div>
      <div>
        <Label>Color</Label>
        <div className="flex items-center gap-2">
          <Input 
            type="color"
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="w-16 h-10 p-1"
          />
          <Input 
            value={formData.color}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
            className="flex-1"
          />
        </div>
      </div>
      <div>
        <Label>Parent Department</Label>
        <Select 
          value={formData.parent_department_id || "__none__"} 
          onValueChange={(v) => setFormData(prev => ({ ...prev, parent_department_id: v === "__none__" ? "" : v }))}
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
      <Button onClick={onSubmit} className="w-full" disabled={!formData.name}>
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
              <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
                  <DepartmentForm onSubmit={handleAdd} submitLabel="Add Department" />
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
            <Dialog open={!!editingDepartment} onOpenChange={(open) => !open && setEditingDepartment(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Department</DialogTitle>
                </DialogHeader>
                <DepartmentForm onSubmit={handleUpdate} submitLabel="Update Department" />
              </DialogContent>
            </Dialog>
      </div>
    </ManagementLayout>
  );
}
