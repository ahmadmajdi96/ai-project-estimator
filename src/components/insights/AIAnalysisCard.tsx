import { Bot, Loader2, Sparkles, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { cn } from '@/lib/utils';

interface AIAnalysisCardProps {
  isAnalyzing: boolean;
  aiAnalysis: string;
  lastRefresh: string | null;
}

export function AIAnalysisCard({ isAnalyzing, aiAnalysis, lastRefresh }: AIAnalysisCardProps) {
  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/5">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <CardHeader className="relative">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/25">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              {isAnalyzing && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              )}
            </div>
            <div>
              <span className="text-lg font-semibold">AI Executive Analysis</span>
              <p className="text-xs text-muted-foreground font-normal">Powered by advanced AI models</p>
            </div>
          </div>
          {lastRefresh && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-full">
              <Clock className="h-3 w-3" />
              <span>Last updated: {new Date(lastRefresh).toLocaleDateString()}</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="relative">
        {isAnalyzing && !aiAnalysis ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground mt-6 font-medium">Analyzing your CRM data...</p>
            <p className="text-sm text-muted-foreground/70 mt-1">This may take a moment</p>
            
            {/* Loading progress bars */}
            <div className="w-64 mt-6 space-y-2">
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/50 to-primary animate-[loading_2s_ease-in-out_infinite]" style={{ width: '60%' }} />
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary/50 to-primary animate-[loading_2s_ease-in-out_infinite_0.3s]" style={{ width: '40%' }} />
              </div>
            </div>
          </div>
        ) : aiAnalysis ? (
          <div className={cn(
            "prose prose-sm max-w-none dark:prose-invert",
            "prose-headings:text-foreground prose-headings:font-semibold",
            "prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:pb-2 prose-h2:border-border/50",
            "prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2",
            "prose-p:text-muted-foreground prose-p:leading-relaxed",
            "prose-li:text-muted-foreground",
            "prose-strong:text-foreground prose-strong:font-semibold",
            "prose-ul:my-3 prose-ol:my-3",
            "animate-fade-in"
          )}>
            <MarkdownRenderer content={aiAnalysis} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bot className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">No analysis available</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Click "Refresh Analysis" to generate AI insights</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
