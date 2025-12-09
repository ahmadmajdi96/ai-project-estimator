import { useState } from "react";
import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { AccountingDataTable, Column } from "@/components/accounting/AccountingDataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCarrierSettlements, useCarriers, useShipments, CarrierSettlement } from "@/hooks/useLogistics";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { useAccountingAuth } from "@/hooks/useAccountingAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SettlementsPage() {
  const { company } = useAccountingAuth();
  const { data: settlements = [], isLoading } = useCarrierSettlements();
  const { data: carriers = [] } = useCarriers();
  const { data: shipments = [] } = useShipments();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const deliveredShipments = shipments.filter(s => s.status === 'delivered' && !s.carrier_id);

  const createSettlement = useMutation({
    mutationFn: async (settlement: any) => {
      const { data, error } = await supabase
        .from('carrier_settlements')
        .insert(settlement)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrier-settlements'] });
      toast.success('Settlement created');
    },
    onError: (error) => {
      toast.error('Failed to create settlement: ' + error.message);
    },
  });

  const approveSettlement = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('carrier_settlements')
        .update({ status: 'approved' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['carrier-settlements'] });
      toast.success('Settlement approved');
    },
    onError: (error) => {
      toast.error('Failed to approve: ' + error.message);
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      carrier_id: '',
      settlement_date: format(new Date(), 'yyyy-MM-dd'),
      total_amount: '',
      notes: '',
    },
  });

  const columns: Column<CarrierSettlement>[] = [
    { key: "settlement_number", label: "Settlement #", sortable: true },
    { 
      key: "carrier", 
      label: "Carrier", 
      sortable: true,
      render: (row) => row.carrier?.name || '-'
    },
    { 
      key: "settlement_date", 
      label: "Date", 
      sortable: true,
      render: (row) => row.settlement_date ? format(new Date(row.settlement_date), 'MMM d, yyyy') : '-'
    },
    { 
      key: "total_amount", 
      label: "Amount", 
      sortable: true,
      render: (row) => `$${(row.total_amount / 100).toLocaleString()}`
    },
    { 
      key: "status", 
      label: "Status",
      render: (row) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          pending: "outline",
          approved: "default",
          paid: "secondary",
        };
        return <Badge variant={variants[row.status || '']}>{row.status}</Badge>;
      }
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => {
        if (row.status !== 'pending') return null;
        return (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => { e.stopPropagation(); approveSettlement.mutate(row.id); }}
          >
            Approve
          </Button>
        );
      }
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "paid", label: "Paid" },
      ],
    },
  ];

  const onSubmit = async (data: any) => {
    const payload = {
      company_id: company?.id,
      carrier_id: data.carrier_id,
      settlement_number: `SET-${Date.now().toString().slice(-6)}`,
      settlement_date: data.settlement_date,
      total_amount: Math.round(parseFloat(data.total_amount) * 100),
      notes: data.notes || null,
      status: 'pending',
    };

    await createSettlement.mutateAsync(payload);
    setIsDialogOpen(false);
    reset();
  };

  const pendingTotal = settlements
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.total_amount, 0) / 100;

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Carrier Settlements</h1>
            <p className="text-muted-foreground">
              {pendingTotal > 0 && (
                <span className="text-orange-600">
                  ${pendingTotal.toLocaleString()} pending approval
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Settlement
          </Button>
        </div>

        <AccountingDataTable
          data={settlements}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search settlements..."
          isLoading={isLoading}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Carrier Settlement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="carrier_id">Carrier</Label>
                <Select value={watch('carrier_id')} onValueChange={(v) => setValue('carrier_id', v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select carrier" />
                  </SelectTrigger>
                  <SelectContent>
                    {carriers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="total_amount">Amount ($)</Label>
                  <Input id="total_amount" type="number" step="0.01" {...register('total_amount', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="settlement_date">Date</Label>
                  <Input id="settlement_date" type="date" {...register('settlement_date', { required: true })} />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" {...register('notes')} rows={2} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Settlement</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </LogisticsLayout>
  );
}
