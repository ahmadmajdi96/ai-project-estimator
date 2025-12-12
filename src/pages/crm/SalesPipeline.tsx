import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useClients, useUpdateClientSalesStage } from '@/hooks/useClients';
import { usePipelineStages } from '@/hooks/usePipelineStages';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Loader2, DollarSign, Building2, User, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SalesPipeline() {
  const { data: clients = [], isLoading } = useClients();
  const { data: stages = [] } = usePipelineStages();
  const updateSalesStage = useUpdateClientSalesStage();
  const navigate = useNavigate();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const clientId = result.draggableId;
    const newStage = result.destination.droppableId;
    updateSalesStage.mutate({ id: clientId, sales_stage: newStage });
  };

  if (isLoading) {
    return (
      <CRMLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Sales Pipeline</h1>
          <p className="text-muted-foreground">Track client progress through sales stages</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageClients = clients.filter(c => c.sales_stage === stage.value);
              const stageTotal = stageClients.reduce((sum, c) => sum + (c.contract_value || 0), 0);
              
              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <Card className="p-3 mb-3 bg-card/50" style={{ borderTopColor: stage.color, borderTopWidth: 3 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stage.name}</span>
                        <Badge variant="secondary">{stageClients.length}</Badge>
                      </div>
                    </div>
                    <div className="mt-2 text-xs">
                      <span className="text-muted-foreground">Total Value</span>
                      <p className="font-semibold text-primary">${stageTotal.toLocaleString()}</p>
                    </div>
                  </Card>
                  
                  <Droppable droppableId={stage.value}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/20'}`}
                      >
                        {stageClients.map((client, index) => (
                          <Draggable key={client.id} draggableId={client.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-card cursor-grab active:cursor-grabbing transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
                                onClick={() => navigate(`/crm/clients/${client.id}`)}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-medium">{client.client_name}</h4>
                                    {client.industry && (
                                      <Badge variant="outline" className="text-xs">{client.industry}</Badge>
                                    )}
                                  </div>
                                  
                                  {client.contact_person && (
                                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>{client.contact_person}</span>
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-1 text-primary font-semibold">
                                      <DollarSign className="h-4 w-4" />
                                      <span>${(client.contract_value || 0).toLocaleString()}</span>
                                    </div>
                                    {client.phone && (
                                      <div className="flex items-center gap-1 text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      </div>
    </CRMLayout>
  );
}
