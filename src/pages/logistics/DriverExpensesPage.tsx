import { useState } from "react";
import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { AccountingDataTable, Column } from "@/components/accounting/AccountingDataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDriverExpenses, useApproveExpense, DriverExpense } from "@/hooks/useLogistics";
import { Plus, Check, X } from "lucide-react";
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
import { TablesInsert } from "@/integrations/supabase/types";

export default function DriverExpensesPage() {
  const { company } = useAccountingAuth();
  const { data: expenses = [], isLoading } = useDriverExpenses();
  const approveExpense = useApproveExpense();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const createExpense = useMutation({
    mutationFn: async (expense: TablesInsert<'driver_expenses'>) => {
      const { data, error } = await supabase
        .from('driver_expenses')
        .insert([expense])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-expenses'] });
      toast.success('Expense created');
    },
    onError: (error) => {
      toast.error('Failed to create expense: ' + error.message);
    },
  });

  const rejectExpense = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('driver_expenses')
        .update({ status: 'rejected' })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-expenses'] });
      toast.success('Expense rejected');
    },
    onError: (error) => {
      toast.error('Failed to reject expense: ' + error.message);
    },
  });

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      expense_type: 'fuel',
      amount: '',
      expense_date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
    },
  });

  const columns: Column<DriverExpense>[] = [
    { 
      key: "expense_date", 
      label: "Date", 
      sortable: true,
      render: (row) => format(new Date(row.expense_date), 'MMM d, yyyy')
    },
    { 
      key: "expense_type", 
      label: "Type", 
      sortable: true,
      render: (row) => (
        <Badge variant="outline" className="capitalize">{row.expense_type}</Badge>
      )
    },
    { 
      key: "amount", 
      label: "Amount", 
      sortable: true,
      render: (row) => `$${(row.amount / 100).toLocaleString()}`
    },
    { key: "description", label: "Description", render: (row) => row.description || '-' },
    { 
      key: "status", 
      label: "Status",
      render: (row) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          pending: "outline",
          approved: "default",
          rejected: "destructive",
          reimbursed: "secondary",
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
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={(e) => { e.stopPropagation(); approveExpense.mutate(row.id); }}
            >
              <Check className="w-4 h-4 text-green-600" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={(e) => { e.stopPropagation(); rejectExpense.mutate(row.id); }}
            >
              <X className="w-4 h-4 text-red-600" />
            </Button>
          </div>
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
        { value: "rejected", label: "Rejected" },
        { value: "reimbursed", label: "Reimbursed" },
      ],
    },
    {
      key: "expense_type",
      label: "Type",
      options: [
        { value: "fuel", label: "Fuel" },
        { value: "toll", label: "Toll" },
        { value: "parking", label: "Parking" },
        { value: "lumper", label: "Lumper" },
        { value: "detention", label: "Detention" },
        { value: "other", label: "Other" },
      ],
    },
  ];

  const onSubmit = async (data: any) => {
    const payload: TablesInsert<'driver_expenses'> = {
      company_id: company?.id,
      expense_type: data.expense_type,
      amount: Math.round(parseFloat(data.amount) * 100),
      expense_date: data.expense_date,
      description: data.description || null,
      status: 'pending',
    };

    await createExpense.mutateAsync(payload);
    setIsDialogOpen(false);
    reset();
  };

  const pendingCount = expenses.filter(e => e.status === 'pending').length;
  const totalPending = expenses
    .filter(e => e.status === 'pending')
    .reduce((sum, e) => sum + e.amount, 0) / 100;

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Driver Expenses</h1>
            <p className="text-muted-foreground">
              {pendingCount > 0 && (
                <span className="text-orange-600">
                  {pendingCount} pending expenses (${totalPending.toLocaleString()})
                </span>
              )}
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>

        <AccountingDataTable
          data={expenses}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search expenses..."
          isLoading={isLoading}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Driver Expense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="expense_type">Expense Type</Label>
                <Select value={watch('expense_type')} onValueChange={(v) => setValue('expense_type', v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="toll">Toll</SelectItem>
                    <SelectItem value="parking">Parking</SelectItem>
                    <SelectItem value="lumper">Lumper</SelectItem>
                    <SelectItem value="detention">Detention</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" type="number" step="0.01" {...register('amount', { required: true })} />
                </div>
                <div>
                  <Label htmlFor="expense_date">Date</Label>
                  <Input id="expense_date" type="date" {...register('expense_date', { required: true })} />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...register('description')} rows={2} />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Expense</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </LogisticsLayout>
  );
}
