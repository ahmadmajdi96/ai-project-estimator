import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useKPIDefinitions, useKPIRecords, useAddKPIDefinition, useAddKPIRecord, useDeleteKPIDefinition } from '@/hooks/useKPIs';
import { useDepartments } from '@/hooks/useDepartments';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Plus, Trash2, Loader2, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

export default function KPIsPage() {
  const { data: kpiDefinitions = [], isLoading: loadingDefs } = useKPIDefinitions();
  const { data: kpiRecords = [], isLoading: loadingRecords } = useKPIRecords();
  const { data: departments = [] } = useDepartments();
  const addDefinition = useAddKPIDefinition();
  const addRecord = useAddKPIRecord();
  const deleteDefinition = useDeleteKPIDefinition();
  
  const [defDialogOpen, setDefDialogOpen] = useState(false);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  
  // Definition form
  const [defName, setDefName] = useState('');
  const [defDescription, setDefDescription] = useState('');
  const [defUnit, setDefUnit] = useState('');
  const [defTarget, setDefTarget] = useState('');
  const [defDepartment, setDefDepartment] = useState('');
  
  // Record form
  const [recordKpiId, setRecordKpiId] = useState('');
  const [recordValue, setRecordValue] = useState('');
  const [recordNotes, setRecordNotes] = useState('');

  const handleSubmitDefinition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!defName.trim()) {
      toast.error('KPI name is required');
      return;
    }
    
    await addDefinition.mutateAsync({
      name: defName,
      description: defDescription || undefined,
      unit: defUnit || undefined,
      target_value: defTarget ? parseFloat(defTarget) : undefined,
      department_id: defDepartment || undefined,
    });
    
    setDefName('');
    setDefDescription('');
    setDefUnit('');
    setDefTarget('');
    setDefDepartment('');
    setDefDialogOpen(false);
  };

  const handleSubmitRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordKpiId || !recordValue) {
      toast.error('KPI and value are required');
      return;
    }
    
    await addRecord.mutateAsync({
      kpi_id: recordKpiId,
      value: parseFloat(recordValue),
      notes: recordNotes || undefined,
    });
    
    setRecordKpiId('');
    setRecordValue('');
    setRecordNotes('');
    setRecordDialogOpen(false);
  };

  const handleDeleteDefinition = async (id: string) => {
    if (confirm('Are you sure you want to delete this KPI?')) {
      await deleteDefinition.mutateAsync(id);
    }
  };

  const getLatestRecord = (kpiId: string) => {
    return kpiRecords.find(r => r.kpi_id === kpiId);
  };

  const getProgress = (kpi: typeof kpiDefinitions[0]) => {
    const latest = getLatestRecord(kpi.id);
    if (!latest || !kpi.target_value) return 0;
    return Math.min(100, (latest.value / kpi.target_value) * 100);
  };

  const isLoading = loadingDefs || loadingRecords;

  return (
    <CRMLayout title="KPIs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">KPIs & Performance</h2>
            <p className="text-muted-foreground">Track key performance indicators</p>
          </div>
          
          <div className="flex gap-2">
            <Dialog open={recordDialogOpen} onOpenChange={setRecordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={kpiDefinitions.length === 0}>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Log Value
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Log KPI Value</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitRecord} className="space-y-4">
                  <div className="space-y-2">
                    <Label>KPI *</Label>
                    <Select value={recordKpiId} onValueChange={setRecordKpiId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select KPI" />
                      </SelectTrigger>
                      <SelectContent>
                        {kpiDefinitions.map((kpi) => (
                          <SelectItem key={kpi.id} value={kpi.id}>
                            {kpi.name} {kpi.unit && `(${kpi.unit})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Value *</Label>
                    <Input
                      type="number"
                      step="any"
                      value={recordValue}
                      onChange={(e) => setRecordValue(e.target.value)}
                      placeholder="Enter value"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={recordNotes}
                      onChange={(e) => setRecordNotes(e.target.value)}
                      placeholder="Additional notes..."
                      rows={2}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={addRecord.isPending}>
                    {addRecord.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Value'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={defDialogOpen} onOpenChange={setDefDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Define KPI
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Define KPI</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmitDefinition} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Name *</Label>
                    <Input
                      value={defName}
                      onChange={(e) => setDefName(e.target.value)}
                      placeholder="Monthly Revenue"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={defDescription}
                      onChange={(e) => setDefDescription(e.target.value)}
                      placeholder="KPI description..."
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Unit</Label>
                      <Input
                        value={defUnit}
                        onChange={(e) => setDefUnit(e.target.value)}
                        placeholder="USD, %, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Target Value</Label>
                      <Input
                        type="number"
                        step="any"
                        value={defTarget}
                        onChange={(e) => setDefTarget(e.target.value)}
                        placeholder="100000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select value={defDepartment} onValueChange={setDefDepartment}>
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={addDefinition.isPending}>
                    {addDefinition.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create KPI'}
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
        ) : kpiDefinitions.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No KPIs defined</h3>
              <p className="text-muted-foreground mb-4">Define your first KPI to start tracking performance</p>
              <Button onClick={() => setDefDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Define KPI
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiDefinitions.map((kpi) => {
              const latest = getLatestRecord(kpi.id);
              const progress = getProgress(kpi);
              const isOnTrack = progress >= 75;
              
              return (
                <Card key={kpi.id} className="glass-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOnTrack ? 'bg-green-500/10' : 'bg-orange-500/10'}`}>
                          {isOnTrack ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-orange-500" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">{kpi.name}</CardTitle>
                          {kpi.departments?.name && (
                            <p className="text-xs text-muted-foreground">{kpi.departments.name}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDefinition(kpi.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {kpi.description && (
                      <p className="text-sm text-muted-foreground mb-4">{kpi.description}</p>
                    )}
                    
                    <div className="space-y-3">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-3xl font-bold">
                            {latest ? latest.value.toLocaleString() : '—'}
                          </p>
                          {kpi.unit && <p className="text-sm text-muted-foreground">{kpi.unit}</p>}
                        </div>
                        {kpi.target_value && (
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Target className="h-3 w-3" />
                              Target
                            </div>
                            <p className="font-medium">{kpi.target_value.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      
                      {kpi.target_value && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </CRMLayout>
  );
}
