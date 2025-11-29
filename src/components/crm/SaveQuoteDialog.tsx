import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useClients, useAddClient } from '@/hooks/useClients';
import { useAddQuote } from '@/hooks/useQuotes';
import { UserPlus, Users, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuoteData {
  items: { name: string; quantity: number; unitPrice: number; total: number }[];
  subtotal: number;
  discountPercent: number;
  discount: number;
  total: number;
  profitMargin: number;
}

interface SaveQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quoteData: QuoteData;
  onSuccess?: () => void;
}

export function SaveQuoteDialog({ open, onOpenChange, quoteData, onSuccess }: SaveQuoteDialogProps) {
  const { data: clients = [] } = useClients();
  const addClient = useAddClient();
  const addQuote = useAddQuote();
  
  const [tab, setTab] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [quoteTitle, setQuoteTitle] = useState(`Quote - ${new Date().toLocaleDateString()}`);
  const [notes, setNotes] = useState('');
  const [validUntil, setValidUntil] = useState('');
  
  // New client fields
  const [newClientName, setNewClientName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!quoteTitle.trim()) {
      toast.error('Please enter a quote title');
      return;
    }

    setIsSaving(true);
    
    try {
      let clientId = selectedClientId;
      
      // Create new client if on new tab
      if (tab === 'new') {
        if (!newClientName.trim()) {
          toast.error('Please enter a client name');
          setIsSaving(false);
          return;
        }
        
        const newClient = await addClient.mutateAsync({
          client_name: newClientName,
          email: newClientEmail || null,
          phone: newClientPhone || null,
          status: 'prospect',
          sales_stage: 'pre_sales',
        });
        clientId = newClient.id;
      }

      // Save the quote
      await addQuote.mutateAsync({
        client_id: clientId || null,
        title: quoteTitle,
        status: 'draft',
        components: quoteData.items,
        subtotal: quoteData.subtotal,
        discount_percent: quoteData.discountPercent,
        discount_amount: quoteData.discount,
        total: quoteData.total,
        profit_margin: quoteData.profitMargin,
        notes: notes || null,
        valid_until: validUntil || null,
      });

      toast.success('Quote saved to CRM');
      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      setSelectedClientId('');
      setQuoteTitle(`Quote - ${new Date().toLocaleDateString()}`);
      setNotes('');
      setValidUntil('');
      setNewClientName('');
      setNewClientEmail('');
      setNewClientPhone('');
    } catch (error) {
      console.error('Failed to save quote:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save Quote to CRM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quote Details */}
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Items</span>
              <span>{quoteData.items.length}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${quoteData.subtotal.toLocaleString()}</span>
            </div>
            {quoteData.discount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-accent">Discount ({quoteData.discountPercent}%)</span>
                <span className="text-accent">-${quoteData.discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold border-t border-border pt-2">
              <span>Total</span>
              <span className="text-primary">${quoteData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Quote Title */}
          <div className="space-y-2">
            <Label>Quote Title *</Label>
            <Input
              value={quoteTitle}
              onChange={(e) => setQuoteTitle(e.target.value)}
              placeholder="Enter quote title"
            />
          </div>

          {/* Client Selection */}
          <Tabs value={tab} onValueChange={(v) => setTab(v as 'existing' | 'new')}>
            <TabsList className="w-full">
              <TabsTrigger value="existing" className="flex-1 gap-2">
                <Users className="h-4 w-4" />
                Existing Client
              </TabsTrigger>
              <TabsTrigger value="new" className="flex-1 gap-2">
                <UserPlus className="h-4 w-4" />
                New Client
              </TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Select Client</Label>
                <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a client (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No client (standalone quote)</SelectItem>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.client_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Client Name *</Label>
                <Input
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Company or client name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Additional Fields */}
          <div className="space-y-2">
            <Label>Valid Until</Label>
            <Input
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes for this quote..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save to CRM
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
