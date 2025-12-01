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
import { useKPIDefinitions, useKPIRecords } from '@/hooks/useKPIs';
import { useQuotes } from '@/hooks/useQuotes';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useRoadmaps } from '@/hooks/useRoadmaps';
import { useDepartments } from '@/hooks/useDepartments';
import { useAIConfigs } from '@/hooks/useAIConfig';
import { useCompanyPolicies } from '@/hooks/useCompanyPolicies';
import { useInvoices } from '@/hooks/useInvoices';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { useDebitCases } from '@/hooks/useDebitCases';
import { useAIRecommendations } from '@/hooks/useAIRecommendations';
import { useAIDecisions } from '@/hooks/useAIDecisions';
import { useWorkflowRules } from '@/hooks/useWorkflows';
import { useOpportunities } from '@/hooks/useOpportunities';
import { MarkdownRenderer } from '@/components/chat/MarkdownRenderer';
import { toast } from 'sonner';
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Sparkles,
  Database,
  RefreshCw,
  Lightbulb,
  Brain,
  FileText
} from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

const SUGGESTED_PROMPTS = [
  "Give me a comprehensive analysis of our sales performance",
  "Which clients need immediate attention and why?",
  "Analyze our top performing salesmen with metrics",
  "What tasks are overdue and who's responsible?",
  "Summarize our KPIs and identify areas for improvement",
  "What's the status of our active roadmaps?",
  "Identify revenue opportunities in our pipeline",
];

