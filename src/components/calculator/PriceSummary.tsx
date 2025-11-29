import { useCalculatorStore } from '@/store/calculatorStore';
import { useComponents } from '@/hooks/useComponents';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileDown, RefreshCw, Sparkles, Percent, Save } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SaveQuoteDialog } from '@/components/crm/SaveQuoteDialog';

export function PriceSummary() {
  const { selectedComponents, clearSelection } = useCalculatorStore();
  const { data: components } = useComponents();
  const { data: settings } = useSettings();
  const [discountPercent, setDiscountPercent] = useState(0);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const profitMargin = settings?.profit_margin || 25;

  const { subtotal, total, discount, itemCount, itemDetails } = useMemo(() => {
    let subtotal = 0;
    let itemCount = 0;
    const itemDetails: { name: string; quantity: number; unitPrice: number; total: number }[] = [];

    selectedComponents.forEach((sc) => {
      const component = components.find((c) => c.id === sc.componentId);
      if (component) {
        const price = component.base_price * (1 + profitMargin / 100);
        subtotal += price * sc.quantity;
        itemCount += sc.quantity;
        itemDetails.push({
          name: component.name,
          quantity: sc.quantity,
          unitPrice: price,
          total: price * sc.quantity,
        });
      }
    });

    const discount = subtotal * (discountPercent / 100);
    const total = subtotal - discount;

    return { subtotal, total, discount, itemCount, itemDetails };
  }, [selectedComponents, components, profitMargin, discountPercent]);

  const handleExport = () => {
    const quote = {
      date: new Date().toISOString(),
      items: itemDetails,
      subtotal,
      discountPercent,
      discount,
      total,
    };

    const blob = new Blob([JSON.stringify(quote, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quote-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quoteData = {
    items: itemDetails,
    subtotal,
    discountPercent,
    discount,
    total,
    profitMargin,
  };

  return (
    <div className="glass-card p-6 sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Quote Summary</h2>
          <p className="text-sm text-muted-foreground">{itemCount} item{itemCount !== 1 ? 's' : ''} selected</p>
        </div>
      </div>

      {/* Selected items */}
      {selectedComponents.length > 0 ? (
        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
          {selectedComponents.map((sc) => {
            const component = components.find((c) => c.id === sc.componentId);
            if (!component) return null;
            const price = component.base_price * (1 + profitMargin / 100);
            return (
              <div key={sc.componentId} className="flex items-center justify-between text-sm">
                <span className="text-foreground">
                  {component.name}
                  {sc.quantity > 1 && <span className="text-muted-foreground"> ×{sc.quantity}</span>}
                </span>
                <span className="font-medium text-foreground">
                  ${(price * sc.quantity).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-muted-foreground text-sm">
          Select components to build your quote
        </div>
      )}

      {selectedComponents.length > 0 && (
        <>
          {/* Discount Input */}
          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Discount</span>
              <div className="flex-1 flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                  className="h-8 w-20 text-right"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          </div>

          {/* Pricing breakdown */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toLocaleString()}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-accent">Discount ({discountPercent}%)</span>
                <span className="text-accent">-${discount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-border">
              <span className="font-display font-bold text-foreground">Total</span>
              <span className="font-display text-2xl font-bold gradient-text">
                ${total.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-2">
            <Button variant="gradient" className="w-full" onClick={() => setSaveDialogOpen(true)}>
              <Save className="h-4 w-4" />
              Save to CRM
            </Button>
            <Button variant="outline" className="w-full" onClick={handleExport}>
              <FileDown className="h-4 w-4" />
              Export JSON
            </Button>
            <Button variant="ghost" className="w-full" onClick={clearSelection}>
              <RefreshCw className="h-4 w-4" />
              Clear Selection
            </Button>
          </div>
        </>
      )}

      <SaveQuoteDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        quoteData={quoteData}
        onSuccess={clearSelection}
      />
    </div>
  );
}
