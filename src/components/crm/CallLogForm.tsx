import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAddCallLog } from '@/hooks/useCallLogs';
import { PhoneCall, PhoneIncoming, PhoneOutgoing, Clock, Loader2 } from 'lucide-react';

const callLogSchema = z.object({
  call_type: z.enum(['incoming', 'outgoing']),
  call_duration: z.coerce.number().min(0).optional(),
  summary: z.string().optional(),
  follow_up_action: z.string().optional(),
  assigned_to: z.string().optional(),
});

type CallLogFormData = z.infer<typeof callLogSchema>;

interface CallLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  clientName?: string;
}

const QUICK_DURATIONS = [5, 10, 15, 30, 45, 60];

export function CallLogForm({ open, onOpenChange, clientId, clientName }: CallLogFormProps) {
  const addCallLog = useAddCallLog();

  const form = useForm<CallLogFormData>({
    resolver: zodResolver(callLogSchema),
    defaultValues: {
      call_type: 'outgoing',
      call_duration: 0,
      summary: '',
      follow_up_action: '',
      assigned_to: '',
    },
  });

  const onSubmit = async (data: CallLogFormData) => {
    await addCallLog.mutateAsync({
      client_id: clientId,
      call_type: data.call_type,
      call_duration: data.call_duration || null,
      summary: data.summary || null,
      follow_up_action: data.follow_up_action || null,
      assigned_to: data.assigned_to || null,
    });
    form.reset();
    onOpenChange(false);
  };

  const setQuickDuration = (minutes: number) => {
    form.setValue('call_duration', minutes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5 text-primary" />
            Log Call {clientName && <span className="text-muted-foreground">- {clientName}</span>}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Call Type */}
            <FormField
              control={form.control}
              name="call_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call Type</FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={field.value === 'outgoing' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => field.onChange('outgoing')}
                    >
                      <PhoneOutgoing className="h-4 w-4 mr-2" />
                      Outgoing
                    </Button>
                    <Button
                      type="button"
                      variant={field.value === 'incoming' ? 'default' : 'outline'}
                      className="flex-1"
                      onClick={() => field.onChange('incoming')}
                    >
                      <PhoneIncoming className="h-4 w-4 mr-2" />
                      Incoming
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="call_duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration (minutes)
                  </FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-1 flex-wrap">
                      {QUICK_DURATIONS.map((min) => (
                        <Button
                          key={min}
                          type="button"
                          variant={field.value === min ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setQuickDuration(min)}
                        >
                          {min}m
                        </Button>
                      ))}
                    </div>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Custom duration"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Summary */}
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Call Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What was discussed..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Follow-up Action */}
            <FormField
              control={form.control}
              name="follow_up_action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Follow-up Action</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Send proposal by Friday"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned To */}
            <FormField
              control={form.control}
              name="assigned_to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Team member name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addCallLog.isPending}>
                {addCallLog.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4" />
                    Log Call
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
