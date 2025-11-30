import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Network, FileJson, Table2, ArrowLeft, Workflow, Activity, RefreshCw, Radio, Bot, Play, Trash2, Send, Clock, CheckCircle, XCircle, AlertCircle, Zap, MessageSquare, Settings, Code2, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
interface RequestLog {
  id: string;
  timestamp: Date;
  method: string;
  url: string;
  status: number;
  duration: number;
  requestBody?: any;
  responseBody?: any;
  error?: string;
}

interface AITestResult {
  id: string;
  timestamp: Date;
  input: string;
  output: string;
  duration: number;
  tokens?: number;
  status: 'success' | 'error';
}

// Database schema definition
const databaseSchema = {
  clients: {
    columns: ['id', 'client_name', 'contact_person', 'email', 'phone', 'industry', 'status', 'sales_stage', 'contract_value', 'salesman_id'],
    relations: [{ to: 'salesmen', column: 'salesman_id' }]
  },
  salesmen: {
    columns: ['id', 'name', 'email', 'phone', 'status', 'territory', 'commission_rate', 'employee_id'],
    relations: [{ to: 'employees', column: 'employee_id' }]
  },
  employees: {
    columns: ['id', 'user_id', 'department_id', 'manager_id', 'position', 'status', 'hire_date'],
    relations: [{ to: 'departments', column: 'department_id' }, { to: 'employees', column: 'manager_id' }]
  },
  departments: {
    columns: ['id', 'name', 'description', 'head_id', 'parent_department_id', 'budget'],
    relations: [{ to: 'departments', column: 'parent_department_id' }]
  },
  quotes: {
    columns: ['id', 'title', 'client_id', 'salesman_id', 'status', 'subtotal', 'total', 'components'],
    relations: [{ to: 'clients', column: 'client_id' }, { to: 'salesmen', column: 'salesman_id' }]
  },
  tasks: {
    columns: ['id', 'title', 'description', 'status', 'priority', 'assigned_to', 'department_id', 'due_date'],
    relations: [{ to: 'employees', column: 'assigned_to' }, { to: 'departments', column: 'department_id' }]
  },
  calendar_events: {
    columns: ['id', 'title', 'start_datetime', 'end_datetime', 'event_type', 'client_id', 'salesman_id'],
    relations: [{ to: 'clients', column: 'client_id' }, { to: 'salesmen', column: 'salesman_id' }]
  },
  call_logs: {
    columns: ['id', 'client_id', 'call_type', 'call_date', 'call_duration', 'summary'],
    relations: [{ to: 'clients', column: 'client_id' }]
  },
  reminders: {
    columns: ['id', 'title', 'due_date', 'priority', 'is_completed', 'related_client_id', 'related_salesman_id'],
    relations: [{ to: 'clients', column: 'related_client_id' }, { to: 'salesmen', column: 'related_salesman_id' }]
  },
  workflow_rules: {
    columns: ['id', 'name', 'trigger_type', 'action_type', 'is_active', 'trigger_config', 'action_config'],
    relations: []
  },
  workflow_logs: {
    columns: ['id', 'workflow_rule_id', 'trigger_event', 'action_taken', 'status', 'created_at'],
    relations: [{ to: 'workflow_rules', column: 'workflow_rule_id' }]
  },
  activity_logs: {
    columns: ['id', 'entity_type', 'entity_id', 'activity_type', 'description', 'performed_by'],
    relations: []
  },
  ai_logs: {
    columns: ['id', 'role', 'content', 'context', 'conversation_id', 'user_id', 'created_at'],
    relations: []
  },
  ai_recommendations: {
    columns: ['id', 'title', 'description', 'category', 'priority', 'status', 'context'],
    relations: []
  },
  ai_decisions: {
    columns: ['id', 'title', 'description', 'options', 'ai_analysis', 'status', 'final_decision'],
    relations: []
  }
};

