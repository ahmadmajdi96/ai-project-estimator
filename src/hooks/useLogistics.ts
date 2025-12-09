import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

// Types
export type Shipment = Tables<'shipments'> & {
  customer?: { name: string } | null;
  carrier?: { name: string } | null;
};

export type Carrier = Tables<'carriers'>;
export type EquipmentType = Tables<'equipment_types'>;
export type DriverExpense = Tables<'driver_expenses'>;
export type CarrierSettlement = Tables<'carrier_settlements'> & {
  carrier?: { name: string } | null;
};

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
    mutationFn: async (shipment: TablesInsert<'shipments'>) => {
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
    mutationFn: async ({ id, ...updates }: { id: string } & TablesUpdate<'shipments'>) => {
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
    mutationFn: async (carrier: TablesInsert<'carriers'>) => {
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
    mutationFn: async ({ id, ...updates }: { id: string } & TablesUpdate<'carriers'>) => {
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
    mutationFn: async (equipment: TablesInsert<'equipment_types'>) => {
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

export function useCreateDriverExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (expense: TablesInsert<'driver_expenses'>) => {
      const { data, error } = await supabase.from('driver_expenses').insert([expense]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['driver-expenses'] }); toast.success('Expense created'); },
    onError: (e) => { toast.error('Failed: ' + e.message); },
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
