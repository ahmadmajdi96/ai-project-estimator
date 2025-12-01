import { useState, useMemo } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useSupportTickets, useUpdateSupportTicket } from '@/hooks/useSupportTickets';
import { useSupportStages } from '@/hooks/useSupportStages';
import { useSupportAgents } from '@/hooks/useSupportAgents';
import { useClients } from '@/hooks/useClients';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Search, Ticket, AlertCircle, Clock, User, LayoutGrid, List, Filter, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#64748b' },
  { value: 'medium', label: 'Medium', color: '#3b82f6' },
  { value: 'high', label: 'High', color: '#f59e0b' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];

export default function SupportPipelinePage() {
  const { data: tickets = [], isLoading } = useSupportTickets();
  const { data: stages = [] } = useSupportStages();
  const { data: agents = [] } = useSupportAgents();
  const { data: clients = [] } = useClients();
  const updateTicket = useUpdateSupportTicket();
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [isDragging, setIsDragging] = useState(false);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ticket.ticket_number?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const ticketsByStage = useMemo(() => {
    const grouped: Record<string, typeof tickets> = {};
    stages.forEach(stage => { grouped[stage.value] = []; });
    filteredTickets.forEach(ticket => {
      const stage = ticket.support_stage || 'new';
      if (grouped[stage]) grouped[stage].push(ticket);
      else if (grouped['new']) grouped['new'].push(ticket);
    });
    return grouped;
  }, [filteredTickets, stages]);

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    if (!result.destination) return;
    const ticketId = result.draggableId;
    const newStage = result.destination.droppableId;
    await updateTicket.mutateAsync({ id: ticketId, support_stage: newStage });
  };

  const getAgent = (agentId: string | null) => agents.find(a => a.id === agentId);
  const getClient = (clientId: string | null) => clients.find(c => c.id === clientId);

  if (isLoading) {
    return <CRMLayout title="Support Pipeline"><div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div></CRMLayout>;
  }

  return (
    <CRMLayout title="Support Pipeline">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Ticket className="h-4 w-4" /><span className="text-sm">Total Tickets</span></div>
            <p className="text-2xl font-bold">{tickets.length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><AlertCircle className="h-4 w-4" /><span className="text-sm">Urgent</span></div>
            <p className="text-2xl font-bold text-red-500">{tickets.filter(t => t.priority === 'urgent').length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><Clock className="h-4 w-4" /><span className="text-sm">In Progress</span></div>
            <p className="text-2xl font-bold text-blue-500">{tickets.filter(t => t.support_stage === 'in_progress').length}</p>
          </Card>
          <Card className="p-4 bg-card/50 border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1"><User className="h-4 w-4" /><span className="text-sm">Unassigned</span></div>
            <p className="text-2xl font-bold text-amber-500">{tickets.filter(t => !t.support_agent_id).length}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card/50 border-border/50">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITIES.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex rounded-lg border border-border overflow-hidden">
              <Button variant={viewMode === 'kanban' ? 'default' : 'ghost'} size="sm" className="rounded-none" onClick={() => setViewMode('kanban')}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="rounded-none border-l border-border" onClick={() => setViewMode('list')}>
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Pipeline View */}
        {viewMode === 'kanban' ? (
          <DragDropContext onDragStart={() => setIsDragging(true)} onDragEnd={handleDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stages.map(stage => (
                <div key={stage.value} className={cn("flex-shrink-0 w-80 rounded-xl border transition-all", isDragging ? "border-dashed border-primary/50" : "border-border/50", "bg-gradient-to-b from-muted/30 to-muted/10")}>
                  <div className="p-4 rounded-t-xl border-b border-border/50" style={{ backgroundColor: `${stage.color}20`, color: stage.color }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        <h3 className="font-semibold">{stage.name}</h3>
                      </div>
                      <Badge variant="secondary" className="bg-background/30">{ticketsByStage[stage.value]?.length || 0}</Badge>
                    </div>
                  </div>
                  <Droppable droppableId={stage.value}>
                    {(provided, snapshot) => (
                      <ScrollArea className={cn("h-[calc(100vh-380px)] p-2 transition-colors rounded-b-xl", snapshot.isDraggingOver && "bg-primary/5")}>
                        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2 min-h-[100px]">
                          {ticketsByStage[stage.value]?.map((ticket, index) => {
                            const priority = PRIORITIES.find(p => p.value === ticket.priority);
                            const agent = getAgent(ticket.support_agent_id);
                            const client = getClient(ticket.client_id);
                            return (
                              <Draggable key={ticket.id} draggableId={ticket.id} index={index}>
                                {(provided, snapshot) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                    <Card className={cn("p-3 cursor-pointer transition-all hover:shadow-lg hover:border-primary/30 bg-card/80", snapshot.isDragging && "shadow-xl ring-2 ring-primary/30")}>
                                      <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-xs text-muted-foreground">{ticket.ticket_number}</span>
                                        <Badge style={{ backgroundColor: `${priority?.color}20`, color: priority?.color }}>{priority?.label}</Badge>
                                      </div>
                                      <h4 className="font-medium text-sm mb-2 line-clamp-2">{ticket.title}</h4>
                                      {client && <p className="text-xs text-muted-foreground mb-2">{client.client_name}</p>}
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>{agent?.name || 'Unassigned'}</span>
                                        <span>{format(new Date(ticket.created_at), 'MMM d')}</span>
                                      </div>
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            );
                          })}
                          {provided.placeholder}
                          {(ticketsByStage[stage.value]?.length || 0) === 0 && (
                            <div className={cn("text-center py-8 text-muted-foreground text-sm rounded-lg border-2 border-dashed", snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" : "border-border/30")}>
                              {snapshot.isDraggingOver ? "Drop here" : "No tickets"}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <div className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Ticket #</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Title</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Client</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Priority</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Stage</th>
                    <th className="text-left p-2 text-sm font-medium text-muted-foreground">Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map(ticket => {
                    const priority = PRIORITIES.find(p => p.value === ticket.priority);
                    const stage = stages.find(s => s.value === ticket.support_stage);
                    const agent = getAgent(ticket.support_agent_id);
                    const client = getClient(ticket.client_id);
                    return (
                      <tr key={ticket.id} className="border-b border-border/50 hover:bg-muted/20">
                        <td className="p-2 font-mono text-sm">{ticket.ticket_number}</td>
                        <td className="p-2 font-medium">{ticket.title}</td>
                        <td className="p-2 text-muted-foreground">{client?.client_name || '-'}</td>
                        <td className="p-2"><Badge style={{ backgroundColor: `${priority?.color}20`, color: priority?.color }}>{priority?.label}</Badge></td>
                        <td className="p-2"><Badge style={{ backgroundColor: `${stage?.color}20`, color: stage?.color }}>{stage?.name}</Badge></td>
                        <td className="p-2 text-muted-foreground">{agent?.name || 'Unassigned'}</td>
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
