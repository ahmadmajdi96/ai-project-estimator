import { useCalculatorStore } from '@/store/calculatorStore';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { TrendingUp } from 'lucide-react';

export function ProfitMarginControl() {
  const { profitMargin, setProfitMargin } = useCalculatorStore();

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <TrendingUp className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Profit Margin</h2>
          <p className="text-sm text-muted-foreground">Applied to all component prices</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Slider
            value={[profitMargin]}
            onValueChange={(value) => setProfitMargin(value[0])}
            max={100}
            min={0}
            step={1}
            className="flex-1"
          />
          <div className="flex items-center gap-1">
            <Input
              type="number"
              value={profitMargin}
              onChange={(e) => setProfitMargin(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-20 text-center font-medium"
              min={0}
              max={100}
            />
            <span className="text-muted-foreground">%</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[10, 20, 25, 30].map((value) => (
            <button
              key={value}
              onClick={() => setProfitMargin(value)}
              className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                profitMargin === value
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
              }`}
            >
              {value}%
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
