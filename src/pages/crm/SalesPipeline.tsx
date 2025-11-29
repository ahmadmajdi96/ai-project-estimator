import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { EnhancedKanbanBoard } from '@/components/crm/EnhancedKanbanBoard';
import { useClients } from '@/hooks/useClients';
import { useSalesmen } from '@/hooks/useSalesmen';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { SALES_STAGES, INDUSTRIES } from '@/types/crm';
import { 
  Loader2, 
  Search, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  LayoutGrid,
  List,
  Filter
} from 'lucide-react';

export default function SalesPipeline() {
  const { data: clients = [], isLoading } = useClients();
  const { data: salesmen = [] } = useSalesmen();
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;
    return matchesSearch && matchesIndustry;
  });

  // Calculate pipeline stats
  const totalPipelineValue = filteredClients.reduce((sum, c) => sum + (c.contract_value || 0), 0);
  const avgDealSize = filteredClients.length > 0 ? totalPipelineValue / filteredClients.length : 0;
  const closingClients = filteredClients.filter(c => c.sales_stage === 'closing');
  const closingValue = closingClients.reduce((sum, c) => sum + (c.contract_value || 0), 0);

  if (isLoading) {
    return (
      <CRMLayout title="Sales Pipeline">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Sales Pipeline">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/20">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalPipelineValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Pipeline Value</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <Target className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">${closingValue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Closing Stage</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-purple-500/20">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">${avgDealSize.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Avg Deal Size</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{filteredClients.length}</p>
                <p className="text-sm text-muted-foreground">Active Deals</p>
              </div>
            </div>
          </Card>
        </div>

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

        {/* Stage Legend */}
        <div className="flex flex-wrap gap-2">
          {SALES_STAGES.map(stage => {
            const count = filteredClients.filter(c => c.sales_stage === stage.value).length;
            return (
              <Badge key={stage.value} className={`${stage.color} gap-1`}>
                {stage.label}
                <span className="bg-background/20 px-1.5 rounded-full text-xs">{count}</span>
              </Badge>
            );
          })}
        </div>

        {/* Pipeline View */}
        {viewMode === 'kanban' ? (
          <EnhancedKanbanBoard clients={filteredClients} type="sales_stage" />
        ) : (
          <Card className="bg-card/50 border-border/50">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Contact</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Stage</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Industry</th>
                    <th className="text-right p-2 text-sm font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => {
                    const stage = SALES_STAGES.find(s => s.value === client.sales_stage);
                    return (
                      <tr key={client.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-2 font-medium">{client.client_name}</td>
                        <td className="p-2 text-muted-foreground">{client.contact_person || '-'}</td>
                        <td className="p-2">
                          <Badge className={stage?.color}>{stage?.label}</Badge>
                        </td>
                        <td className="p-2 text-muted-foreground">{client.industry || '-'}</td>
                        <td className="p-2 text-right font-medium text-primary">
                          ${(client.contract_value || 0).toLocaleString()}
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
