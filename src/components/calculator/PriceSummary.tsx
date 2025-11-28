import { useCalculatorStore } from '@/store/calculatorStore';
import { useComponents } from '@/hooks/useComponents';
import { useSettings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/button';
import { FileDown, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { useMemo } from 'react';

export function PriceSummary() {
  const { selectedComponents, clearSelection } = useCalculatorStore();
  const { data: components, isLoading: isLoadingComponents } = useComponents();
  const { data: settings, isLoading: isLoadingSettings } = useSettings();

  const profitMargin = settings?.profit_margin || 25;

  const { subtotal, total, savings, itemCount } = useMemo(() => {
    let subtotal = 0;
    let itemCount = 0;

    selectedComponents.forEach((sc) => {
      const component = components.find((c) => c.id === sc.componentId);
      if (component) {
const price = component.base_price * (1 + profitMargin / 100);
        subtotal += price * sc.quantity;
        itemCount += sc.quantity;
      }
    });

    // Calculate potential savings (e.g., 10% bundle discount for 3+ items)
    const savings = itemCount >= 3 ? subtotal * 0.1 : 0;
    const total = subtotal - savings;

    return { subtotal, total, savings, itemCount };
  }, [selectedComponents, components, profitMargin]);

  const handleExport = () => {
    const selectedDetails = selectedComponents.map((sc) => {
      const component = components.find((c) => c.id === sc.componentId);
      const price = component ? component.base_price * (1 + profitMargin / 100) : 0;
      return {
        name: component?.name,
        quantity: sc.quantity,
        unitPrice: price,
        total: price * sc.quantity,
      };
    });

    const quote = {
      date: new Date().toISOString(),
      items: selectedDetails,
      subtotal,
      savings,
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
          {/* Pricing breakdown */}
          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">${subtotal.toLocaleString()}</span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-accent">Bundle Discount (10%)</span>
                <span className="text-accent">-${savings.toLocaleString()}</span>
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
            <Button variant="gradient" className="w-full" onClick={handleExport}>
              <FileDown className="h-4 w-4" />
              Export Quote
            </Button>
            <Button variant="outline" className="w-full" onClick={clearSelection}>
              <RefreshCw className="h-4 w-4" />
              Clear Selection
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
