import { useState } from "react";
import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { AccountingDataTable, Column } from "@/components/accounting/AccountingDataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCarriers, useDeleteCarrier, useCreateCarrier, useUpdateCarrier, Carrier } from "@/hooks/useLogistics";
import { Plus } from "lucide-react";
import { format } from "date-fns";
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

export default function CarriersPage() {
  const { company } = useAccountingAuth();
  const { data: carriers = [], isLoading } = useCarriers();
  const deleteCarrier = useDeleteCarrier();
  const createCarrier = useCreateCarrier();
  const updateCarrier = useUpdateCarrier();
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      carrier_number: '',
      name: '',
      mc_number: '',
      dot_number: '',
      contact_name: '',
      email: '',
      phone: '',
      payment_terms: '30',
      default_rate_per_mile: '',
      insurance_expiry: '',
      is_active: true,
      notes: '',
    },
  });

  const columns: Column<Carrier>[] = [
    { key: "carrier_number", label: "Carrier #", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "mc_number", label: "MC #", sortable: true },
    { key: "dot_number", label: "DOT #", sortable: true },
    { key: "contact_name", label: "Contact", sortable: true },
    { key: "phone", label: "Phone" },
    { 
      key: "performance_score", 
      label: "Score", 
      sortable: true,
      render: (row) => (
        <Badge variant={(row.performance_score || 0) >= 90 ? "default" : (row.performance_score || 0) >= 70 ? "secondary" : "destructive"}>
          {row.performance_score || 0}%
        </Badge>
      )
    },
    { 
      key: "is_active", 
      label: "Status",
      render: (row) => (
        <Badge variant={row.is_active ? "default" : "secondary"}>{row.is_active ? 'Active' : 'Inactive'}</Badge>
      )
    },
    { 
      key: "insurance_expiry", 
      label: "Insurance Exp.", 
      sortable: true,
      render: (row) => {
        if (!row.insurance_expiry) return '-';
        const expDate = new Date(row.insurance_expiry);
        const isExpired = expDate < new Date();
        return (
          <span className={isExpired ? "text-red-600" : ""}>
            {format(expDate, 'MMM d, yyyy')}
          </span>
        );
      }
    },
  ];

  const filters = [
    {
      key: "is_active",
      label: "Status",
      options: [
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
  ];

  const handleEdit = (carrier: Carrier) => {
    setEditingCarrier(carrier);
    reset({
      carrier_number: carrier.carrier_number,
      name: carrier.name,
      mc_number: carrier.mc_number || '',
      dot_number: carrier.dot_number || '',
      contact_name: carrier.contact_name || '',
      email: carrier.email || '',
      phone: carrier.phone || '',
      payment_terms: (carrier.payment_terms || 30).toString(),
      default_rate_per_mile: ((carrier.default_rate_per_mile || 0) / 100).toString(),
      insurance_expiry: carrier.insurance_expiry || '',
      is_active: carrier.is_active ?? true,
      notes: carrier.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const carrier = carriers.find(c => c.id === id);
    if (carrier && confirm(`Delete carrier ${carrier.name}?`)) {
      deleteCarrier.mutate(id);
    }
  };

  const handleNew = () => {
    setEditingCarrier(null);
    reset({
      carrier_number: `CAR-${Date.now().toString().slice(-6)}`,
      name: '',
      mc_number: '',
      dot_number: '',
      contact_name: '',
      email: '',
      phone: '',
      payment_terms: '30',
      default_rate_per_mile: '',
      insurance_expiry: '',
      is_active: true,
      notes: '',
    });
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: any) => {
    const payload = {
      company_id: company?.id,
      carrier_number: data.carrier_number,
      name: data.name,
      mc_number: data.mc_number || null,
      dot_number: data.dot_number || null,
      contact_name: data.contact_name || null,
      email: data.email || null,
      phone: data.phone || null,
      payment_terms: parseInt(data.payment_terms) || 30,
      default_rate_per_mile: Math.round(parseFloat(data.default_rate_per_mile || '0') * 100),
      insurance_expiry: data.insurance_expiry || null,
      is_active: data.is_active,
      notes: data.notes || null,
    };

    if (editingCarrier) {
      await updateCarrier.mutateAsync({ id: editingCarrier.id, ...payload });
    } else {
      await createCarrier.mutateAsync(payload);
    }
    setIsDialogOpen(false);
  };

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Carriers</h1>
            <p className="text-muted-foreground">Manage your carrier network</p>
          </div>
          <Button onClick={handleNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Carrier
          </Button>
        </div>

        <AccountingDataTable
          data={carriers}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search carriers..."
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCarrier ? 'Edit Carrier' : 'New Carrier'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="carrier_number">Carrier Number</Label>
                  <Input id="carrier_number" {...register('carrier_number', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" {...register('name', { required: true })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mc_number">MC Number</Label>
                  <Input id="mc_number" {...register('mc_number')} />
                </div>
                <div>
                  <Label htmlFor="dot_number">DOT Number</Label>
                  <Input id="dot_number" {...register('dot_number')} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact_name">Contact Name</Label>
                  <Input id="contact_name" {...register('contact_name')} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register('email')} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="payment_terms">Payment Terms (days)</Label>
                  <Input id="payment_terms" type="number" {...register('payment_terms')} />
                </div>
                <div>
                  <Label htmlFor="default_rate_per_mile">Rate/Mile ($)</Label>
                  <Input id="default_rate_per_mile" type="number" step="0.01" {...register('default_rate_per_mile')} />
                </div>
                <div>
                  <Label htmlFor="insurance_expiry">Insurance Expiry</Label>
                  <Input id="insurance_expiry" type="date" {...register('insurance_expiry')} />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register('notes')} rows={3} />
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
                <Button type="submit">{editingCarrier ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </LogisticsLayout>
  );
}
