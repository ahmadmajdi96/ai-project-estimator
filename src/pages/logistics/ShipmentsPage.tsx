import { useState } from "react";
import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { AccountingDataTable } from "@/components/accounting/AccountingDataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useShipments, useDeleteShipment, Shipment } from "@/hooks/useLogistics";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShipmentForm } from "@/components/logistics/ShipmentForm";

export default function ShipmentsPage() {
  const navigate = useNavigate();
  const { data: shipments = [], isLoading } = useShipments();
  const deleteShipment = useDeleteShipment();
  const [editingShipment, setEditingShipment] = useState<Shipment | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const columns = [
    { key: "shipment_number", label: "Shipment #", sortable: true },
    { 
      key: "customer", 
      label: "Customer", 
      sortable: true,
      render: (value: { name: string } | null) => value?.name || '-'
    },
    { 
      key: "carrier", 
      label: "Carrier", 
      sortable: true,
      render: (value: { name: string } | null) => value?.name || '-'
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (value: string) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          draft: "outline",
          booked: "secondary",
          dispatched: "default",
          in_transit: "default",
          delivered: "secondary",
          cancelled: "destructive",
        };
        return <Badge variant={variants[value] || "outline"}>{value}</Badge>;
      }
    },
    { 
      key: "pickup_date", 
      label: "Pickup Date", 
      sortable: true,
      render: (value: string) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    },
    { 
      key: "delivery_date", 
      label: "Delivery Date", 
      sortable: true,
      render: (value: string) => value ? format(new Date(value), 'MMM d, yyyy') : '-'
    },
    { 
      key: "total_revenue", 
      label: "Revenue", 
      sortable: true,
      render: (value: number) => `$${(value / 100).toLocaleString()}`
    },
    { 
      key: "margin", 
      label: "Margin", 
      sortable: true,
      render: (value: number, row: Shipment) => {
        const margin = value / 100;
        const pct = row.total_revenue > 0 ? ((value / row.total_revenue) * 100).toFixed(1) : '0';
        return (
          <span className={margin >= 0 ? "text-green-600" : "text-red-600"}>
            ${margin.toLocaleString()} ({pct}%)
          </span>
        );
      }
    },
  ];

  const filters = [
    {
      key: "status",
      label: "Status",
      options: [
        { value: "draft", label: "Draft" },
        { value: "booked", label: "Booked" },
        { value: "dispatched", label: "Dispatched" },
        { value: "in_transit", label: "In Transit" },
        { value: "delivered", label: "Delivered" },
        { value: "cancelled", label: "Cancelled" },
      ],
    },
  ];

  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment);
    setIsDialogOpen(true);
  };

  const handleDelete = (shipment: Shipment) => {
    if (confirm(`Delete shipment ${shipment.shipment_number}?`)) {
      deleteShipment.mutate(shipment.id);
    }
  };

  const handleView = (shipment: Shipment) => {
    navigate(`/logistics/shipments/${shipment.id}`);
  };

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Shipments</h1>
            <p className="text-muted-foreground">Manage your shipments and loads</p>
          </div>
          <Button onClick={() => { setEditingShipment(null); setIsDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            New Shipment
          </Button>
        </div>

        <AccountingDataTable
          data={shipments}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search shipments..."
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
        />

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingShipment ? 'Edit Shipment' : 'New Shipment'}
              </DialogTitle>
            </DialogHeader>
            <ShipmentForm 
              shipment={editingShipment} 
              onClose={() => setIsDialogOpen(false)} 
            />
          </DialogContent>
        </Dialog>
      </div>
    </LogisticsLayout>
  );
}
