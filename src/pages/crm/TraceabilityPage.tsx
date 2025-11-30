import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useAuditLogs, TraceabilityFilters } from '@/hooks/useTraceability';
import { useClients } from '@/hooks/useClients';
import { useQuotes } from '@/hooks/useQuotes';
import { useSalesmen } from '@/hooks/useSalesmen';
import { useTasks } from '@/hooks/useTasks';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, Filter, Download, Database, RefreshCw, Activity,
  Users, FileText, Calendar, CheckSquare, DollarSign, Loader2
} from 'lucide-react';
import { format } from 'date-fns';

const TABLE_OPTIONS = [
  { value: 'clients', label: 'Clients', icon: Users },
  { value: 'quotes', label: 'Quotes', icon: FileText },
  { value: 'salesmen', label: 'Salesmen', icon: DollarSign },
  { value: 'tasks', label: 'Tasks', icon: CheckSquare },
  { value: 'calendar_events', label: 'Events', icon: Calendar },
];

export default function TraceabilityPage() {
  const { data: clients = [] } = useClients();
  const { data: quotes = [] } = useQuotes();
  const { data: salesmen = [] } = useSalesmen();
  const { data: tasks = [] } = useTasks();
  const { data: events = [] } = useCalendarEvents();

  const [activeTable, setActiveTable] = useState('clients');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Get data based on active table
  const getTableData = () => {
    switch (activeTable) {
      case 'clients': return clients;
      case 'quotes': return quotes;
      case 'salesmen': return salesmen;
      case 'tasks': return tasks;
      case 'calendar_events': return events;
      default: return [];
    }
  };

  const data = getTableData();

  // Filter data
  const filteredData = data.filter((item: any) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchLower)
    );
  });

  // Get columns based on active table
  const getColumns = () => {
    switch (activeTable) {
      case 'clients':
        return ['client_name', 'email', 'phone', 'status', 'sales_stage', 'contract_value', 'created_at'];
      case 'quotes':
        return ['title', 'status', 'subtotal', 'total', 'valid_until', 'created_at'];
      case 'salesmen':
        return ['name', 'email', 'phone', 'territory', 'status', 'commission_rate', 'created_at'];
      case 'tasks':
        return ['title', 'status', 'priority', 'due_date', 'created_at'];
      case 'calendar_events':
        return ['title', 'event_type', 'start_datetime', 'end_datetime', 'location'];
      default:
        return [];
    }
  };

  const columns = getColumns();

  const formatCellValue = (value: any, column: string) => {
    if (value === null || value === undefined) return '-';
    if (column.includes('date') || column.includes('datetime') || column === 'created_at') {
      try {
        return format(new Date(value), 'MMM d, yyyy HH:mm');
      } catch {
        return value;
      }
    }
    if (column === 'contract_value' || column === 'total' || column === 'subtotal') {
      return `$${Number(value).toLocaleString()}`;
    }
    if (column === 'commission_rate') {
      return `${value}%`;
    }
    return String(value);
  };

  const exportToCSV = () => {
    const headers = columns.join(',');
    const rows = filteredData.map((item: any) => 
      columns.map(col => JSON.stringify(item[col] ?? '')).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeTable}_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  return (
    <CRMLayout title="Traceability">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Data Traceability</h2>
            <p className="text-muted-foreground">View and filter all system data</p>
          </div>
          <Button onClick={exportToCSV} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {TABLE_OPTIONS.map((table) => {
            const count = table.value === 'clients' ? clients.length :
                         table.value === 'quotes' ? quotes.length :
                         table.value === 'salesmen' ? salesmen.length :
                         table.value === 'tasks' ? tasks.length :
                         events.length;
            return (
              <Card 
                key={table.value}
                className={`glass-card cursor-pointer transition-all hover:scale-105 ${
                  activeTable === table.value ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveTable(table.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                      activeTable === table.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <table.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-sm text-muted-foreground">{table.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search all fields..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              
              {activeTable === 'clients' && (
                <>
                  <Select value={filters.status || ''} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="prospect">Prospect</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="former">Former</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.sales_stage || ''} onValueChange={(v) => setFilters({...filters, sales_stage: v})}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Stages</SelectItem>
                      <SelectItem value="pre_sales">Pre-Sales</SelectItem>
                      <SelectItem value="negotiation">Negotiation</SelectItem>
                      <SelectItem value="closing">Closing</SelectItem>
                      <SelectItem value="post_sales">Post-Sales</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              {activeTable === 'tasks' && (
                <>
                  <Select value={filters.status || ''} onValueChange={(v) => setFilters({...filters, status: v})}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filters.priority || ''} onValueChange={(v) => setFilters({...filters, priority: v})}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              )}

              <Button variant="outline" size="icon" onClick={() => { setSearchTerm(''); setFilters({}); }}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Table */}
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                {TABLE_OPTIONS.find(t => t.value === activeTable)?.label} Data
              </CardTitle>
              <Badge variant="secondary">{filteredData.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {columns.map((col) => (
                      <th key={col} className="text-left py-3 px-4 font-medium text-muted-foreground">
                        {col.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 100).map((item: any, index) => (
                    <tr key={item.id || index} className="border-b border-border/50 hover:bg-muted/30">
                      {columns.map((col) => (
                        <td key={col} className="py-3 px-4">
                          {(col === 'status' || col === 'sales_stage' || col === 'priority' || col === 'event_type') ? (
                            <Badge variant="secondary" className="capitalize">
                              {String(item[col]).replace(/_/g, ' ')}
                            </Badge>
                          ) : (
                            <span className="truncate max-w-[200px] block">
                              {formatCellValue(item[col], col)}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No records found
                </div>
              )}
              {filteredData.length > 100 && (
                <div className="py-4 text-center text-muted-foreground text-sm">
                  Showing first 100 of {filteredData.length} records
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </CRMLayout>
  );
}
