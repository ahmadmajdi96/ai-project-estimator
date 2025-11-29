import { useMemo } from 'react';
import { Client, CLIENT_STATUSES, SALES_STAGES, ClientStatus, SalesStage } from '@/types/crm';
import { ClientCard } from './ClientCard';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUpdateClientStatus, useUpdateClientSalesStage } from '@/hooks/useClients';

interface KanbanBoardProps {
  clients: Client[];
  type: 'status' | 'sales_stage';
}

export function KanbanBoard({ clients, type }: KanbanBoardProps) {
  const updateStatus = useUpdateClientStatus();
  const updateSalesStage = useUpdateClientSalesStage();

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

  const handleDragStart = (e: React.DragEvent, client: Client) => {
    e.dataTransfer.setData('clientId', client.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, columnValue: string) => {
    e.preventDefault();
    const clientId = e.dataTransfer.getData('clientId');
    
    if (type === 'status') {
      await updateStatus.mutateAsync({ id: clientId, status: columnValue as ClientStatus });
    } else {
      await updateSalesStage.mutateAsync({ id: clientId, sales_stage: columnValue as SalesStage });
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(column => (
        <div
          key={column.value}
          className="flex-shrink-0 w-72 bg-card/30 rounded-lg border border-border/50"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, column.value)}
        >
          <div className={`p-3 border-b border-border/50 rounded-t-lg ${column.color}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">{column.label}</h3>
              <span className="text-xs bg-background/20 px-2 py-0.5 rounded-full">
                {groupedClients[column.value]?.length || 0}
              </span>
            </div>
          </div>
          
          <ScrollArea className="h-[calc(100vh-300px)] p-2">
            <div className="space-y-2">
              {groupedClients[column.value]?.map(client => (
                <div
                  key={client.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, client)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <ClientCard client={client} compact />
                </div>
              ))}
              {groupedClients[column.value]?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No clients
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
}