export default function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your AI CRM assistant with full access to your organization\'s data including clients, tasks, employees, salesmen, quotes, KPIs, roadmaps, and company policies. How can I help you analyze your business today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load ALL CRM data for comprehensive context
  const { data: clients = [] } = useClients();
  const { data: tasks = [] } = useTasks();
  const { data: employees = [] } = useEmployees();
  const { data: salesmen = [] } = useSalesmen();
  const { data: kpis = [] } = useKPIDefinitions();
  const { data: kpiRecords = [] } = useKPIRecords();
  const { data: quotes = [] } = useQuotes();
  const { data: events = [] } = useCalendarEvents();
  const { data: roadmaps = [] } = useRoadmaps();
  const { data: departments = [] } = useDepartments();
  const { data: aiConfigs = [] } = useAIConfigs();
  const { data: policies = [] } = useCompanyPolicies();
  const { data: invoices = [] } = useInvoices();
  const { data: supportTickets = [] } = useSupportTickets();
  const { data: debitCases = [] } = useDebitCases();
  const { data: aiRecommendations = [] } = useAIRecommendations();
  const { data: aiDecisions = [] } = useAIDecisions();
  const { data: workflowRules = [] } = useWorkflowRules();
  const { data: opportunities = [] } = useOpportunities();

  const activeConfig = aiConfigs.find(c => c.is_active);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const buildContext = () => ({
    summary: {
      totalClients: clients.length,
      activeClients: clients.filter(c => c.status === 'active').length,
      prospectClients: clients.filter(c => c.status === 'prospect').length,
      totalRevenue: clients.reduce((sum, c) => sum + (c.revenue_to_date || 0), 0),
      totalContractValue: clients.reduce((sum, c) => sum + (c.contract_value || 0), 0),
      totalTasks: tasks.length,
      pendingTasks: tasks.filter(t => t.status !== 'done').length,
      overdueTasks: tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
      totalEmployees: employees.length,
      totalSalesmen: salesmen.length,
      activeSalesmen: salesmen.filter(s => s.status === 'active').length,
      totalQuotes: quotes.length,
      acceptedQuotes: quotes.filter(q => q.status === 'accepted').length,
      pendingQuotes: quotes.filter(q => q.status === 'sent' || q.status === 'draft').length,
      quotesValue: quotes.reduce((sum, q) => sum + q.total, 0),
      totalDepartments: departments.length,
      totalRoadmaps: roadmaps.length,
      // Finance metrics
      totalInvoices: invoices.length,
      paidInvoices: invoices.filter(i => i.status === 'paid').length,
      overdueInvoices: invoices.filter(i => i.status === 'overdue').length,
      totalInvoiceAmount: invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0),
      // Support metrics
      totalSupportTickets: supportTickets.length,
      openTickets: supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
      resolvedTickets: supportTickets.filter(t => t.status === 'resolved').length,
      // Debit collection metrics
      totalDebitCases: debitCases.length,
      activeDebitCases: debitCases.filter(d => d.status !== 'closed').length,
      totalDebitAmount: debitCases.reduce((sum, d) => sum + (d.current_amount || 0), 0),
      collectedAmount: debitCases.reduce((sum, d) => sum + (d.collected_amount || 0), 0),
      // AI & Automation
      activeWorkflows: workflowRules.filter(w => w.is_active).length,
      pendingDecisions: aiDecisions.filter(d => d.status === 'pending').length,
      pendingRecommendations: aiRecommendations.filter(r => r.status === 'pending').length,
      // Opportunities
      totalOpportunities: opportunities.length,
      openOpportunities: opportunities.filter(o => o.status === 'open').length,
    },
    clients: clients.map(c => ({
      name: c.client_name,
      status: c.status,
      sales_stage: c.sales_stage,
      contract_value: c.contract_value,
      revenue_to_date: c.revenue_to_date,
      industry: c.industry,
      follow_up_needed: c.follow_up_needed,
      last_contact: c.last_contact,
    })),
    tasks: tasks.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      due_date: t.due_date,
      assigned_to: t.assigned_to,
    })),
    salesmen: salesmen.map(s => ({
      id: s.id,
      name: s.name,
      status: s.status,
      territory: s.territory,
      target_monthly: s.target_monthly,
      target_quarterly: s.target_quarterly,
      target_annual: s.target_annual,
      commission_rate: s.commission_rate,
    })),
    quotes: quotes.map(q => ({
      title: q.title,
      status: q.status,
      total: q.total,
      client_id: q.client_id,
      created_at: q.created_at,
    })),
    invoices: invoices.map(i => ({
      invoice_number: i.invoice_number,
      status: i.status,
      amount: i.amount,
      total_amount: i.total_amount,
      issue_date: i.issue_date,
      due_date: i.due_date,
      paid_date: i.paid_date,
    })),
    supportTickets: supportTickets.map(t => ({
      title: t.title,
      status: t.status,
      priority: t.priority,
      category: t.category,
      created_at: t.created_at,
    })),
    debitCases: debitCases.map(d => ({
      title: d.title,
      status: d.status,
      stage: d.stage,
      original_amount: d.original_amount,
      current_amount: d.current_amount,
      collected_amount: d.collected_amount,
      due_date: d.due_date,
    })),
    opportunities: opportunities.map(o => ({
      title: o.title,
      status: o.status,
      sales_stage: o.sales_stage,
      value: o.value,
      deal_probability: o.deal_probability,
      expected_close_date: o.expected_close_date,
    })),
    aiRecommendations: aiRecommendations.slice(0, 10).map(r => ({
      title: r.title,
      category: r.category,
      priority: r.priority,
      status: r.status,
    })),
    aiDecisions: aiDecisions.slice(0, 10).map(d => ({
      title: d.title,
      status: d.status,
      final_decision: d.final_decision,
    })),
    workflowRules: workflowRules.filter(w => w.is_active).map(w => ({
      name: w.name,
      trigger_type: w.trigger_type,
      action_type: w.action_type,
    })),
    kpis: kpis.map(k => ({
      name: k.name,
      target: k.target_value,
      unit: k.unit,
      description: k.description,
    })),
    roadmaps: roadmaps.map(r => ({
      title: r.title,
      status: r.status,
      start_date: r.start_date,
      end_date: r.end_date,
    })),
    departments: departments.map(d => ({
      name: d.name,
      budget: d.budget,
    })),
    upcomingEvents: events.filter(e => new Date(e.start_datetime) > new Date()).slice(0, 10).map(e => ({
      title: e.title,
      type: e.event_type,
      date: e.start_datetime,
    })),
    aiConfig: activeConfig ? {
      personality: activeConfig.personality,
      rules: activeConfig.rules,
    } : null,
    companyPolicies: policies.filter(p => p.is_active).map(p => ({
      title: p.title,
      category: p.category,
      content: p.content,
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
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 402) {
          throw new Error('AI credits depleted. Please add credits to continue.');
        }
        throw new Error(errorData.error || 'AI service error');
      }

      if (!response.body) throw new Error('No response stream');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

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
      { role: 'assistant', content: 'Hello! I\'m your AI CRM assistant with full access to your organization\'s data including clients, tasks, employees, salesmen, quotes, KPIs, roadmaps, and company policies. How can I help you analyze your business today?' }
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
                <p className="text-xs text-muted-foreground">
                  Powered by Gemini • Full CRM + Policies context
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4 max-w-4xl mx-auto">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-br-md' 
                      : 'bg-muted/50 rounded-bl-md border border-border/50'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    )}
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
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">Analyzing data...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <CardContent className="border-t border-border/50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about clients, tasks, salesmen, KPIs, roadmaps, policies..."
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
          {/* AI Config Info */}
          {activeConfig && (
            <Card className="p-4 bg-card/50 border-border/50">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">AI Personality</h3>
              </div>
              <p className="text-xs text-muted-foreground">{activeConfig.personality || 'Default assistant'}</p>
              {activeConfig.rules && Array.isArray(activeConfig.rules) && activeConfig.rules.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium">Rules: {(activeConfig.rules as string[]).length}</p>
                </div>
              )}
            </Card>
          )}

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
                <span className="text-muted-foreground">Quotes</span>
                <Badge variant="secondary">{quotes.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Salesmen</span>
                <Badge variant="secondary">{salesmen.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">KPIs</span>
                <Badge variant="secondary">{kpis.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Roadmaps</span>
                <Badge variant="secondary">{roadmaps.length}</Badge>
              </div>
            </div>
          </Card>

          {/* Policies Info */}
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-amber-400" />
              <h3 className="font-semibold text-sm">Active Policies</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              {policies.filter(p => p.is_active).length} policies loaded for context
            </p>
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
