import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useRoadmaps, useMilestones, useAddRoadmap, useAddMilestone, useDeleteRoadmap } from '@/hooks/useRoadmaps';
import { useDepartments } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Map, Plus, Trash2, Loader2, Target, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-500/10 text-gray-500',
  active: 'bg-blue-500/10 text-blue-500',
  completed: 'bg-green-500/10 text-green-500',
  archived: 'bg-yellow-500/10 text-yellow-500',
  planned: 'bg-gray-500/10 text-gray-500',
  in_progress: 'bg-blue-500/10 text-blue-500',
  delayed: 'bg-red-500/10 text-red-500',
};

export default function RoadmapsPage() {
  const { data: roadmaps = [], isLoading: loadingRoadmaps } = useRoadmaps();
  const { data: milestones = [], isLoading: loadingMilestones } = useMilestones();
  const { data: departments = [] } = useDepartments();
  const addRoadmap = useAddRoadmap();
  const addMilestone = useAddMilestone();
  const deleteRoadmap = useDeleteRoadmap();
  
  const [roadmapDialogOpen, setRoadmapDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  
  // Roadmap form
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDescription, setRoadmapDescription] = useState('');
  const [roadmapDepartment, setRoadmapDepartment] = useState('');
  const [roadmapStartDate, setRoadmapStartDate] = useState('');
  const [roadmapEndDate, setRoadmapEndDate] = useState('');
  
  // Milestone form
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDepartment, setMilestoneDepartment] = useState('');
  const [milestoneTargetDate, setMilestoneTargetDate] = useState('');

  const handleSubmitRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTitle.trim()) {
      toast.error('Roadmap title is required');
      return;
    }
    
    await addRoadmap.mutateAsync({
      title: roadmapTitle,
      description: roadmapDescription || undefined,
      department_id: roadmapDepartment || undefined,
      start_date: roadmapStartDate || undefined,
      end_date: roadmapEndDate || undefined,
    });
    
    setRoadmapTitle('');
    setRoadmapDescription('');
    setRoadmapDepartment('');
    setRoadmapStartDate('');
    setRoadmapEndDate('');
    setRoadmapDialogOpen(false);
  };

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) {
      toast.error('Milestone title is required');
      return;
    }
    
    await addMilestone.mutateAsync({
      title: milestoneTitle,
      description: milestoneDescription || undefined,
      department_id: milestoneDepartment || undefined,
      target_date: milestoneTargetDate || undefined,
    });
    
    setMilestoneTitle('');
    setMilestoneDescription('');
    setMilestoneDepartment('');
    setMilestoneTargetDate('');
    setMilestoneDialogOpen(false);
  };

  const handleDeleteRoadmap = async (id: string) => {
    if (confirm('Are you sure you want to delete this roadmap?')) {
      await deleteRoadmap.mutateAsync(id);
    }
  };

  const isLoading = loadingRoadmaps || loadingMilestones;

  return (
    <CRMLayout title="Roadmaps">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Roadmaps & Milestones</h2>
            <p className="text-muted-foreground">Plan and track your strategic objectives</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Milestone</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitMilestone} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                      placeholder="Q1 Product Launch"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={milestoneDescription}
                      onChange={(e) => setMilestoneDescription(e.target.value)}
                      placeholder="Milestone description..."
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Department</Label>
                      <Select value={milestoneDepartment} onValueChange={setMilestoneDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Date</Label>
                      <Input
                        type="date"
                        value={milestoneTargetDate}
                        onChange={(e) => setMilestoneTargetDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={addMilestone.isPending}>
                    {addMilestone.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Milestone'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={roadmapDialogOpen} onOpenChange={setRoadmapDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Roadmap
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Roadmap</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitRoadmap} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title *</Label>
                    <Input
                      value={roadmapTitle}
                      onChange={(e) => setRoadmapTitle(e.target.value)}
                      placeholder="2024 Product Roadmap"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={roadmapDescription}
                      onChange={(e) => setRoadmapDescription(e.target.value)}
                      placeholder="Roadmap description..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={roadmapDepartment} onValueChange={setRoadmapDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={roadmapStartDate}
                        onChange={(e) => setRoadmapStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={roadmapEndDate}
                        onChange={(e) => setRoadmapEndDate(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={addRoadmap.isPending}>
                    {addRoadmap.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Roadmap'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Roadmaps */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Map className="h-5 w-5" />
                Roadmaps
              </h3>
              {roadmaps.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-8 text-center">
                    <Map className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No roadmaps yet</p>
                  </CardContent>
                </Card>
              ) : (
                roadmaps.map((roadmap) => (
                  <Card key={roadmap.id} className="glass-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                          {roadmap.departments?.name && (
                            <p className="text-sm text-muted-foreground">{roadmap.departments.name}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={statusColors[roadmap.status]}>
                            {roadmap.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteRoadmap(roadmap.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {roadmap.description && (
                        <p className="text-sm text-muted-foreground mb-3">{roadmap.description}</p>
                      )}
                      {roadmap.start_date && roadmap.end_date && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(roadmap.start_date), 'MMM d, yyyy')} - {format(new Date(roadmap.end_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Milestones */}
            <div className="space-y-4">
              <h3 className="font-display font-semibold text-lg flex items-center gap-2">
                <Target className="h-5 w-5" />
                Milestones
              </h3>
              {milestones.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="py-8 text-center">
                    <Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No milestones yet</p>
                  </CardContent>
                </Card>
              ) : (
                milestones.map((milestone) => (
                  <Card key={milestone.id} className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{milestone.title}</h4>
                          {milestone.departments?.name && (
                            <p className="text-sm text-muted-foreground">{milestone.departments.name}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className={statusColors[milestone.status]}>
                          {milestone.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                      )}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{milestone.progress}%</span>
                        </div>
                        <Progress value={milestone.progress} className="h-2" />
                      </div>
                      {milestone.target_date && (
                        <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          Target: {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
