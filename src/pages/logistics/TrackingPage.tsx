import { useState } from "react";
import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useShipments, useTrackingEvents, useAddTrackingEvent } from "@/hooks/useLogistics";
import { Search, MapPin, Package, Clock, Truck, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function TrackingPage() {
  const { data: shipments = [] } = useShipments();
  const [selectedShipmentId, setSelectedShipmentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [newEventType, setNewEventType] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  
  const { data: trackingEvents = [] } = useTrackingEvents(selectedShipmentId);
  const addEvent = useAddTrackingEvent();

  const activeShipments = shipments.filter(s => ['dispatched', 'in_transit'].includes(s.status));
  const filteredShipments = activeShipments.filter(s => 
    s.shipment_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedShipment = shipments.find(s => s.id === selectedShipmentId);

  const handleAddEvent = async () => {
    if (!selectedShipmentId || !newEventType) return;
    
    await addEvent.mutateAsync({
      shipment_id: selectedShipmentId,
      event_type: newEventType,
      description: newEventDescription || undefined,
    });
    
    setNewEventType('');
    setNewEventDescription('');
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'pickup': return <Truck className="w-4 h-4" />;
      case 'delivery': return <CheckCircle className="w-4 h-4" />;
      case 'checkpoint': return <MapPin className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      dispatched: "default",
      in_transit: "default",
      delivered: "secondary",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Shipment Tracking</h1>
          <p className="text-muted-foreground">Track shipments and add tracking events</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Shipment List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Active Shipments</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search shipments..." 
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredShipments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No active shipments</p>
              ) : (
                filteredShipments.map((shipment) => (
                  <div
                    key={shipment.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedShipmentId === shipment.id 
                        ? 'bg-primary/10 border-primary' 
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedShipmentId(shipment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{shipment.shipment_number}</span>
                      </div>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {shipment.customer?.name || 'No customer'}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Tracking Details */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedShipment ? `Tracking: ${selectedShipment.shipment_number}` : 'Select a Shipment'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedShipment ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a shipment to view tracking details</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Shipment Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-medium">{selectedShipment.customer?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Carrier</p>
                      <p className="font-medium">{selectedShipment.carrier?.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="font-medium">
                        {selectedShipment.pickup_date 
                          ? format(new Date(selectedShipment.pickup_date), 'MMM d, yyyy')
                          : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Delivery</p>
                      <p className="font-medium">
                        {selectedShipment.delivery_date 
                          ? format(new Date(selectedShipment.delivery_date), 'MMM d, yyyy')
                          : '-'}
                      </p>
                    </div>
                  </div>

                  {/* Add Event */}
                  <div className="p-4 border rounded-lg space-y-3">
                    <h4 className="font-medium">Add Tracking Event</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Select value={newEventType} onValueChange={setNewEventType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pickup">Pickup</SelectItem>
                          <SelectItem value="checkpoint">Checkpoint</SelectItem>
                          <SelectItem value="delay">Delay</SelectItem>
                          <SelectItem value="delivery">Delivery</SelectItem>
                          <SelectItem value="note">Note</SelectItem>
                        </SelectContent>
                      </Select>
                      <Textarea 
                        placeholder="Description (optional)"
                        value={newEventDescription}
                        onChange={(e) => setNewEventDescription(e.target.value)}
                        rows={1}
                      />
                    </div>
                    <Button onClick={handleAddEvent} disabled={!newEventType || addEvent.isPending}>
                      Add Event
                    </Button>
                  </div>

                  {/* Timeline */}
                  <div>
                    <h4 className="font-medium mb-4">Tracking History</h4>
                    {trackingEvents.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No tracking events yet</p>
                    ) : (
                      <div className="space-y-4">
                        {trackingEvents.map((event, index) => (
                          <div key={event.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                {getEventIcon(event.event_type)}
                              </div>
                              {index < trackingEvents.length - 1 && (
                                <div className="w-0.5 h-full bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-center justify-between">
                                <p className="font-medium capitalize">{event.event_type}</p>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(event.event_time), 'MMM d, h:mm a')}
                                </p>
                              </div>
                              {event.description && (
                                <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </LogisticsLayout>
  );
}
