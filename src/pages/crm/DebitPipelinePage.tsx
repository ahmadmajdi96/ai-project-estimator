import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDebitCases, useUpdateDebitCase } from '@/hooks/useDebitCases';
import { useDebitPipelineStages } from '@/hooks/useDebitPipelineStages';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Loader2, DollarSign, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function DebitPipelinePage() {
  const { data: cases = [], isLoading } = useDebitCases();
  const { data: stages = [] } = useDebitPipelineStages();
  const updateCase = useUpdateDebitCase();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const caseId = result.draggableId;
    const newStage = result.destination.droppableId;
    updateCase.mutate({ id: caseId, stage: newStage });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive';
      case 'medium': return 'bg-amber-500/10 text-amber-600';
      case 'low': return 'bg-emerald-500/10 text-emerald-600';
      default: return 'bg-muted';
    }
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
          <h1 className="text-3xl font-display font-bold">Debit Pipeline</h1>
          <p className="text-muted-foreground">Track debt collection progress through stages</p>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => {
              const stageCases = cases.filter(c => c.stage === stage.value);
              const stageTotal = stageCases.reduce((sum, c) => sum + (c.current_amount || 0), 0);
              const collectedTotal = stageCases.reduce((sum, c) => sum + (c.collected_amount || 0), 0);
              
              return (
                <div key={stage.id} className="flex-shrink-0 w-80">
                  <Card className="p-3 mb-3 bg-card/50" style={{ borderTopColor: stage.color, borderTopWidth: 3 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{stage.name}</span>
                        <Badge variant="secondary">{stageCases.length}</Badge>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Outstanding</span>
                        <p className="font-semibold text-destructive">${stageTotal.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Collected</span>
                        <p className="font-semibold text-primary">${collectedTotal.toLocaleString()}</p>
                      </div>
                    </div>
                  </Card>
                  
                  <Droppable droppableId={stage.value}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`space-y-2 min-h-[400px] p-2 rounded-lg transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5 ring-2 ring-primary/20' : 'bg-muted/20'}`}
                      >
                        {stageCases.map((c, index) => (
                          <Draggable key={c.id} draggableId={c.id} index={index}>
                            {(provided, snapshot) => (
                              <Card
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 bg-card cursor-grab active:cursor-grabbing transition-shadow ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
                              >
                                <div className="space-y-3">
                                  <div className="flex items-start justify-between">
                                    <h4 className="font-medium">{c.title}</h4>
                                    <Badge className={getPriorityColor(c.priority)}>{c.priority}</Badge>
                                  </div>
                                  
                                  {c.clients && (
                                    <p className="text-sm text-muted-foreground">{c.clients.client_name}</p>
                                  )}
                                  
                                  <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center gap-1 text-sm">
                                      <DollarSign className="h-4 w-4 text-destructive" />
                                      <span className="font-semibold">${c.current_amount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-primary">
                                      <DollarSign className="h-4 w-4" />
                                      <span className="font-semibold">${c.collected_amount.toLocaleString()}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    {c.debit_collectors && (
                                      <div className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        <span>{c.debit_collectors.name}</span>
                                      </div>
                                    )}
                                    {c.due_date && (
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        <span>{format(new Date(c.due_date), 'MMM d')}</span>
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
