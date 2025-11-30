import { useState, useCallback, useMemo } from 'react';
import { ReactFlow, MiniMap, Controls, Background, Node, Edge, Position, useNodesState, useEdgesState } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Database, Network, FileJson, Table2, ArrowLeft, Workflow, Activity, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  kpi_definitions: {
    columns: ['id', 'name', 'description', 'target_value', 'unit', 'department_id'],
    relations: [{ to: 'departments', column: 'department_id' }]
  },
  kpi_records: {
    columns: ['id', 'kpi_id', 'value', 'period_start', 'period_end', 'employee_id'],
    relations: [{ to: 'kpi_definitions', column: 'kpi_id' }, { to: 'employees', column: 'employee_id' }]
  },
  roadmaps: {
    columns: ['id', 'title', 'description', 'status', 'start_date', 'end_date', 'department_id'],
    relations: [{ to: 'departments', column: 'department_id' }]
  },
  milestones: {
    columns: ['id', 'title', 'description', 'target_date', 'progress', 'status', 'department_id'],
    relations: [{ to: 'departments', column: 'department_id' }]
  },
  sales_performance: {
    columns: ['id', 'salesman_id', 'period_start', 'period_end', 'revenue_generated', 'deals_closed'],
    relations: [{ to: 'salesmen', column: 'salesman_id' }]
  },
  profiles: {
    columns: ['id', 'full_name', 'email', 'avatar_url'],
    relations: []
  },
  user_roles: {
    columns: ['id', 'user_id', 'role'],
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
      if (rel.to !== table) { // Avoid self-references for cleaner diagram
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

// Swagger/OpenAPI spec for Supabase
const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'CRM System API',
    version: '1.0.0',
    description: 'RESTful API for the CRM system powered by Supabase'
  },
  servers: [
    {
      url: 'https://dayocrwnmwzdldihmgpy.supabase.co/rest/v1',
      description: 'Production API'
    }
  ],
  paths: {
    '/clients': {
      get: {
        tags: ['Clients'],
        summary: 'Get all clients',
        parameters: [
          { name: 'select', in: 'query', schema: { type: 'string' }, description: 'Columns to select' },
          { name: 'order', in: 'query', schema: { type: 'string' }, description: 'Order by column' },
          { name: 'limit', in: 'query', schema: { type: 'integer' }, description: 'Limit results' }
        ],
        responses: { '200': { description: 'List of clients' } }
      },
      post: {
        tags: ['Clients'],
        summary: 'Create a new client',
        requestBody: { content: { 'application/json': { schema: { type: 'object' } } } },
        responses: { '201': { description: 'Client created' } }
      }
    },
    '/clients?id=eq.{id}': {
      patch: {
        tags: ['Clients'],
        summary: 'Update a client',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Client updated' } }
      },
      delete: {
        tags: ['Clients'],
        summary: 'Delete a client',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Client deleted' } }
      }
    },
    '/salesmen': {
      get: { tags: ['Salesmen'], summary: 'Get all salesmen', responses: { '200': { description: 'List of salesmen' } } },
      post: { tags: ['Salesmen'], summary: 'Create a salesman', responses: { '201': { description: 'Salesman created' } } }
    },
    '/quotes': {
      get: { tags: ['Quotes'], summary: 'Get all quotes', responses: { '200': { description: 'List of quotes' } } },
      post: { tags: ['Quotes'], summary: 'Create a quote', responses: { '201': { description: 'Quote created' } } }
    },
    '/tasks': {
      get: { tags: ['Tasks'], summary: 'Get all tasks', responses: { '200': { description: 'List of tasks' } } },
      post: { tags: ['Tasks'], summary: 'Create a task', responses: { '201': { description: 'Task created' } } }
    },
    '/calendar_events': {
      get: { tags: ['Calendar'], summary: 'Get all events', responses: { '200': { description: 'List of events' } } },
      post: { tags: ['Calendar'], summary: 'Create an event', responses: { '201': { description: 'Event created' } } }
    },
    '/departments': {
      get: { tags: ['Organization'], summary: 'Get all departments', responses: { '200': { description: 'List of departments' } } }
    },
    '/employees': {
      get: { tags: ['Organization'], summary: 'Get all employees', responses: { '200': { description: 'List of employees' } } }
    },
    '/workflow_rules': {
      get: { tags: ['Automation'], summary: 'Get workflow rules', responses: { '200': { description: 'List of workflow rules' } } },
      post: { tags: ['Automation'], summary: 'Create a workflow rule', responses: { '201': { description: 'Rule created' } } }
    },
    '/reminders': {
      get: { tags: ['Automation'], summary: 'Get reminders', responses: { '200': { description: 'List of reminders' } } },
      post: { tags: ['Automation'], summary: 'Create a reminder', responses: { '201': { description: 'Reminder created' } } }
    },
    '/audit_logs': {
      get: { tags: ['Traceability'], summary: 'Get audit logs', responses: { '200': { description: 'List of audit logs' } } }
    },
    '/activity_logs': {
      get: { tags: ['Traceability'], summary: 'Get activity logs', responses: { '200': { description: 'List of activity logs' } } }
    }
  },
  components: {
    securitySchemes: {
      apiKey: { type: 'apiKey', in: 'header', name: 'apikey' },
      bearerAuth: { type: 'http', scheme: 'bearer' }
    }
  },
  security: [{ apiKey: [] }, { bearerAuth: [] }]
};

// Table counts hook
function useTableCounts() {
  return useQuery({
    queryKey: ['table-counts-devtools'],
    queryFn: async () => {
      const tables = ['clients', 'salesmen', 'quotes', 'tasks', 'calendar_events', 'call_logs', 
                      'employees', 'departments', 'reminders', 'workflow_rules', 'activity_logs',
                      'kpi_definitions', 'roadmaps', 'milestones', 'sales_performance'];
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
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="schema" className="gap-2">
              <Database className="h-4 w-4" />
              Schema
            </TabsTrigger>
            <TabsTrigger value="endpoints" className="gap-2">
              <Network className="h-4 w-4" />
              Endpoints
            </TabsTrigger>
            <TabsTrigger value="swagger" className="gap-2">
              <FileJson className="h-4 w-4" />
              Swagger
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

          {/* Swagger Tab */}
          <TabsContent value="swagger">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  API Documentation (Swagger)
                </CardTitle>
                <CardDescription>
                  Interactive API documentation for all available endpoints
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="swagger-wrapper">
                  <SwaggerUI spec={swaggerSpec} />
                </div>
              </CardContent>
            </Card>
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

      {/* Swagger custom styles */}
      <style>{`
        .swagger-wrapper .swagger-ui {
          font-family: inherit;
        }
        .swagger-wrapper .swagger-ui .topbar {
          display: none;
        }
        .swagger-wrapper .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-wrapper .swagger-ui .scheme-container {
          background: hsl(var(--card));
          box-shadow: none;
          border: 1px solid hsl(var(--border));
          border-radius: 8px;
          padding: 16px;
        }
        .swagger-wrapper .swagger-ui .opblock {
          border-radius: 8px;
          border: 1px solid hsl(var(--border));
          box-shadow: none;
        }
        .swagger-wrapper .swagger-ui .opblock .opblock-summary {
          border: none;
        }
        .swagger-wrapper .swagger-ui .btn {
          border-radius: 6px;
        }
      `}</style>
    </div>
  );
}
