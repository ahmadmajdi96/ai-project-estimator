import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStrategicGoals } from '@/hooks/useStrategicGoals';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import { format } from 'date-fns';

export default function ManagementStrategicGoalsPage() {
  const { data: goals } = useStrategicGoals();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'at_risk':
        return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getScopeColor = (scope: string) => {
    switch (scope) {
      case 'company':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'department':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'team':
        return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold">Strategic Goals</h1>
            <p className="text-muted-foreground">
              Define and track company-wide strategic objectives
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Goal
          </Button>
        </div>

        {goals && goals.length > 0 ? (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <Card key={goal.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <CardTitle>{goal.title}</CardTitle>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getScopeColor(goal.scope)} variant="outline">
                        {goal.scope}
                      </Badge>
                      <Badge className={getStatusColor(goal.status)} variant="outline">
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    {goal.start_date && (
                      <span>
                        Start: {format(new Date(goal.start_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                    {goal.end_date && (
                      <span>
                        End: {format(new Date(goal.end_date), 'MMM dd, yyyy')}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No strategic goals yet</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Create your first strategic goal to align your organization
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </ManagementLayout>
  );
}