import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { useCreateShipment, useUpdateShipment, Shipment, useCarriers, useEquipmentTypes } from "@/hooks/useLogistics";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAccountingAuth } from "@/hooks/useAccountingAuth";

interface ShipmentFormProps {
  shipment?: Shipment | null;
  onClose: () => void;
}

export function ShipmentForm({ shipment, onClose }: ShipmentFormProps) {
  const { company } = useAccountingAuth();
  const createShipment = useCreateShipment();
  const updateShipment = useUpdateShipment();
  const { data: carriers = [] } = useCarriers();
  const { data: equipmentTypes = [] } = useEquipmentTypes();
  
  const { data: customers = [] } = useQuery({
    queryKey: ['ar-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ar_customers')
        .select('id, name, customer_number')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      shipment_number: shipment?.shipment_number || `SHP-${Date.now().toString().slice(-6)}`,
      customer_id: shipment?.customer_id || '',
      carrier_id: shipment?.carrier_id || '',
      equipment_type_id: shipment?.equipment_type_id || '',
      status: shipment?.status || 'draft',
      pickup_date: shipment?.pickup_date || '',
      delivery_date: shipment?.delivery_date || '',
      customer_rate: shipment ? (shipment.customer_rate / 100).toString() : '',
      carrier_rate: shipment ? (shipment.carrier_rate / 100).toString() : '',
      fuel_surcharge: shipment ? (shipment.fuel_surcharge / 100).toString() : '0',
      accessorial_charges: shipment ? (shipment.accessorial_charges / 100).toString() : '0',
      weight_lbs: shipment?.weight_lbs?.toString() || '',
      pieces: shipment?.pieces?.toString() || '',
      commodity: shipment?.commodity || '',
      customer_po: shipment?.customer_po || '',
      customer_ref: shipment?.customer_ref || '',
      special_instructions: shipment?.special_instructions || '',
    },
  });

  const customerRate = parseFloat(watch('customer_rate') || '0');
  const carrierRate = parseFloat(watch('carrier_rate') || '0');
  const fuelSurcharge = parseFloat(watch('fuel_surcharge') || '0');
  const accessorials = parseFloat(watch('accessorial_charges') || '0');
  
  const totalRevenue = customerRate + fuelSurcharge + accessorials;
  const totalCost = carrierRate;
  const margin = totalRevenue - totalCost;
  const marginPct = totalRevenue > 0 ? ((margin / totalRevenue) * 100).toFixed(1) : '0';

  const onSubmit = async (data: any) => {
    const payload = {
      company_id: company?.id,
      shipment_number: data.shipment_number,
      customer_id: data.customer_id || null,
      carrier_id: data.carrier_id || null,
      equipment_type_id: data.equipment_type_id || null,
      status: data.status,
      pickup_date: data.pickup_date || null,
      delivery_date: data.delivery_date || null,
      customer_rate: Math.round(parseFloat(data.customer_rate || '0') * 100),
      carrier_rate: Math.round(parseFloat(data.carrier_rate || '0') * 100),
      fuel_surcharge: Math.round(parseFloat(data.fuel_surcharge || '0') * 100),
      accessorial_charges: Math.round(parseFloat(data.accessorial_charges || '0') * 100),
      total_revenue: Math.round(totalRevenue * 100),
      total_cost: Math.round(totalCost * 100),
      margin: Math.round(margin * 100),
      weight_lbs: data.weight_lbs ? parseInt(data.weight_lbs) : null,
      pieces: data.pieces ? parseInt(data.pieces) : null,
      commodity: data.commodity || null,
      customer_po: data.customer_po || null,
      customer_ref: data.customer_ref || null,
      special_instructions: data.special_instructions || null,
    };

    if (shipment) {
      await updateShipment.mutateAsync({ id: shipment.id, ...payload });
    } else {
      await createShipment.mutateAsync(payload);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="shipment_number">Shipment Number</Label>
          <Input id="shipment_number" {...register('shipment_number', { required: true })} />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select value={watch('status')} onValueChange={(v) => setValue('status', v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="dispatched">Dispatched</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="equipment_type_id">Equipment Type</Label>
          <Select value={watch('equipment_type_id') || ''} onValueChange={(v) => setValue('equipment_type_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select equipment" />
            </SelectTrigger>
            <SelectContent>
              {equipmentTypes.map((eq) => (
                <SelectItem key={eq.id} value={eq.id}>{eq.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_id">Customer</Label>
          <Select value={watch('customer_id') || ''} onValueChange={(v) => setValue('customer_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} ({c.customer_number})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="carrier_id">Carrier</Label>
          <Select value={watch('carrier_id') || ''} onValueChange={(v) => setValue('carrier_id', v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select carrier" />
            </SelectTrigger>
            <SelectContent>
              {carriers.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name} ({c.carrier_number})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="pickup_date">Pickup Date</Label>
          <Input id="pickup_date" type="date" {...register('pickup_date')} />
        </div>
        <div>
          <Label htmlFor="delivery_date">Delivery Date</Label>
          <Input id="delivery_date" type="date" {...register('delivery_date')} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Financials</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="customer_rate">Customer Rate ($)</Label>
            <Input id="customer_rate" type="number" step="0.01" {...register('customer_rate')} />
          </div>
          <div>
            <Label htmlFor="carrier_rate">Carrier Rate ($)</Label>
            <Input id="carrier_rate" type="number" step="0.01" {...register('carrier_rate')} />
          </div>
          <div>
            <Label htmlFor="fuel_surcharge">Fuel Surcharge ($)</Label>
            <Input id="fuel_surcharge" type="number" step="0.01" {...register('fuel_surcharge')} />
          </div>
          <div>
            <Label htmlFor="accessorial_charges">Accessorials ($)</Label>
            <Input id="accessorial_charges" type="number" step="0.01" {...register('accessorial_charges')} />
          </div>
        </div>
        <div className="mt-4 p-4 bg-muted rounded-lg grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Cost</p>
            <p className="text-xl font-bold text-red-600">${totalCost.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Margin</p>
            <p className={`text-xl font-bold ${margin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${margin.toLocaleString()} ({marginPct}%)
            </p>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="font-semibold mb-4">Cargo Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="weight_lbs">Weight (lbs)</Label>
            <Input id="weight_lbs" type="number" {...register('weight_lbs')} />
          </div>
          <div>
            <Label htmlFor="pieces">Pieces</Label>
            <Input id="pieces" type="number" {...register('pieces')} />
          </div>
          <div>
            <Label htmlFor="commodity">Commodity</Label>
            <Input id="commodity" {...register('commodity')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customer_po">Customer PO</Label>
          <Input id="customer_po" {...register('customer_po')} />
        </div>
        <div>
          <Label htmlFor="customer_ref">Customer Reference</Label>
          <Input id="customer_ref" {...register('customer_ref')} />
        </div>
      </div>

      <div>
        <Label htmlFor="special_instructions">Special Instructions</Label>
        <Textarea id="special_instructions" {...register('special_instructions')} rows={3} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={createShipment.isPending || updateShipment.isPending}>
          {shipment ? 'Update Shipment' : 'Create Shipment'}
        </Button>
      </div>
    </form>
  );
}
