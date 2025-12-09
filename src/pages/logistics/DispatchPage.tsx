import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShipments, useUpdateShipment } from "@/hooks/useLogistics";
import { Package, Truck, Clock, CheckCircle, MapPin } from "lucide-react";
import { format } from "date-fns";

export default function DispatchPage() {
  const { data: shipments = [], isLoading } = useShipments();
  const updateShipment = useUpdateShipment();

  const pendingDispatch = shipments.filter(s => ['draft', 'booked'].includes(s.status));
  const dispatched = shipments.filter(s => s.status === 'dispatched');
  const inTransit = shipments.filter(s => s.status === 'in_transit');

  const handleDispatch = async (shipmentId: string) => {
    await updateShipment.mutateAsync({ 
      id: shipmentId, 
      status: 'dispatched',
      dispatched_at: new Date().toISOString()
    });
  };

  const handleMarkInTransit = async (shipmentId: string) => {
    await updateShipment.mutateAsync({ 
      id: shipmentId, 
      status: 'in_transit',
      actual_pickup_date: new Date().toISOString()
    });
  };

  const handleMarkDelivered = async (shipmentId: string) => {
    await updateShipment.mutateAsync({ 
      id: shipmentId, 
      status: 'delivered',
      actual_delivery_date: new Date().toISOString()
    });
  };

  const ShipmentCard = ({ shipment, actions }: { shipment: any; actions: React.ReactNode }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">{shipment.shipment_number}</p>
              <p className="text-sm text-muted-foreground">{shipment.customer?.name || 'No customer'}</p>
            </div>
          </div>
          <Badge variant="outline">${(shipment.total_revenue / 100).toLocaleString()}</Badge>
        </div>
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Truck className="w-4 h-4" />
            <span>{shipment.carrier?.name || 'No carrier assigned'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>
              {shipment.pickup_date ? format(new Date(shipment.pickup_date), 'MMM d') : '-'} → {' '}
              {shipment.delivery_date ? format(new Date(shipment.delivery_date), 'MMM d') : '-'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {actions}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <LogisticsLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </LogisticsLayout>
    );
  }

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dispatch Board</h1>
          <p className="text-muted-foreground">Manage shipment dispatch and tracking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Dispatch */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5 text-yellow-500" />
                  Pending Dispatch
                  <Badge variant="secondary" className="ml-auto">{pendingDispatch.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pendingDispatch.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No shipments pending</p>
                ) : (
                  pendingDispatch.map((shipment) => (
                    <ShipmentCard 
                      key={shipment.id} 
                      shipment={shipment}
                      actions={
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleDispatch(shipment.id)}
                          disabled={!shipment.carrier_id}
                        >
                          Dispatch
                        </Button>
                      }
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Dispatched */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Truck className="w-5 h-5 text-blue-500" />
                  Dispatched
                  <Badge variant="secondary" className="ml-auto">{dispatched.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dispatched.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No dispatched shipments</p>
                ) : (
                  dispatched.map((shipment) => (
                    <ShipmentCard 
                      key={shipment.id} 
                      shipment={shipment}
                      actions={
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleMarkInTransit(shipment.id)}
                        >
                          <MapPin className="w-4 h-4 mr-1" />
                          Mark In Transit
                        </Button>
                      }
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* In Transit */}
          <div>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  In Transit
                  <Badge variant="secondary" className="ml-auto">{inTransit.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {inTransit.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No shipments in transit</p>
                ) : (
                  inTransit.map((shipment) => (
                    <ShipmentCard 
                      key={shipment.id} 
                      shipment={shipment}
                      actions={
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="w-full"
                          onClick={() => handleMarkDelivered(shipment.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Delivered
                        </Button>
                      }
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </LogisticsLayout>
  );
}
