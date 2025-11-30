import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { EnhancedKanbanBoard } from '@/components/crm/EnhancedKanbanBoard';
import { useClients } from '@/hooks/useClients';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CLIENT_STATUSES, INDUSTRIES } from '@/types/crm';
import { 
  Loader2, 
  Search, 
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';

export default function StatusBoard() {
  const { data: clients = [], isLoading } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  if (isLoading) {
    return (
      <CRMLayout title="Client Status Board">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Client Status Board">
      <div className="space-y-6">
        {/* Filters */}
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {INDUSTRIES.map(industry => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button 
                variant={viewMode === 'kanban' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-none"
                onClick={() => setViewMode('kanban')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm"
                className="rounded-none border-l border-border"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Status Board View */}
        {viewMode === 'kanban' ? (
          <EnhancedKanbanBoard clients={filteredClients} type="status" />
        ) : (
          <Card className="bg-card/50 border-border/50">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Industry</th>
                    <th className="text-right p-2 text-sm font-medium text-muted-foreground">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => {
                    const status = CLIENT_STATUSES.find(s => s.value === client.status);
                    return (
                      <tr key={client.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-2 font-medium">{client.client_name}</td>
                        <td className="p-2 text-muted-foreground">{client.contact_person || '-'}</td>
                        <td className="p-2">
                          <Badge className={status?.color}>{status?.label}</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">{client.industry || '-'}</td>
                        <td className="p-2 text-right font-medium text-primary">
                          ${(client.revenue_to_date || 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </CRMLayout>
  );
}