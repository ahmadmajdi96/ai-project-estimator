import { useState } from "react";
import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { AccountingDataTable, Column } from "@/components/accounting/AccountingDataTable";
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

  const columns: Column<Shipment>[] = [
    { key: "shipment_number", label: "Shipment #", sortable: true },
    { 
      key: "customer", 
      label: "Customer", 
      sortable: true,
      render: (row) => row.customer?.name || '-'
    },
    { 
      key: "carrier", 
      label: "Carrier", 
      sortable: true,
      render: (row) => row.carrier?.name || '-'
    },
    { 
      key: "status", 
      label: "Status", 
      sortable: true,
      render: (row) => {
        const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
          draft: "outline",
          booked: "secondary",
          dispatched: "default",
          in_transit: "default",
          delivered: "secondary",
          cancelled: "destructive",
        };
        return <Badge variant={variants[row.status || ''] || "outline"}>{row.status}</Badge>;
      }
    },
    { 
      key: "pickup_date", 
      label: "Pickup Date", 
      sortable: true,
      render: (row) => row.pickup_date ? format(new Date(row.pickup_date), 'MMM d, yyyy') : '-'
    },
    { 
      key: "delivery_date", 
      label: "Delivery Date", 
      sortable: true,
      render: (row) => row.delivery_date ? format(new Date(row.delivery_date), 'MMM d, yyyy') : '-'
    },
    { 
      key: "total_revenue", 
      label: "Revenue", 
      sortable: true,
      render: (row) => `$${((row.total_revenue || 0) / 100).toLocaleString()}`
    },
    { 
      key: "margin", 
      label: "Margin", 
      sortable: true,
      render: (row) => {
        const margin = (row.margin || 0) / 100;
        const pct = (row.total_revenue || 0) > 0 ? (((row.margin || 0) / (row.total_revenue || 1)) * 100).toFixed(1) : '0';
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

  const handleDelete = (id: string) => {
    const shipment = shipments.find(s => s.id === id);
    if (shipment && confirm(`Delete shipment ${shipment.shipment_number}?`)) {
      deleteShipment.mutate(id);
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
