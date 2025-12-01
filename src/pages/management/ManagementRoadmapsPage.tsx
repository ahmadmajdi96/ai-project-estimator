import { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagementSidebar } from '@/components/management/ManagementSidebar';
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
import { Map, Plus, Trash2, Loader2, Target, Calendar, Building } from 'lucide-react';
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

export default function ManagementRoadmapsPage() {
  const { data: roadmaps = [], isLoading: loadingRoadmaps } = useRoadmaps();
  const { data: milestones = [], isLoading: loadingMilestones } = useMilestones();
  const { data: departments = [] } = useDepartments();
  const addRoadmap = useAddRoadmap();
  const addMilestone = useAddMilestone();
  const deleteRoadmap = useDeleteRoadmap();
  
  const [selectedDepartment, setSelectedDepartment] = useState<string>('__all__');
  const [roadmapDialogOpen, setRoadmapDialogOpen] = useState(false);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  
  const [roadmapTitle, setRoadmapTitle] = useState('');
  const [roadmapDescription, setRoadmapDescription] = useState('');
  const [roadmapDepartment, setRoadmapDepartment] = useState('');
  const [roadmapStartDate, setRoadmapStartDate] = useState('');
  const [roadmapEndDate, setRoadmapEndDate] = useState('');
  
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDepartment, setMilestoneDepartment] = useState('');
  const [milestoneTargetDate, setMilestoneTargetDate] = useState('');

  const filteredRoadmaps = roadmaps.filter(r => selectedDepartment === '__all__' || r.department_id === selectedDepartment);
  const filteredMilestones = milestones.filter(m => selectedDepartment === '__all__' || m.department_id === selectedDepartment);

  const handleSubmitRoadmap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roadmapTitle.trim()) { toast.error('Roadmap title is required'); return; }
    await addRoadmap.mutateAsync({
      title: roadmapTitle,
      description: roadmapDescription || undefined,
      department_id: roadmapDepartment || undefined,
      start_date: roadmapStartDate || undefined,
      end_date: roadmapEndDate || undefined,
    });
    setRoadmapTitle(''); setRoadmapDescription(''); setRoadmapDepartment(''); setRoadmapStartDate(''); setRoadmapEndDate('');
    setRoadmapDialogOpen(false);
  };

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim()) { toast.error('Milestone title is required'); return; }
    await addMilestone.mutateAsync({
      title: milestoneTitle,
      description: milestoneDescription || undefined,
      department_id: milestoneDepartment || undefined,
      target_date: milestoneTargetDate || undefined,
    });
    setMilestoneTitle(''); setMilestoneDescription(''); setMilestoneDepartment(''); setMilestoneTargetDate('');
    setMilestoneDialogOpen(false);
  };

  const isLoading = loadingRoadmaps || loadingMilestones;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold">Roadmaps & Milestones</h1>
                <p className="text-muted-foreground">Company-wide strategic planning</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
                  <DialogTrigger asChild><Button variant="outline"><Target className="h-4 w-4 mr-2" />Add Milestone</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Milestone</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmitMilestone} className="space-y-4">
                      <div className="space-y-2"><Label>Title *</Label><Input value={milestoneTitle} onChange={(e) => setMilestoneTitle(e.target.value)} required /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={milestoneDescription} onChange={(e) => setMilestoneDescription(e.target.value)} rows={3} /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Department</Label>
                          <Select value={milestoneDepartment || "__none__"} onValueChange={(v) => setMilestoneDepartment(v === "__none__" ? "" : v)}>
                            <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Company Wide</SelectItem>
                              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2"><Label>Target Date</Label><Input type="date" value={milestoneTargetDate} onChange={(e) => setMilestoneTargetDate(e.target.value)} /></div>
                      </div>
                      <Button type="submit" className="w-full" disabled={addMilestone.isPending}>{addMilestone.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Milestone'}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog open={roadmapDialogOpen} onOpenChange={setRoadmapDialogOpen}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Create Roadmap</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Create Roadmap</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmitRoadmap} className="space-y-4">
                      <div className="space-y-2"><Label>Title *</Label><Input value={roadmapTitle} onChange={(e) => setRoadmapTitle(e.target.value)} required /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={roadmapDescription} onChange={(e) => setRoadmapDescription(e.target.value)} rows={3} /></div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={roadmapDepartment || "__none__"} onValueChange={(v) => setRoadmapDepartment(v === "__none__" ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Company Wide</SelectItem>
                            {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2"><Label>Start Date</Label><Input type="date" value={roadmapStartDate} onChange={(e) => setRoadmapStartDate(e.target.value)} /></div>
                        <div className="space-y-2"><Label>End Date</Label><Input type="date" value={roadmapEndDate} onChange={(e) => setRoadmapEndDate(e.target.value)} /></div>
                      </div>
                      <Button type="submit" className="w-full" disabled={addRoadmap.isPending}>{addRoadmap.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Roadmap'}</Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <Card className="p-4 bg-card/50">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__all__">All Departments</SelectItem>
                    {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
            ) : (
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2"><Map className="h-5 w-5" />Roadmaps ({filteredRoadmaps.length})</h3>
                  {filteredRoadmaps.length === 0 ? (
                    <Card><CardContent className="py-8 text-center"><Map className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No roadmaps found</p></CardContent></Card>
                  ) : (
                    filteredRoadmaps.map((roadmap) => (
                      <Card key={roadmap.id}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">{roadmap.title}</CardTitle>
                              {roadmap.departments?.name && <p className="text-sm text-muted-foreground">{roadmap.departments.name}</p>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className={statusColors[roadmap.status]}>{roadmap.status}</Badge>
                              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => deleteRoadmap.mutate(roadmap.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {roadmap.description && <p className="text-sm text-muted-foreground mb-3">{roadmap.description}</p>}
                          {roadmap.start_date && roadmap.end_date && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />{format(new Date(roadmap.start_date), 'MMM d, yyyy')} - {format(new Date(roadmap.end_date), 'MMM d, yyyy')}</div>
                          )}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                <div className="space-y-4">
                  <h3 className="font-display font-semibold text-lg flex items-center gap-2"><Target className="h-5 w-5" />Milestones ({filteredMilestones.length})</h3>
                  {filteredMilestones.length === 0 ? (
                    <Card><CardContent className="py-8 text-center"><Target className="h-10 w-10 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">No milestones found</p></CardContent></Card>
                  ) : (
                    filteredMilestones.map((milestone) => (
                      <Card key={milestone.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-medium">{milestone.title}</h4>
                              {milestone.departments?.name && <p className="text-sm text-muted-foreground">{milestone.departments.name}</p>}
                            </div>
                            <Badge variant="secondary" className={statusColors[milestone.status]}>{milestone.status.replace('_', ' ')}</Badge>
                          </div>
                          {milestone.description && <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Progress</span><span className="font-medium">{milestone.progress}%</span></div>
                            <Progress value={milestone.progress} className="h-2" />
                          </div>
                          {milestone.target_date && <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground"><Calendar className="h-4 w-4" />Target: {format(new Date(milestone.target_date), 'MMM d, yyyy')}</div>}
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
