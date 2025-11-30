import { useState, useRef, useEffect } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useClients } from '@/hooks/useClients';
import { useTasks } from '@/hooks/useTasks';
import { useEmployees } from '@/hooks/useEmployees';
import { useSalesmen } from '@/hooks/useSalesmen';
import { useKPIDefinitions } from '@/hooks/useKPIs';
import { toast } from 'sonner';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Database,
  RefreshCw,
  Lightbulb
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const SUGGESTED_PROMPTS = [
  "What's the current status of our sales pipeline?",
  "Which clients need follow-up this week?",
  "Analyze our top performing salesmen",
  "What tasks are overdue?",
  "Give me insights on our KPIs",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI CRM assistant. I have access to your clients, tasks, employees, salesmen, and KPIs data. How can I help you analyze your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load CRM data for context
  const { data: clients = [] } = useClients();
  const { data: tasks = [] } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: salesmen = [] } = useSalesmen();
  const { data: kpis = [] } = useKPIDefinitions();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildContext = () => ({
    summary: {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status !== 'done').length,
      overdueTasks: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
      totalEmployees: employees.length,
      totalSalesmen: salesmen.length,
      activeSalesmen: salesmen.filter(s => s.status === 'active').length,
    },
    clients: clients.slice(0, 20).map(c => ({
      name: c.client_name,
      status: c.status,
      sales_stage: c.sales_stage,
      contract_value: c.contract_value,
      industry: c.industry,
    })),
    recentTasks: tasks.slice(0, 15).map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
    })),
    salesmen: salesmen.map(s => ({
      name: s.name,
      status: s.status,
      territory: s.territory,
      target_monthly: s.target_monthly,
    })),
    kpiDefinitions: kpis.map(k => ({
      name: k.name,
      target: k.target_value,
      unit: k.unit,
    })),
  });

  const handleSend = async (promptText?: string) => {
    const messageText = promptText || input;
    if (!messageText.trim()) return;
    
    const userMsg: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          context: buildContext(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI service error');
      }

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      // Add empty assistant message
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            buffer = line + '\n' + buffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to get AI response';
      toast.error(errorMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: `I apologize, but I encountered an error: ${errorMessage}. Please try again.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      { role: 'assistant', content: 'Hello! I\'m your AI CRM assistant. I have access to your clients, tasks, employees, salesmen, and KPIs data. How can I help you analyze your business today?' }
    ]);
  };

  return (
    <CRMLayout title="AI Assistant">
      <div className="h-[calc(100vh-8rem)] flex gap-6">
        {/* Main Chat */}
        <Card className="flex-1 flex flex-col bg-gradient-to-br from-card/80 to-card/40 border-border/50 backdrop-blur-sm">
          {/* Header */}
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-semibold">CRM AI Assistant</h2>
                <p className="text-xs text-muted-foreground">Powered by Gemini • Full CRM context</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-3xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted/50 rounded-bl-md border border-border/50'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div className="bg-muted/50 rounded-2xl rounded-bl-md p-4 border border-border/50">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <CardContent className="border-t border-border/50 p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about clients, tasks, salesmen, KPIs..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  disabled={isLoading}
                  className="flex-1 bg-background/50"
                />
                <Button 
                  onClick={() => handleSend()} 
                  disabled={isLoading || !input.trim()}
                  className="px-6 gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="w-80 space-y-4">
          {/* Context Info */}
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">Data Context</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Clients</span>
                <Badge variant="secondary">{clients.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasks</span>
                <Badge variant="secondary">{tasks.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salesmen</span>
                <Badge variant="secondary">{salesmen.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Employees</span>
                <Badge variant="secondary">{employees.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KPIs</span>
                <Badge variant="secondary">{kpis.length}</Badge>
              </div>
            </div>
          </Card>

          {/* Suggested Prompts */}
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <h3 className="font-semibold text-sm">Try Asking</h3>
            </div>
            <div className="space-y-2">
              {SUGGESTED_PROMPTS.map((prompt, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto py-2 px-3 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </CRMLayout>
  );
}