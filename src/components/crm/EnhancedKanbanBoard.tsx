import { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Client, CLIENT_STATUSES, SALES_STAGES, ClientStatus, SalesStage } from '@/types/crm';
import { useUpdateClientStatus, useUpdateClientSalesStage } from '@/hooks/useClients';
import { useSalesmen } from '@/hooks/useSalesmen';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  DollarSign, 
  Phone, 
  Mail, 
  TrendingUp,
  GripVertical,
  MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedKanbanBoardProps {
  clients: Client[];
  type: 'status' | 'sales_stage';
}

export function EnhancedKanbanBoard({ clients, type }: EnhancedKanbanBoardProps) {
  const updateStatus = useUpdateClientStatus();
  const updateSalesStage = useUpdateClientSalesStage();
  const { data: salesmen = [] } = useSalesmen();
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);

  const columns = type === 'status' ? CLIENT_STATUSES : SALES_STAGES;

  const groupedClients = useMemo(() => {
    const groups: Record<string, Client[]> = {};
    columns.forEach(col => {
      groups[col.value] = [];
    });
    clients.forEach(client => {
      const key = type === 'status' ? client.status : client.sales_stage;
      if (groups[key]) {
        groups[key].push(client);
      }
    });
    return groups;
  }, [clients, columns, type]);

  const columnStats = useMemo(() => {
    const stats: Record<string, { count: number; value: number }> = {};
    columns.forEach(col => {
      const columnClients = groupedClients[col.value] || [];
      stats[col.value] = {
        count: columnClients.length,
        value: columnClients.reduce((sum, c) => sum + (c.contract_value || 0), 0),
      };
    });
    return stats;
  }, [groupedClients, columns]);

  const totalValue = useMemo(() => 
    clients.reduce((sum, c) => sum + (c.contract_value || 0), 0),
  [clients]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = async (result: DropResult) => {
    setIsDragging(false);
    
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newColumnValue = destination.droppableId;
    
    if (type === 'status') {
      await updateStatus.mutateAsync({ 
        id: draggableId, 
        status: newColumnValue as ClientStatus 
      });
    } else {
      await updateSalesStage.mutateAsync({ 
        id: draggableId, 
        sales_stage: newColumnValue as SalesStage 
      });
    }
  };

  const getColumnIcon = (value: string) => {
    const icons: Record<string, React.ReactNode> = {
      prospect: <User className="h-4 w-4" />,
      active: <TrendingUp className="h-4 w-4" />,
      inactive: <Building2 className="h-4 w-4" />,
      former: <Building2 className="h-4 w-4" />,
      pre_sales: <Phone className="h-4 w-4" />,
      negotiation: <DollarSign className="h-4 w-4" />,
      closing: <ArrowRight className="h-4 w-4" />,
      post_sales: <TrendingUp className="h-4 w-4" />,
      support: <Mail className="h-4 w-4" />,
    };
    return icons[value] || <Building2 className="h-4 w-4" />;
  };

  return (
    <div className="space-y-4">
      {/* Pipeline Header with Total Value */}
      <Card className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {type === 'status' ? 'Total Revenue' : 'Pipeline Value'}
              </p>
              <p className="text-2xl font-bold">${totalValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {columns.map(col => {
              const stats = columnStats[col.value];
              return (
                <Badge key={col.value} className={`${col.color} gap-1`}>
                  {col.label}
                  <span className="bg-background/20 px-1.5 rounded-full text-xs">{stats.count}</span>
                </Badge>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Kanban Board */}
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map(column => (
            <div
              key={column.value}
              className={cn(
                "flex-shrink-0 w-80 rounded-xl border transition-all",
                isDragging ? "border-dashed border-primary/50" : "border-border/50",
                "bg-gradient-to-b from-muted/30 to-muted/10"
              )}
            >
              {/* Column Header */}
              <div className={cn(
                "p-4 rounded-t-xl border-b border-border/50",
                column.color
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getColumnIcon(column.value)}
                    <h3 className="font-semibold">{column.label}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-background/30">
                      {groupedClients[column.value]?.length || 0}
                    </Badge>
                  </div>
                </div>
                <p className="text-xs mt-1 opacity-80">
                  ${columnStats[column.value]?.value.toLocaleString() || 0}
                </p>
              </div>

              {/* Droppable Area */}
              <Droppable droppableId={column.value}>
                {(provided, snapshot) => (
                  <ScrollArea 
                    className={cn(
                      "h-[calc(100vh-380px)] p-2 transition-colors rounded-b-xl",
                      snapshot.isDraggingOver && "bg-primary/5"
                    )}
                  >
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2 min-h-[100px]"
                    >
                      {groupedClients[column.value]?.map((client, index) => (
                        <Draggable 
                          key={client.id} 
                          draggableId={client.id} 
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "group",
                                snapshot.isDragging && "opacity-90"
                              )}
                            >
                              <Card 
                                className={cn(
                                  "p-3 cursor-pointer transition-all",
                                  "hover:shadow-lg hover:border-primary/30",
                                  "bg-card/80 backdrop-blur-sm",
                                  snapshot.isDragging && "shadow-xl ring-2 ring-primary/30 rotate-2"
                                )}
                                onClick={() => navigate(`/crm/clients/${client.id}`)}
                              >
                                {/* Drag Handle */}
                                <div 
                                  {...provided.dragHandleProps}
                                  className="flex items-center justify-between mb-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Avatar className="h-8 w-8 border border-border">
                                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                        {client.client_name.slice(0, 2).toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <MoreHorizontal className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                                </div>

                                {/* Client Info */}
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm line-clamp-1">
                                    {client.client_name}
                                  </h4>
                                  
                                  {client.contact_person && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {client.contact_person}
                                    </p>
                                  )}

                                  {client.industry && (
                                    <Badge variant="outline" className="text-xs">
                                      {client.industry}
                                    </Badge>
                                  )}

                                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                                    <span className="text-xs text-muted-foreground">Value</span>
                                    <span className="font-semibold text-sm text-primary">
                                      ${(client.contract_value || 0).toLocaleString()}
                                    </span>
                                  </div>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {groupedClients[column.value]?.length === 0 && (
                        <div className={cn(
                          "text-center py-8 text-muted-foreground text-sm rounded-lg border-2 border-dashed",
                          snapshot.isDraggingOver ? "border-primary/50 bg-primary/5" : "border-border/30"
                        )}>
                          {snapshot.isDraggingOver ? "Drop here" : "No clients"}
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
    </div>
  );
}
