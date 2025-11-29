import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { useSalesmen, useSalesPerformance, useAddSalesman, useUpdateSalesman, useDeleteSalesman, Salesman } from '@/hooks/useSalesmen';
import { SalesmanProfileDialog } from '@/components/crm/SalesmanProfileDialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  UserPlus, 
  Users, 
  TrendingUp, 
  Target, 
  DollarSign, 
  Phone, 
  Mail, 
  MapPin,
  Award,
  BarChart3,
  Briefcase,
  MoreHorizontal,
  Trash2,
  Edit,
  Loader2,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';

const SALESMAN_STATUSES = [
  { value: 'active', label: 'Active', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  { value: 'inactive', label: 'Inactive', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  { value: 'on_leave', label: 'On Leave', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];

const CONTRACT_TYPES = [
  { value: 'fulltime', label: 'Full-time' },
  { value: 'parttime', label: 'Part-time' },
  { value: 'contractor', label: 'Contractor' },
];

export default function SalesmenPage() {
  const { data: salesmen = [], isLoading } = useSalesmen();
  const { data: allPerformance = [] } = useSalesPerformance();
  const addSalesman = useAddSalesman();
  const updateSalesman = useUpdateSalesman();
  const deleteSalesman = useDeleteSalesman();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedSalesman, setSelectedSalesman] = useState<Salesman | null>(null);
  const [editingSalesman, setEditingSalesman] = useState<Salesman | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    territory: string;
    target_monthly: number;
    target_quarterly: number;
    target_annual: number;
    commission_rate: number;
    status: 'active' | 'inactive' | 'on_leave';
    social_number: string;
    contract_type: 'fulltime' | 'parttime' | 'contractor';
  }>({
    name: '',
    email: '',
    phone: '',
    territory: '',
    target_monthly: 0,
    target_quarterly: 0,
    target_annual: 0,
    commission_rate: 5,
    status: 'active',
    social_number: '',
    contract_type: 'fulltime',
  });

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      territory: '',
      target_monthly: 0,
      target_quarterly: 0,
      target_annual: 0,
      commission_rate: 5,
      status: 'active',
      social_number: '',
      contract_type: 'fulltime',
    });
    setEditingSalesman(null);
  };

  const handleEdit = (salesman: Salesman) => {
    setEditingSalesman(salesman);
    setFormData({
      name: salesman.name,
      email: salesman.email || '',
      phone: salesman.phone || '',
      territory: salesman.territory || '',
      target_monthly: salesman.target_monthly,
      target_quarterly: salesman.target_quarterly,
      target_annual: salesman.target_annual,
      commission_rate: salesman.commission_rate,
      status: salesman.status,
      social_number: salesman.social_number || '',
      contract_type: salesman.contract_type || 'fulltime',
    });
    setDialogOpen(true);
  };

  const handleApprove = async (id: string) => {
    await updateSalesman.mutateAsync({ id, approval_status: 'approved' });
  };

  const handleReject = async () => {
    if (selectedSalesman && rejectionReason) {
      await updateSalesman.mutateAsync({ 
        id: selectedSalesman.id, 
        approval_status: 'rejected',
        rejection_reason: rejectionReason 
      });
      setRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedSalesman(null);
    }
  };

  const handleViewProfile = (salesman: Salesman) => {
    setSelectedSalesman(salesman);
    setProfileOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingSalesman) {
      await updateSalesman.mutateAsync({ id: editingSalesman.id, ...formData });
    } else {
      await addSalesman.mutateAsync(formData);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this salesman?')) {
      await deleteSalesman.mutateAsync(id);
    }
  };

  const getSalesmanPerformance = (salesmanId: string) => {
    return allPerformance.filter(p => p.salesman_id === salesmanId);
  };

  const calculateTotalRevenue = (salesmanId: string) => {
    return getSalesmanPerformance(salesmanId).reduce((sum, p) => sum + Number(p.revenue_generated), 0);
  };

  const calculateTotalDeals = (salesmanId: string) => {
    return getSalesmanPerformance(salesmanId).reduce((sum, p) => sum + p.deals_closed, 0);
  };

  // Stats
  const activeSalesmen = salesmen.filter(s => s.status === 'active').length;
  const totalRevenue = allPerformance.reduce((sum, p) => sum + Number(p.revenue_generated), 0);
  const totalDeals = allPerformance.reduce((sum, p) => sum + p.deals_closed, 0);
  const avgConversion = allPerformance.length > 0 
    ? allPerformance.reduce((sum, p) => sum + Number(p.conversion_rate), 0) / allPerformance.length 
    : 0;

  if (isLoading) {
    return (
      <CRMLayout title="Salesmen">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Salesmen Management">
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="overview" className="gap-2">
              <Users className="h-4 w-4" />
              Team Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="gap-2">
              <Award className="h-4 w-4" />
              Leaderboard
            </TabsTrigger>
          </TabsList>

          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Salesman
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingSalesman ? 'Edit Salesman' : 'Add New Salesman'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Territory</Label>
                    <Input
                      value={formData.territory}
                      onChange={(e) => setFormData({ ...formData, territory: e.target.value })}
                      placeholder="Region/Area"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(v) => setFormData({ ...formData, status: v as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SALESMAN_STATUSES.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Monthly Target</Label>
                    <Input
                      type="number"
                      value={formData.target_monthly}
                      onChange={(e) => setFormData({ ...formData, target_monthly: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quarterly Target</Label>
                    <Input
                      type="number"
                      value={formData.target_quarterly}
                      onChange={(e) => setFormData({ ...formData, target_quarterly: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Commission %</Label>
                    <Input
                      type="number"
                      value={formData.commission_rate}
                      onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addSalesman.isPending || updateSalesman.isPending}>
                    {editingSalesman ? 'Update' : 'Add Salesman'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20">
                <Users className="h-5 w-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeSalesmen}</p>
                <p className="text-sm text-muted-foreground">Active Salesmen</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Briefcase className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalDeals}</p>
                <p className="text-sm text-muted-foreground">Deals Closed</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingUp className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{avgConversion.toFixed(1)}%</p>
                <p className="text-sm text-muted-foreground">Avg Conversion</p>
              </div>
            </div>
          </Card>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salesmen.map(salesman => {
              const status = SALESMAN_STATUSES.find(s => s.value === salesman.status);
              const revenue = calculateTotalRevenue(salesman.id);
              const deals = calculateTotalDeals(salesman.id);
              const targetProgress = salesman.target_monthly > 0 ? (revenue / salesman.target_monthly) * 100 : 0;
              
              return (
                <Card key={salesman.id} className="p-4 bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {salesman.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{salesman.name}</h3>
                        <Badge className={`${status?.color} text-xs`}>{status?.label}</Badge>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(salesman)}>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(salesman.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3 text-sm">
                    {salesman.email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{salesman.email}</span>
                      </div>
                    )}
                    {salesman.phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{salesman.phone}</span>
                      </div>
                    )}
                    {salesman.territory && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{salesman.territory}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Target</span>
                      <span className="font-medium">${salesman.target_monthly.toLocaleString()}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{Math.min(targetProgress, 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={Math.min(targetProgress, 100)} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-lg font-bold text-primary">${revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-muted/30">
                        <p className="text-lg font-bold text-emerald-400">{deals}</p>
                        <p className="text-xs text-muted-foreground">Deals</p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {salesmen.length === 0 && (
              <Card className="col-span-full p-12 text-center text-muted-foreground bg-card/50">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No salesmen added yet. Click "Add Salesman" to get started.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Target vs Achievement
            </h3>
            <div className="space-y-4">
              {salesmen.map(salesman => {
                const revenue = calculateTotalRevenue(salesman.id);
                const monthlyProgress = salesman.target_monthly > 0 ? (revenue / salesman.target_monthly) * 100 : 0;
                
                return (
                  <div key={salesman.id} className="flex items-center gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {salesman.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{salesman.name}</span>
                        <span className="text-muted-foreground">
                          ${revenue.toLocaleString()} / ${salesman.target_monthly.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(monthlyProgress, 100)} 
                        className={`h-3 ${monthlyProgress >= 100 ? '[&>div]:bg-emerald-500' : monthlyProgress >= 75 ? '[&>div]:bg-primary' : monthlyProgress >= 50 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'}`}
                      />
                    </div>
                    <span className={`text-sm font-medium ${monthlyProgress >= 100 ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                      {monthlyProgress.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card className="p-6 bg-card/50 border-border/50">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-400" />
              Top Performers
            </h3>
            <div className="space-y-3">
              {[...salesmen]
                .sort((a, b) => calculateTotalRevenue(b.id) - calculateTotalRevenue(a.id))
                .map((salesman, index) => {
                  const revenue = calculateTotalRevenue(salesman.id);
                  const deals = calculateTotalDeals(salesman.id);
                  const medals = ['🥇', '🥈', '🥉'];
                  
                  return (
                    <div 
                      key={salesman.id} 
                      className={`flex items-center gap-4 p-3 rounded-lg ${index < 3 ? 'bg-gradient-to-r from-amber-500/10 to-transparent' : 'bg-muted/20'}`}
                    >
                      <span className="text-2xl w-8 text-center">
                        {index < 3 ? medals[index] : `#${index + 1}`}
                      </span>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {salesman.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{salesman.name}</p>
                        <p className="text-sm text-muted-foreground">{salesman.territory || 'No territory'}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">${revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{deals} deals</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Profile Dialog */}
      <SalesmanProfileDialog
        salesman={selectedSalesman}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Salesman</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label>Rejection Reason</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleReject} disabled={!rejectionReason}>
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
