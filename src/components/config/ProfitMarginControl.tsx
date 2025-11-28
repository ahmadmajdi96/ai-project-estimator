import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Percent, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

export function ProfitMarginControl() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const [localMargin, setLocalMargin] = useState(25);

  useEffect(() => {
    if (settings) {
      setLocalMargin(settings.profit_margin);
    }
  }, [settings]);

  const handleSave = () => {
    if (settings) {
      updateSettings.mutate({ id: settings.id, profit_margin: localMargin });
    }
  };

  const presets = [10, 15, 25, 35, 50];

  if (isLoading) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <Percent className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">Profit Margin</h2>
          <p className="text-sm text-muted-foreground">Set your markup percentage</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Slider */}
        <div className="space-y-4">
          <Slider
            value={[localMargin]}
            onValueChange={(value) => setLocalMargin(value[0])}
            max={100}
            min={0}
            step={1}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Input */}
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={100}
            value={localMargin}
            onChange={(e) => setLocalMargin(Math.min(100, Math.max(0, Number(e.target.value))))}
            className="text-center text-lg font-bold"
          />
          <span className="text-lg font-bold text-foreground">%</span>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button
              key={preset}
              variant={localMargin === preset ? 'default' : 'outline'}
              size="sm"
              onClick={() => setLocalMargin(preset)}
              className="flex-1"
            >
              {preset}%
            </Button>
          ))}
        </div>

        {/* Save Button */}
        <Button 
          variant="gradient" 
          className="w-full" 
          onClick={handleSave}
          disabled={updateSettings.isPending || localMargin === settings?.profit_margin}
        >
          {updateSettings.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save Changes
        </Button>

        {/* Current value display */}
        <div className="rounded-lg bg-secondary/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">Current Margin</p>
          <p className="font-display text-3xl font-bold gradient-text">{settings?.profit_margin || 25}%</p>
        </div>
      </div>
    </div>
  );
}
