import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InsightMetricCardProps {
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  trend: 'positive' | 'negative' | 'warning' | 'neutral';
  index: number;
}

const trendConfig = {
  positive: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    glow: 'shadow-emerald-500/20',
  },
  negative: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    glow: 'shadow-red-500/20',
  },
  warning: {
    bg: 'bg-amber-500/10',
    text: 'text-amber-500',
    glow: 'shadow-amber-500/20',
  },
  neutral: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    glow: 'shadow-blue-500/20',
  },
};

export function InsightMetricCard({ icon: Icon, title, value, description, trend, index }: InsightMetricCardProps) {
  const config = trendConfig[trend];
  
  return (
    <Card 
      className={cn(
        "group relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/50",
        "hover:border-primary/30 hover:shadow-lg transition-all duration-500",
        "animate-fade-in"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Animated gradient background */}
      <div className={cn(
        "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        "bg-gradient-to-br from-primary/5 via-transparent to-transparent"
      )} />
      
      <CardContent className="p-5 relative">
        <div className="flex items-start justify-between">
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "transition-all duration-300 group-hover:scale-110",
            config.bg,
            `shadow-lg ${config.glow}`
          )}>
            <Icon className={cn("h-6 w-6", config.text)} />
          </div>
          <span className={cn(
            "text-3xl font-bold tracking-tight",
            "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text"
          )}>
            {value}
          </span>
        </div>
        <h3 className="font-semibold mt-4 text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
        
        {/* Bottom accent line */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1",
          "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
          "opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        )} />
      </CardContent>
    </Card>
  );
}
