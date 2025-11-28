import { cn } from '@/lib/utils';
import { ComponentItem } from '@/types/calculator';
import { useCalculatorStore } from '@/store/calculatorStore';
import { Check, Minus, Plus, Globe, FileText, Bot, ShoppingCart, Shield, Code, Image, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Globe,
  FileText,
  Bot,
  ShoppingCart,
  Shield,
  Code,
  Image,
  BarChart3,
  Sparkles,
};

interface ComponentCardProps {
  component: ComponentItem;
}

export function ComponentCard({ component }: ComponentCardProps) {
  const { selectedComponents, toggleComponent, setComponentQuantity, profitMargin } = useCalculatorStore();
  
  const selected = selectedComponents.find((sc) => sc.componentId === component.id);
  const isSelected = !!selected;
  const quantity = selected?.quantity || 1;

  const Icon = iconMap[component.icon || 'Sparkles'] || Sparkles;
  
  const finalPrice = component.basePrice * (1 + profitMargin / 100);

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300 cursor-pointer',
        isSelected
          ? 'border-primary/50 shadow-glow bg-primary/5'
          : 'border-border/50 hover:border-primary/30 hover:shadow-lifted'
      )}
      onClick={() => toggleComponent(component.id)}
    >
      {/* Selection indicator */}
      <div
        className={cn(
          'absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-200',
          isSelected
            ? 'bg-primary text-primary-foreground scale-100'
            : 'bg-secondary scale-90 opacity-0 group-hover:opacity-100'
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </div>

      {/* Icon */}
      <div
        className={cn(
          'mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300',
          isSelected
            ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
            : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-foreground">{component.name}</h3>
          {component.isBase && (
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-xs font-medium text-accent-foreground">
              Base
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{component.description}</p>
      </div>

      {/* Price */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-xs text-muted-foreground">Price</span>
          <p className="font-display text-xl font-bold text-foreground">
            ${finalPrice.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>

        {/* Quantity controls */}
        {isSelected && !component.isBase && (
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setComponentQuantity(component.id, Math.max(1, quantity - 1))}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setComponentQuantity(component.id, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {/* Category badge */}
      <div className="absolute bottom-3 right-3">
        <span className="text-xs text-muted-foreground">{component.category}</span>
      </div>
    </div>
  );
}
