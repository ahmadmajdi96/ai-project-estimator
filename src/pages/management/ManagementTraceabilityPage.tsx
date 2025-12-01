import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuditLogs, TraceabilityFilters } from '@/hooks/useTraceability';
import { Database, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const actionColors: Record<string, string> = {
  INSERT: 'bg-green-500/10 text-green-500',
  UPDATE: 'bg-blue-500/10 text-blue-500',
  DELETE: 'bg-red-500/10 text-red-500',
};

export default function ManagementTraceabilityPage() {
  const [filters, setFilters] = useState<TraceabilityFilters>({});
  const [searchTerm, setSearchTerm] = useState('');
  const { data: logs, isLoading } = useAuditLogs(filters);

  const tables = ['employees', 'departments', 'tasks', 'kpi_definitions', 'kpi_records', 'company_documents'];

  const filteredLogs = logs?.filter(log => {
    if (!searchTerm) return true;
    return (
      log.table_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.record_id?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Traceability</h1>
          <p className="text-muted-foreground">Track all changes and audit logs across the system</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-9"
                  />
                </div>
              </div>
              <Select 
                value={filters.table_name || 'all'} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, table_name: v === 'all' ? undefined : v }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Tables" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tables</SelectItem>
                  {tables.map(table => (
                    <SelectItem key={table} value={table}>{table}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={filters.action || 'all'} 
                onValueChange={(v) => setFilters(prev => ({ ...prev, action: v === 'all' ? undefined : v }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="INSERT">Insert</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={filters.date_from || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value || undefined }))}
                className="w-[160px]"
                placeholder="From date"
              />
              <Input
                type="date"
                value={filters.date_to || ''}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value || undefined }))}
                className="w-[160px]"
                placeholder="To date"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Audit Logs
              {filteredLogs && (
                <Badge variant="secondary" className="ml-2">{filteredLogs.length} records</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !filteredLogs?.length ? (
              <p className="text-muted-foreground">No audit logs found</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Record ID</TableHead>
                      <TableHead>Changes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell className="whitespace-nowrap">
                          {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.table_name}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={actionColors[log.action] || ''}>
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.record_id?.slice(0, 8)}...
                        </TableCell>
                        <TableCell className="max-w-[300px]">
                          {log.action === 'UPDATE' && log.old_values && log.new_values ? (
                            <div className="text-xs space-y-1">
                              {Object.keys(log.new_values).slice(0, 3).map(key => {
                                if (log.old_values?.[key] !== log.new_values?.[key]) {
                                  return (
                                    <div key={key} className="flex gap-1">
                                      <span className="font-medium">{key}:</span>
                                      <span className="text-red-500 line-through">{String(log.old_values?.[key]).slice(0, 20)}</span>
                                      <span>→</span>
                                      <span className="text-green-500">{String(log.new_values?.[key]).slice(0, 20)}</span>
                                    </div>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          ) : log.action === 'INSERT' ? (
                            <span className="text-xs text-green-500">New record created</span>
                          ) : log.action === 'DELETE' ? (
                            <span className="text-xs text-red-500">Record deleted</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ManagementLayout>
  );
}
