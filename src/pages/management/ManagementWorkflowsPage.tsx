import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWorkflowDefinitions, WorkflowDefinition } from '@/hooks/useWorkflowDefinitions';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function ManagementWorkflowsPage() {
  const { data: workflows } = useWorkflowDefinitions();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredWorkflows = workflows?.filter(workflow =>
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedWorkflows = filteredWorkflows?.reduce((acc, workflow) => {
    const category = workflow.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(workflow);
    return acc;
  }, {} as Record<string, WorkflowDefinition[]>);

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold">Workflows</h1>
          <p className="text-muted-foreground">
            Standard operating procedures and workflows
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {groupedWorkflows && Object.keys(groupedWorkflows).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedWorkflows).map(([category, categoryWorkflows]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="outline">{category}</Badge>
                    <span className="text-sm font-normal text-muted-foreground">
                      ({categoryWorkflows?.length || 0} workflows)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    {categoryWorkflows?.map((workflow) => (
                      <AccordionItem key={workflow.id} value={workflow.id}>
                        <AccordionTrigger className="text-left">
                          <div>
                            <p className="font-medium">{workflow.name}</p>
                            {workflow.description && (
                              <p className="text-sm text-muted-foreground">
                                {workflow.description}
                              </p>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-medium mb-2">Steps:</h4>
                                <ol className="space-y-2 list-decimal list-inside">
                                  {workflow.steps.map((step, index) => (
                                    <li key={index} className="text-sm text-muted-foreground pl-2">
                                      {step}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                              {workflow.related_pages && workflow.related_pages.length > 0 && (
                                <div>
                                  <h4 className="font-medium mb-2">Related Pages:</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {workflow.related_pages.map((page, index) => (
                                      <Badge key={index} variant="secondary">
                                        {page}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </ScrollArea>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              No workflows found
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}