// Generate nodes for React Flow
const generateNodes = (): Node[] => {
  const tables = Object.keys(databaseSchema);
  const cols = 4;
  const nodeWidth = 280;
  const nodeHeight = 200;
  const gapX = 100;
  const gapY = 80;

  return tables.map((table, index) => ({
    id: table,
    position: {
      x: (index % cols) * (nodeWidth + gapX) + 50,
      y: Math.floor(index / cols) * (nodeHeight + gapY) + 50
    },
    data: {
      label: (
        <div className="p-3 min-w-[250px]">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
            <Table2 className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm">{table}</span>
          </div>
          <div className="text-xs space-y-1 max-h-[120px] overflow-y-auto">
            {databaseSchema[table as keyof typeof databaseSchema].columns.slice(0, 6).map((col) => (
              <div key={col} className="flex items-center gap-1 text-muted-foreground">
                <span className={col === 'id' ? 'text-yellow-500' : col.endsWith('_id') ? 'text-blue-400' : ''}>
                  {col}
                </span>
              </div>
            ))}
            {databaseSchema[table as keyof typeof databaseSchema].columns.length > 6 && (
              <div className="text-muted-foreground/60">
                +{databaseSchema[table as keyof typeof databaseSchema].columns.length - 6} more...
              </div>
            )}
          </div>
        </div>
      )
    },
    type: 'default',
    sourcePosition: Position.Right,
    targetPosition: Position.Left,
    style: {
      background: 'hsl(var(--card))',
      border: '1px solid hsl(var(--border))',
      borderRadius: '8px',
      padding: 0,
    }
  }));
};

// Generate edges for React Flow
const generateEdges = (): Edge[] => {
  const edges: Edge[] = [];
  Object.entries(databaseSchema).forEach(([table, schema]) => {
    schema.relations.forEach((rel, idx) => {
      if (rel.to !== table) {
        edges.push({
          id: `${table}-${rel.to}-${idx}`,
          source: table,
          target: rel.to,
          animated: true,
          style: { stroke: 'hsl(var(--primary))' },
          label: rel.column,
          labelStyle: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' }
        });
      }
    });
  });
  return edges;
};

// AI Communication Types
const aiCommunicationTypes = [
  {
    id: 'chat',
    name: 'Chat Completion',
    description: 'General conversational AI for CRM assistance',
    endpoint: '/functions/v1/ai-chat',
    method: 'POST',
    model: 'google/gemini-2.5-flash',
    features: ['Streaming responses', 'Context awareness', 'CRM data analysis'],
    exampleInput: {
      messages: [{ role: 'user', content: 'What are our top performing clients this month?' }],
      context: { summary: { totalClients: 20, activeClients: 15, totalRevenue: 2500000 } }
    },
    exampleOutput: 'Based on the CRM data, your top performing clients this month are:\n\n1. **Global Finance Corp** - $650,000 revenue\n2. **RetailMax Global** - $480,000 revenue\n3. **TechVentures Inc** - $380,000 revenue'
  },
  {
    id: 'recommendations',
    name: 'AI Recommendations',
    description: 'Generate actionable business recommendations',
    endpoint: '/ai_recommendations',
    method: 'GET/POST',
    model: 'Stored Analysis',
    features: ['Priority scoring', 'Category grouping', 'Status tracking'],
    exampleInput: { category: 'sales', priority: 'high' },
    exampleOutput: { title: 'Follow up with high-value prospects', description: 'Contact EduTech Solutions about budget approval', priority: 'high', status: 'pending' }
  },
  {
    id: 'decisions',
    name: 'AI Decision Support',
    description: 'Multi-option analysis with risk assessment',
    endpoint: '/ai_decisions',
    method: 'GET/POST',
    model: 'Stored Analysis',
    features: ['Option comparison', 'Risk scoring', 'Confidence metrics'],
    exampleInput: { title: 'Contract renewal strategy', options: ['Standard renewal', 'Upsell package', 'Custom negotiation'] },
    exampleOutput: { ai_analysis: { recommendation: 'Upsell package', confidence: 0.85, risk_score: 0.2, advantages: ['Higher revenue', 'Client retention'], disadvantages: ['May face resistance'] } }
  }
];

