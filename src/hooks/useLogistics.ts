import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface Shipment {
  id: string;
  company_id: string;
  shipment_number: string;
  customer_id: string | null;
  carrier_id: string | null;
  equipment_type_id: string | null;
  status: string;
  pickup_date: string | null;
  delivery_date: string | null;
  actual_pickup_date: string | null;
  actual_delivery_date: string | null;
  customer_rate: number;
  carrier_rate: number;
  fuel_surcharge: number;
  accessorial_charges: number;
  total_revenue: number;
  total_cost: number;
  margin: number;
  currency: string;
  weight_lbs: number | null;
  pieces: number | null;
  commodity: string | null;
  special_instructions: string | null;
  customer_po: string | null;
  customer_ref: string | null;
  bol_number: string | null;
  created_at: string;
  updated_at: string;
  customer?: { name: string };
  carrier?: { name: string };
}

export interface Carrier {
  id: string;
  company_id: string;
  carrier_number: string;
  name: string;
  mc_number: string | null;
  dot_number: string | null;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: Record<string, unknown>;
  payment_terms: number;
  default_rate_per_mile: number;
  insurance_expiry: string | null;
  performance_score: number;
  is_active: boolean;
  notes: string | null;
  created_at: string;
}

export interface EquipmentType {
  id: string;
  company_id: string;
  name: string;
  code: string;
  description: string | null;
  max_weight_lbs: number | null;
  max_volume_cuft: number | null;
  is_active: boolean;
}

export interface DriverExpense {
  id: string;
  company_id: string;
  shipment_id: string | null;
  driver_id: string | null;
  expense_type: string;
  amount: number;
  currency: string;
  receipt_url: string | null;
  description: string | null;
  expense_date: string;
  status: string;
}

export interface CarrierSettlement {
  id: string;
  company_id: string;
  carrier_id: string;
  settlement_number: string;
  settlement_date: string;
  total_amount: number;
  status: string;
  bill_id: string | null;
  carrier?: { name: string };
}

// Shipments
export function useShipments() {
  return useQuery({
    queryKey: ['shipments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shipments')
        .select(`*, customer:ar_customers(name), carrier:carriers(name)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Shipment[];
    },
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (shipment: Record<string, unknown>) => {
      const { data, error } = await supabase.from('shipments').insert([shipment]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment created'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

export function useUpdateShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase.from('shipments').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Shipment updated'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

export function useDeleteShipment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('shipments').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['shipments'] }); toast.success('Deleted'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

// Carriers
export function useCarriers() {
  return useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const { data, error } = await supabase.from('carriers').select('*').order('name');
      if (error) throw error;
      return data as Carrier[];
    },
  });
}

export function useCreateCarrier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (carrier: Record<string, unknown>) => {
      const { data, error } = await supabase.from('carriers').insert([carrier]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['carriers'] }); toast.success('Carrier created'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

export function useUpdateCarrier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase.from('carriers').update(updates).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['carriers'] }); toast.success('Carrier updated'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

export function useDeleteCarrier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('carriers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['carriers'] }); toast.success('Deleted'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

// Equipment Types
export function useEquipmentTypes() {
  return useQuery({
    queryKey: ['equipment-types'],
    queryFn: async () => {
      const { data, error } = await supabase.from('equipment_types').select('*').order('name');
      if (error) throw error;
      return data as EquipmentType[];
    },
  });
}

export function useCreateEquipmentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (equipment: Record<string, unknown>) => {
      const { data, error } = await supabase.from('equipment_types').insert([equipment]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['equipment-types'] }); toast.success('Created'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

// Driver Expenses
export function useDriverExpenses() {
  return useQuery({
    queryKey: ['driver-expenses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('driver_expenses').select('*').order('expense_date', { ascending: false });
      if (error) throw error;
      return data as DriverExpense[];
    },
  });
}

export function useApproveExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('driver_expenses').update({ status: 'approved', approved_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['driver-expenses'] }); toast.success('Approved'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}

// Carrier Settlements
export function useCarrierSettlements() {
  return useQuery({
    queryKey: ['carrier-settlements'],
    queryFn: async () => {
      const { data, error } = await supabase.from('carrier_settlements').select(`*, carrier:carriers(name)`).order('settlement_date', { ascending: false });
      if (error) throw error;
      return data as CarrierSettlement[];
    },
  });
}

// Tracking Events
export function useTrackingEvents(shipmentId: string) {
  return useQuery({
    queryKey: ['tracking-events', shipmentId],
    queryFn: async () => {
      const { data, error } = await supabase.from('tracking_events').select('*').eq('shipment_id', shipmentId).order('event_time', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!shipmentId,
  });
}

export function useAddTrackingEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (event: { shipment_id: string; event_type: string; description?: string }) => {
      const { data, error } = await supabase.from('tracking_events').insert([event]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ['tracking-events', variables.shipment_id] }); toast.success('Event added'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
  });
}
