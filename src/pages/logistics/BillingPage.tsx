import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShipments, useUpdateShipment } from "@/hooks/useLogistics";
import { Receipt, FileText, CheckCircle, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountingAuth } from "@/hooks/useAccountingAuth";

export default function BillingPage() {
  const { company } = useAccountingAuth();
  const { data: shipments = [] } = useShipments();
  const updateShipment = useUpdateShipment();
  const queryClient = useQueryClient();

  // Get existing invoices
  const { data: invoices = [] } = useQuery({
    queryKey: ['ar-invoices-logistics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ar_invoices')
        .select('*')
        .eq('source_type', 'shipment');
      if (error) throw error;
      return data;
    },
  });

  const deliveredShipments = shipments.filter(s => 
    s.status === 'delivered' && s.customer_id
  );
  
  const unbilledShipments = deliveredShipments.filter(s => 
    !invoices.some(inv => inv.source_id === s.id)
  );

  const createInvoice = useMutation({
    mutationFn: async (shipment: any) => {
      const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const { data, error } = await supabase
        .from('ar_invoices')
        .insert({
          company_id: company?.id,
          customer_id: shipment.customer_id,
          invoice_number: invoiceNumber,
          invoice_date: new Date().toISOString().split('T')[0],
          due_date: dueDate.toISOString().split('T')[0],
          subtotal: shipment.total_revenue,
          total_amount: shipment.total_revenue,
          balance_due: shipment.total_revenue,
          status: 'sent',
          source_type: 'shipment',
          source_id: shipment.id,
          notes: `Invoice for shipment ${shipment.shipment_number}`,
        })
        .select()
        .single();

      if (error) throw error;
      
      // Update shipment status
      await updateShipment.mutateAsync({ id: shipment.id, status: 'invoiced' });
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ar-invoices-logistics'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      toast.success('Invoice created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create invoice: ' + error.message);
    },
  });

  const totalUnbilled = unbilledShipments.reduce((sum, s) => sum + s.total_revenue, 0) / 100;
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / 100;
  const totalCollected = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total_amount || 0), 0) / 100;

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Customer Billing</h1>
          <p className="text-muted-foreground">Generate invoices from delivered shipments</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-500/10">
                  <Receipt className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unbilled</p>
                  <p className="text-xl font-bold">${totalUnbilled.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Invoiced</p>
                  <p className="text-xl font-bold">${totalInvoiced.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-500/10">
                  <DollarSign className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Collected</p>
                  <p className="text-xl font-bold">${totalCollected.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <CheckCircle className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ready to Bill</p>
                  <p className="text-xl font-bold">{unbilledShipments.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Unbilled Shipments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              Shipments Ready for Billing
            </CardTitle>
          </CardHeader>
          <CardContent>
            {unbilledShipments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                All delivered shipments have been invoiced
              </p>
            ) : (
              <div className="space-y-3">
                {unbilledShipments.map((shipment) => (
                  <div 
                    key={shipment.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{shipment.shipment_number}</p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.customer?.name || 'Unknown customer'}
                        </p>
                      </div>
                      <Badge variant="secondary">Delivered</Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">${(shipment.total_revenue / 100).toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">
                          {shipment.actual_delivery_date 
                            ? format(new Date(shipment.actual_delivery_date), 'MMM d, yyyy')
                            : '-'}
                        </p>
                      </div>
                      <Button 
                        onClick={() => createInvoice.mutate(shipment)}
                        disabled={createInvoice.isPending}
                      >
                        Create Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Invoices from Shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No invoices created yet
              </p>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 10).map((invoice) => (
                  <div 
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{invoice.invoice_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(invoice.invoice_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'outline'}>
                        {invoice.status}
                      </Badge>
                      <p className="font-bold">${((invoice.total_amount || 0) / 100).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LogisticsLayout>
  );
}