// Realistic test data for Swagger
const testDataTemplates: Record<string, any> = {
  clients: {
    client_name: 'Test Corp International',
    contact_person: 'John Test',
    email: 'john.test@testcorp.com',
    phone: '+1 555 TEST 001',
    industry: 'Technology',
    status: 'prospect',
    sales_stage: 'pre_sales',
    contract_value: 75000,
    notes: '[DEV-TEST] Auto-created test record - will be reverted'
  },
  tasks: {
    title: '[DEV-TEST] Sample Task',
    description: 'This is a test task created from Dev Tools - will be reverted',
    status: 'todo',
    priority: 'medium',
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  reminders: {
    title: '[DEV-TEST] Test Reminder',
    description: 'Auto-created test reminder - will be reverted',
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    reminder_type: 'general',
    priority: 'low',
    is_completed: false
  },
  activity_logs: {
    entity_type: 'test',
    entity_id: '00000000-0000-0000-0000-000000000000',
    activity_type: 'dev_test',
    description: '[DEV-TEST] Test activity log entry - will be reverted'
  }
};

// Table counts hook
function useTableCounts() {
  return useQuery({
    queryKey: ['table-counts-devtools'],
    queryFn: async () => {
      const tables = ['clients', 'salesmen', 'quotes', 'tasks', 'calendar_events', 'call_logs', 
                      'employees', 'departments', 'reminders', 'workflow_rules', 'activity_logs',
                      'kpi_definitions', 'roadmaps', 'milestones', 'sales_performance', 'ai_logs', 'ai_recommendations', 'ai_decisions'];
      const counts: Record<string, number> = {};
      
      for (const table of tables) {
        const { count } = await supabase.from(table as any).select('*', { count: 'exact', head: true });
        counts[table] = count || 0;
      }
      
      return counts;
    }
  });
}

// Recent activity hook
function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity-devtools'],
    queryFn: async () => {
      const { data } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    }
  });
}

