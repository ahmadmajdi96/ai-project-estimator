import { useState, useMemo } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { ClientsTable } from '@/components/crm/ClientsTable';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { ClientForm } from '@/components/crm/ClientForm';
import { useClients } from '@/hooks/useClients';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Table, Kanban, Filter } from 'lucide-react';
import { INDUSTRIES, Client } from '@/types/crm';

export default function ClientsPage() {
  const { data: clients = [], isLoading } = useClients();
  const [searchQuery, setSearchQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState<string>('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;
      
      return matchesSearch && matchesIndustry;
    });
  }, [clients, searchQuery, industryFilter]);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleCloseForm = (open: boolean) => {
    setFormOpen(open);
    if (!open) setEditingClient(undefined);
  };

  return (
    <CRMLayout title="Clients">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex flex-1 gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {INDUSTRIES.map(ind => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>

        {/* Views */}
        <Tabs defaultValue="table" className="space-y-4">
          <TabsList>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <Table className="h-4 w-4" />
              Table
            </TabsTrigger>
            <TabsTrigger value="status" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              By Status
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="flex items-center gap-2">
              <Kanban className="h-4 w-4" />
              By Pipeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table">
            <ClientsTable clients={filteredClients} onEdit={handleEdit} />
          </TabsContent>

          <TabsContent value="status">
            <KanbanBoard clients={filteredClients} type="status" />
          </TabsContent>

          <TabsContent value="pipeline">
            <KanbanBoard clients={filteredClients} type="sales_stage" />
          </TabsContent>
        </Tabs>
      </div>

      <ClientForm 
        open={formOpen} 
        onOpenChange={handleCloseForm} 
        client={editingClient}
      />
    </CRMLayout>
  );
}
