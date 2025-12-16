import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { X, Plus, Loader2 } from 'lucide-react';
import { useDepartments } from '@/hooks/useDepartments';
import { useAddEmployee, useUpdateEmployee, Employee } from '@/hooks/useEmployees';
import { toast } from 'sonner';

interface ExpandedEmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  mode: 'add' | 'edit';
}

interface FormData {
  position: string;
  employee_code: string;
  department_id: string;
  status: 'active' | 'inactive' | 'on_leave';
  salary: string;
  hire_date: string;
  skills: string[];
  email: string;
  phone: string;
  address: string;
  emergency_contact: string;
  notes: string;
}

const initialFormData: FormData = {
  position: '',
  employee_code: '',
  department_id: '',
  status: 'active',
  salary: '',
  hire_date: new Date().toISOString().split('T')[0],
  skills: [],
  email: '',
  phone: '',
  address: '',
  emergency_contact: '',
  notes: '',
};

export function ExpandedEmployeeForm({ open, onOpenChange, employee, mode }: ExpandedEmployeeFormProps) {
  const formRef = useRef<FormData>(initialFormData);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [newSkill, setNewSkill] = useState('');
  
  const { data: departments = [] } = useDepartments();
  const addEmployee = useAddEmployee();
  const updateEmployee = useUpdateEmployee();

  useEffect(() => {
    if (employee && mode === 'edit') {
      const data = {
        position: employee.position || '',
        employee_code: employee.employee_code || '',
        department_id: employee.department_id || '',
        status: employee.status,
        salary: employee.salary?.toString() || '',
        hire_date: employee.hire_date.split('T')[0],
        skills: employee.skills || [],
        email: '',
        phone: '',
        address: '',
        emergency_contact: '',
        notes: '',
      };
      formRef.current = data;
      setFormData(data);
    } else {
      formRef.current = initialFormData;
      setFormData(initialFormData);
    }
  }, [employee, mode, open]);

  const updateField = (field: keyof FormData, value: string | string[]) => {
    formRef.current = { ...formRef.current, [field]: value };
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      const newSkills = [...formData.skills, newSkill.trim()];
      updateField('skills', newSkills);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    updateField('skills', formData.skills.filter(s => s !== skill));
  };

  const handleSubmit = () => {
    const data = formRef.current;
    
    if (!data.position.trim()) {
      toast.error('Position is required');
      return;
    }

    const payload = {
      position: data.position.trim(),
      employee_code: data.employee_code.trim() || undefined,
      department_id: data.department_id || undefined,
      status: data.status,
      salary: data.salary ? parseFloat(data.salary) : undefined,
      hire_date: data.hire_date,
      skills: data.skills.length > 0 ? data.skills : undefined,
    };

    if (mode === 'edit' && employee) {
      updateEmployee.mutate({ id: employee.id, ...payload }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      addEmployee.mutate(payload, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isPending = addEmployee.isPending || updateEmployee.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-4">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    placeholder="e.g., Software Engineer"
                    defaultValue={formData.position}
                    onBlur={(e) => updateField('position', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employee_code">Employee Code</Label>
                  <Input
                    id="employee_code"
                    placeholder="e.g., EMP001"
                    defaultValue={formData.employee_code}
                    onBlur={(e) => updateField('employee_code', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={formData.department_id || '__none__'}
                    onValueChange={(v) => updateField('department_id', v === '__none__' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">No Department</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => updateField('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Employment Details */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                Employment Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hire_date">Hire Date</Label>
                  <Input
                    id="hire_date"
                    type="date"
                    defaultValue={formData.hire_date}
                    onBlur={(e) => updateField('hire_date', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary">Annual Salary ($)</Label>
                  <Input
                    id="salary"
                    type="number"
                    placeholder="e.g., 75000"
                    defaultValue={formData.salary}
                    onBlur={(e) => updateField('salary', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Skills */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                Skills & Expertise
              </h3>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="gap-1 pr-1">
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 hover:bg-muted rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Contact Information */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                Contact Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="employee@company.com"
                    defaultValue={formData.email}
                    onBlur={(e) => updateField('email', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    defaultValue={formData.phone}
                    onBlur={(e) => updateField('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Full address..."
                  rows={2}
                  defaultValue={formData.address}
                  onBlur={(e) => updateField('address', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Notes */}
            <div>
              <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-wide">
                Additional Notes
              </h3>
              <Textarea
                placeholder="Any additional information about this employee..."
                rows={3}
                defaultValue={formData.notes}
                onBlur={(e) => updateField('notes', e.target.value)}
              />
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {mode === 'edit' ? 'Update Employee' : 'Add Employee'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