// Request Monitor Component
function RequestMonitor() {
  const [requests, setRequests] = useState<RequestLog[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const originalFetch = useRef<typeof fetch | null>(null);

  useEffect(() => {
    if (!isRecording) return;

    // Store original fetch
    originalFetch.current = window.fetch;

    // Intercept fetch requests
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
      const method = (args[1]?.method || 'GET').toUpperCase();
      
      // Only track Supabase requests
      if (!url.includes('supabase.co')) {
        return originalFetch.current!(...args);
      }

      const requestId = crypto.randomUUID();
      let requestBody: any;
      try {
        requestBody = args[1]?.body ? JSON.parse(args[1].body as string) : undefined;
      } catch { requestBody = args[1]?.body; }

      try {
        const response = await originalFetch.current!(...args);
        const duration = Date.now() - startTime;
        
        let responseBody: any;
        const clonedResponse = response.clone();
        try {
          responseBody = await clonedResponse.json();
        } catch { responseBody = await clonedResponse.text(); }

        setRequests(prev => [{
          id: requestId,
          timestamp: new Date(),
          method,
          url: url.replace(/https:\/\/[^/]+/, ''),
          status: response.status,
          duration,
          requestBody,
          responseBody: Array.isArray(responseBody) ? `[${responseBody.length} items]` : responseBody
        }, ...prev.slice(0, 99)]);

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        setRequests(prev => [{
          id: requestId,
          timestamp: new Date(),
          method,
          url: url.replace(/https:\/\/[^/]+/, ''),
          status: 0,
          duration,
          requestBody,
          error: error instanceof Error ? error.message : 'Unknown error'
        }, ...prev.slice(0, 99)]);
        throw error;
      }
    };

    return () => {
      if (originalFetch.current) {
        window.fetch = originalFetch.current;
      }
    };
  }, [isRecording]);

  const filteredRequests = useMemo(() => {
    if (filter === 'all') return requests;
    if (filter === 'errors') return requests.filter(r => r.status >= 400 || r.status === 0);
    return requests.filter(r => r.method === filter);
  }, [requests, filter]);

  const getStatusColor = (status: number) => {
    if (status === 0) return 'text-red-500';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400) return 'text-red-500';
    return 'text-yellow-500';
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-500/20 text-green-500';
      case 'POST': return 'bg-blue-500/20 text-blue-500';
      case 'PATCH': return 'bg-yellow-500/20 text-yellow-500';
      case 'DELETE': return 'bg-red-500/20 text-red-500';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Radio className={`h-5 w-5 ${isRecording ? 'text-red-500 animate-pulse' : 'text-muted-foreground'}`} />
              Live Request Monitor
            </CardTitle>
            <CardDescription>Real-time tracking of all API requests</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="errors">Errors</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant={isRecording ? 'destructive' : 'default'} 
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
            >
              {isRecording ? 'Stop' : 'Start'}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setRequests([])}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px]">
          {filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Network className="h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 text-muted-foreground">
                {isRecording ? 'Waiting for requests... Interact with the app to see them here.' : 'Recording paused'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredRequests.map((req) => (
                <div key={req.id} className="rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Badge className={getMethodColor(req.method)}>{req.method}</Badge>
                    <code className="text-xs flex-1 truncate">{req.url}</code>
                    <span className={`text-sm font-mono ${getStatusColor(req.status)}`}>
                      {req.status || 'ERR'}
                    </span>
                    <span className="text-xs text-muted-foreground">{req.duration}ms</span>
                    <span className="text-xs text-muted-foreground">
                      {req.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {req.error && (
                    <div className="mt-2 text-xs text-red-500">{req.error}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// AI Agent Visualization Component
function AIAgentVisualization() {
  const [selectedType, setSelectedType] = useState(aiCommunicationTypes[0]);
  const [testInput, setTestInput] = useState('');
  const [testResults, setTestResults] = useState<AITestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTest = async () => {
    if (!testInput.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    const testId = crypto.randomUUID();

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: testInput }],
          context: { summary: { totalClients: 20, totalRevenue: 2500000 } }
        }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const json = JSON.parse(line.slice(6));
                const content = json.choices?.[0]?.delta?.content;
                if (content) fullResponse += content;
              } catch {}
            }
          }
        }
      }

      setTestResults(prev => [{
        id: testId,
        timestamp: new Date(),
        input: testInput,
        output: fullResponse || 'No response received',
        duration: Date.now() - startTime,
        status: 'success'
      }, ...prev.slice(0, 9)]);

      toast.success('Test completed successfully');
    } catch (error) {
      setTestResults(prev => [{
        id: testId,
        timestamp: new Date(),
        input: testInput,
        output: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
        status: 'error'
      }, ...prev.slice(0, 9)]);
      toast.error('Test failed');
    } finally {
      setIsLoading(false);
      setTestInput('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Communication Types Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {aiCommunicationTypes.map((type) => (
          <Card 
            key={type.id} 
            className={`cursor-pointer transition-all ${selectedType.id === type.id ? 'ring-2 ring-primary' : 'hover:border-primary/50'}`}
            onClick={() => setSelectedType(type)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                {type.id === 'chat' && <MessageSquare className="h-4 w-4 text-primary" />}
                {type.id === 'recommendations' && <Zap className="h-4 w-4 text-yellow-500" />}
                {type.id === 'decisions' && <Settings className="h-4 w-4 text-blue-500" />}
                {type.name}
              </CardTitle>
              <CardDescription className="text-xs">{type.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{type.method}</Badge>
                  <code className="text-xs text-muted-foreground truncate">{type.endpoint}</code>
                </div>
                <div className="flex flex-wrap gap-1">
                  {type.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Type Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {selectedType.name} - Details
          </CardTitle>
          <CardDescription>Model: {selectedType.model}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ArrowRight className="h-4 w-4 text-blue-500" />
                Example Input
              </h4>
              <pre className="p-3 rounded-lg bg-muted text-xs overflow-auto max-h-[200px]">
                {JSON.stringify(selectedType.exampleInput, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4 text-green-500" />
                Example Output
              </h4>
              <pre className="p-3 rounded-lg bg-muted text-xs overflow-auto max-h-[200px] whitespace-pre-wrap">
                {typeof selectedType.exampleOutput === 'string' 
                  ? selectedType.exampleOutput 
                  : JSON.stringify(selectedType.exampleOutput, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Test Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            Live AI Test
          </CardTitle>
          <CardDescription>Send a test message to the AI agent</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Enter your test message... (e.g., 'What are our top clients?')"
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              className="flex-1"
              rows={2}
            />
            <Button onClick={runTest} disabled={isLoading} className="self-end">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {testResults.length > 0 && (
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {testResults.map((result) => (
                  <div key={result.id} className={`rounded-lg border p-3 ${result.status === 'error' ? 'border-red-500/50' : ''}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {result.timestamp.toLocaleTimeString()} • {result.duration}ms
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="font-semibold text-blue-500">Input:</span> {result.input}
                      </div>
                      <div className="text-sm">
                        <span className="font-semibold text-green-500">Output:</span>
                        <pre className="mt-1 p-2 rounded bg-muted text-xs whitespace-pre-wrap">{result.output}</pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Enhanced Swagger Component
function EnhancedSwagger() {
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('clients');
  const [testData, setTestData] = useState<string>('');
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [revertCountdown, setRevertCountdown] = useState<number | null>(null);
  const [createdIds, setCreatedIds] = useState<string[]>([]);

  useEffect(() => {
    if (testDataTemplates[selectedEndpoint]) {
      setTestData(JSON.stringify(testDataTemplates[selectedEndpoint], null, 2));
    } else {
      setTestData('{}');
    }
  }, [selectedEndpoint]);

  useEffect(() => {
    if (revertCountdown === null) return;
    if (revertCountdown <= 0) {
      revertTestData();
      return;
    }
    const timer = setTimeout(() => setRevertCountdown(revertCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [revertCountdown]);

  const runEndpointTest = async (method: 'GET' | 'POST') => {
    setIsLoading(true);
    setTestResult(null);

    try {
      if (method === 'GET') {
        const { data, error } = await supabase.from(selectedEndpoint as any).select('*').limit(5);
        if (error) throw error;
        setTestResult({ success: true, data, count: data?.length });
      } else {
        const body = JSON.parse(testData);
        const { data, error } = await supabase.from(selectedEndpoint as any).insert(body).select().single();
        if (error) throw error;
        
        const insertedData = data as any;
        setCreatedIds(prev => [...prev, insertedData.id]);
        setTestResult({ success: true, data: insertedData, message: 'Record created - will be reverted in 10 seconds' });
        setRevertCountdown(10);
        toast.success('Test record created - auto-reverting in 10 seconds');
      }
    } catch (error) {
      setTestResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
      toast.error('Test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const revertTestData = async () => {
    for (const id of createdIds) {
      try {
        await supabase.from(selectedEndpoint as any).delete().eq('id', id);
      } catch (e) {
        console.error('Revert failed for id:', id);
      }
    }
    setCreatedIds([]);
    setRevertCountdown(null);
    toast.success('Test data reverted successfully');
  };

  const endpoints = Object.keys(databaseSchema);

  return (
    <div className="space-y-6">
      {/* Endpoint Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Interactive API Testing
          </CardTitle>
          <CardDescription>
            Test endpoints with realistic data - POST requests auto-revert after 10 seconds
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedEndpoint} onValueChange={setSelectedEndpoint}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select endpoint" />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((ep) => (
                  <SelectItem key={ep} value={ep}>{ep}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => runEndpointTest('GET')} disabled={isLoading}>
              <Badge className="bg-green-500/20 text-green-500 mr-2">GET</Badge>
              Fetch Data
            </Button>
            <Button 
              onClick={() => runEndpointTest('POST')} 
              disabled={isLoading || revertCountdown !== null}
            >
              <Badge className="bg-blue-500/20 text-blue-500 mr-2">POST</Badge>
              Create Test Record
            </Button>
            {revertCountdown !== null && (
              <div className="flex items-center gap-2 text-yellow-500">
                <Clock className="h-4 w-4 animate-pulse" />
                <span>Reverting in {revertCountdown}s</span>
                <Button variant="ghost" size="sm" onClick={revertTestData}>
                  Revert Now
                </Button>
              </div>
            )}
          </div>

          {/* Request Body Editor */}
          <div>
            <h4 className="text-sm font-semibold mb-2">Request Body (for POST)</h4>
            <Textarea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              className="font-mono text-xs"
              rows={8}
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`rounded-lg border p-4 ${testResult.success ? 'border-green-500/50' : 'border-red-500/50'}`}>
              <div className="flex items-center gap-2 mb-2">
                {testResult.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-semibold">
                  {testResult.success ? 'Success' : 'Error'}
                </span>
                {testResult.message && (
                  <Badge variant="outline" className="text-yellow-500">{testResult.message}</Badge>
                )}
              </div>
              <ScrollArea className="h-[200px]">
                <pre className="text-xs p-2 rounded bg-muted overflow-auto">
                  {JSON.stringify(testResult.data || testResult.error, null, 2)}
                </pre>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card>
        <CardHeader>
          <CardTitle>API Reference</CardTitle>
          <CardDescription>Available operations for /{selectedEndpoint}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
              <Badge className="bg-green-500/20 text-green-500 w-16 justify-center">GET</Badge>
              <code className="text-sm flex-1">/{selectedEndpoint}?select=*&limit=10</code>
              <span className="text-xs text-muted-foreground">Fetch records with optional filters</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
              <Badge className="bg-blue-500/20 text-blue-500 w-16 justify-center">POST</Badge>
              <code className="text-sm flex-1">/{selectedEndpoint}</code>
              <span className="text-xs text-muted-foreground">Create a new record</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
              <Badge className="bg-yellow-500/20 text-yellow-500 w-16 justify-center">PATCH</Badge>
              <code className="text-sm flex-1">/{selectedEndpoint}?id=eq.&#123;id&#125;</code>
              <span className="text-xs text-muted-foreground">Update an existing record</span>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
              <Badge className="bg-red-500/20 text-red-500 w-16 justify-center">DELETE</Badge>
              <code className="text-sm flex-1">/{selectedEndpoint}?id=eq.&#123;id&#125;</code>
              <span className="text-xs text-muted-foreground">Delete a record</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DevToolsPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(generateNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(generateEdges());
  const { data: tableCounts, isLoading: countsLoading, refetch: refetchCounts } = useTableCounts();
  const { data: recentActivity, isLoading: activityLoading, refetch: refetchActivity } = useRecentActivity();

  const totalRecords = useMemo(() => {
    if (!tableCounts) return 0;
    return Object.values(tableCounts).reduce((a, b) => a + b, 0);
  }, [tableCounts]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Link to="/crm">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Developer Tools</h1>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Table2 className="h-3 w-3" />
              {Object.keys(databaseSchema).length} Tables
            </Badge>
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              {totalRecords.toLocaleString()} Records
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6">
        <Tabs defaultValue="schema" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
            <TabsTrigger value="schema" className="gap-2">
              <Database className="h-4 w-4" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="monitor" className="gap-2">
              <Radio className="h-4 w-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="ai-agent" className="gap-2">
              <Bot className="h-4 w-4" />
              AI Agent
            </TabsTrigger>
            <TabsTrigger value="swagger" className="gap-2">
              <FileJson className="h-4 w-4" />
              Swagger
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="gap-2">
              <Network className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Workflow className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Schema Tab */}
          <TabsContent value="schema" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div className="lg:col-span-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Database Schema Visualization
                    </CardTitle>
                    <CardDescription>
                      Interactive diagram showing all tables and their relationships
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="h-[600px] w-full border-t">
                      <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        fitView
                        attributionPosition="bottom-left"
                      >
                        <Controls />
                        <MiniMap 
                          nodeColor="hsl(var(--primary))"
                          maskColor="hsl(var(--background) / 0.8)"
                        />
                        <Background gap={20} size={1} />
                      </ReactFlow>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Table Statistics</CardTitle>
                      <Button variant="ghost" size="icon" onClick={() => refetchCounts()}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2">
                        {countsLoading ? (
                          <div className="text-sm text-muted-foreground">Loading...</div>
                        ) : tableCounts && Object.entries(tableCounts)
                          .sort(([,a], [,b]) => b - a)
                          .map(([table, count]) => (
                            <div key={table} className="flex items-center justify-between py-1 text-sm">
                              <span className="font-mono text-xs">{table}</span>
                              <Badge variant="secondary">{count}</Badge>
                            </div>
                          ))
                        }
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Monitor Tab */}
          <TabsContent value="monitor">
            <RequestMonitor />
          </TabsContent>

          {/* AI Agent Tab */}
          <TabsContent value="ai-agent">
            <AIAgentVisualization />
          </TabsContent>

          {/* Swagger Tab */}
          <TabsContent value="swagger">
            <EnhancedSwagger />
          </TabsContent>

          {/* Endpoints Tab */}
          <TabsContent value="endpoints" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Object.keys(databaseSchema).map((table) => (
                <Card key={table}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Table2 className="h-4 w-4 text-primary" />
                      {table}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-500">GET</Badge>
                      <code className="text-xs text-muted-foreground">/{table}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-500/20 text-blue-500">POST</Badge>
                      <code className="text-xs text-muted-foreground">/{table}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-yellow-500/20 text-yellow-500">PATCH</Badge>
                      <code className="text-xs text-muted-foreground">/{table}?id=eq.&#123;id&#125;</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-red-500/20 text-red-500">DELETE</Badge>
                      <code className="text-xs text-muted-foreground">/{table}?id=eq.&#123;id&#125;</code>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent System Activity
                    </CardTitle>
                    <CardDescription>Real-time activity and event log</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => refetchActivity()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  {activityLoading ? (
                    <div className="text-sm text-muted-foreground">Loading activity...</div>
                  ) : recentActivity && recentActivity.length > 0 ? (
                    <div className="space-y-3">
                      {recentActivity.map((activity: any) => (
                        <div key={activity.id} className="flex items-start gap-3 rounded-lg border p-3">
                          <div className="rounded-full bg-primary/10 p-2">
                            <Activity className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{activity.activity_type}</Badge>
                              <Badge variant="secondary">{activity.entity_type}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {activity.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground/60">
                              {new Date(activity.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Activity className="h-12 w-12 text-muted-foreground/30" />
                      <p className="mt-4 text-muted-foreground">No recent activity recorded</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
