import { useState } from "react";
import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { AccountingDataTable } from "@/components/accounting/AccountingDataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEquipmentTypes, useCreateEquipmentType, EquipmentType } from "@/hooks/useLogistics";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { useAccountingAuth } from "@/hooks/useAccountingAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function EquipmentPage() {
  const { company } = useAccountingAuth();
  const { data: equipment = [], isLoading } = useEquipmentTypes();
  const createEquipment = useCreateEquipmentType();
  const queryClient = useQueryClient();
  const [editingEquipment, setEditingEquipment] = useState<EquipmentType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updateEquipment = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<EquipmentType> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-types'] });
      toast.success('Equipment type updated');
    },
    onError: (error) => {
      toast.error('Failed to update: ' + error.message);
    },
  });

  const deleteEquipment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment_types').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-types'] });
      toast.success('Equipment type deleted');
    },
    onError: (error) => {
      toast.error('Failed to delete: ' + error.message);
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      name: '',
      code: '',
      description: '',
      max_weight_lbs: '',
      max_volume_cuft: '',
      is_active: true,
    },
  });

  const columns = [
    { key: "code", label: "Code", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
    { 
      key: "max_weight_lbs", 
      label: "Max Weight (lbs)", 
      sortable: true,
      render: (value: number | null) => value ? value.toLocaleString() : '-'
    },
    { 
      key: "max_volume_cuft", 
      label: "Max Volume (cu ft)", 
      sortable: true,
      render: (value: number | null) => value ? value.toLocaleString() : '-'
    },
    { 
      key: "is_active", 
      label: "Status",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "secondary"}>{value ? 'Active' : 'Inactive'}</Badge>
      )
    },
  ];

  const handleEdit = (eq: EquipmentType) => {
    setEditingEquipment(eq);
    reset({
      name: eq.name,
      code: eq.code,
      description: eq.description || '',
      max_weight_lbs: eq.max_weight_lbs?.toString() || '',
      max_volume_cuft: eq.max_volume_cuft?.toString() || '',
      is_active: eq.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (eq: EquipmentType) => {
    if (confirm(`Delete equipment type ${eq.name}?`)) {
      deleteEquipment.mutate(eq.id);
    }
  };

  const handleNew = () => {
    setEditingEquipment(null);
    reset({
      name: '',
      code: '',
      description: '',
      max_weight_lbs: '',
      max_volume_cuft: '',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      company_id: company?.id,
      name: data.name,
      code: data.code,
      description: data.description || null,
      max_weight_lbs: data.max_weight_lbs ? parseInt(data.max_weight_lbs) : null,
      max_volume_cuft: data.max_volume_cuft ? parseFloat(data.max_volume_cuft) : null,
      is_active: data.is_active,
    };

    if (editingEquipment) {
      await updateEquipment.mutateAsync({ id: editingEquipment.id, ...payload });
    } else {
      await createEquipment.mutateAsync(payload);
    }
    setIsDialogOpen(false);
  };

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Equipment Types</h1>
            <p className="text-muted-foreground">Manage trailer and equipment types</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment Type
          </Button>
        </div>

        <AccountingDataTable
          data={equipment}
          columns={columns}
          searchPlaceholder="Search equipment..."
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEquipment ? 'Edit Equipment Type' : 'New Equipment Type'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" {...register('code', { required: true })} placeholder="e.g., DRY_VAN" />
                </div>
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" {...register('name', { required: true })} placeholder="e.g., Dry Van" />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} rows={2} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="max_weight_lbs">Max Weight (lbs)</Label>
                  <Input id="max_weight_lbs" type="number" {...register('max_weight_lbs')} />
                </div>
                <div>
                  <Label htmlFor="max_volume_cuft">Max Volume (cu ft)</Label>
                  <Input id="max_volume_cuft" type="number" step="0.01" {...register('max_volume_cuft')} />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch 
                  id="is_active" 
                  checked={watch('is_active')} 
                  onCheckedChange={(v) => setValue('is_active', v)} 
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingEquipment ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </LogisticsLayout>
  );
}
