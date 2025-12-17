import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  useSalesmenWithRoles, 
  useUpdateSalesmanPosition,
  useSalesmanPagePermissions,
  useSetSalesmanPagePermission,
  SALES_POSITIONS,
  ROLE_INFO,
  SalesPosition,
  SalesmanWithRole
} from '@/hooks/useSalesmenRoles';
import { useAddSalesman, useUpdateSalesman, useDeleteSalesman } from '@/hooks/useSalesmen';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Mail, 
  Phone,
  MapPin,
  Settings,
  Loader2,
  Briefcase,
  Search,
  Pencil,
  Trash2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';

const CRM_PAGES = [
  { path: '/crm', label: 'Dashboard' },
  { path: '/crm/clients', label: 'Clients' },
  { path: '/crm/salesmen', label: 'Salesmen' },
  { path: '/crm/pipeline', label: 'Sales Pipeline' },
  { path: '/crm/status', label: 'Status Board' },
  { path: '/crm/calendar', label: 'Calendar' },
  { path: '/crm/quotes', label: 'Quotes & Estimator' },
  { path: '/crm/departments', label: 'Departments' },
  { path: '/crm/employees', label: 'Employees' },
  { path: '/crm/tasks', label: 'Tasks' },
  { path: '/crm/roadmaps', label: 'Roadmaps' },
  { path: '/crm/kpis', label: 'KPIs' },
  { path: '/crm/ai-chat', label: 'AI Chat' },
  { path: '/crm/config', label: 'Configuration' },
];

interface TeamMemberForm {
  name: string;
  email: string;
  phone: string;
  territory: string;
  position: SalesPosition;
  password: string;
}

const initialFormState: TeamMemberForm = {
  name: '',
  email: '',
  phone: '',
  territory: '',
  position: 'salesman',
  password: '',
};

export function SalesTeamManagement() {
  const { data: salesmenWithRoles = [], isLoading, refetch } = useSalesmenWithRoles();
  const updatePosition = useUpdateSalesmanPosition();
  const setPermission = useSetSalesmanPagePermission();
  const addSalesman = useAddSalesman();
  const updateSalesman = useUpdateSalesman();
  const deleteSalesman = useDeleteSalesman();
  
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false);
  const [selectedSalesman, setSelectedSalesman] = useState<SalesmanWithRole | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addForm, setAddForm] = useState<TeamMemberForm>(initialFormState);
  const [editForm, setEditForm] = useState<TeamMemberForm>(initialFormState);
  const [isCreating, setIsCreating] = useState(false);

  const { data: permissions = [] } = useSalesmanPagePermissions(selectedSalesman?.id);

  const handleAddSalesman = async () => {
    if (!addForm.name) {
      toast.error('Name is required');
      return;
    }
    if (!addForm.email) {
      toast.error('Email is required');
      return;
    }
    if (!addForm.password || addForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Create auth user with password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: addForm.email,
        password: addForm.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { full_name: addForm.name },
        },
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('Failed to create user account');
      }
      
      // Determine the role based on position
      const positionInfo = SALES_POSITIONS.find(p => p.value === addForm.position);
      const role = positionInfo?.role || 'employee';
      
      // Create user role
      await supabase.from('user_roles').insert({
        user_id: authData.user.id,
        role: role,
      });
      
      // Create employee record with position and name
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .insert([{ 
          position: addForm.position,
          status: 'active',
          user_id: authData.user.id,
          email: addForm.email,
        }])
        .select()
        .single();
      
      if (empError) throw empError;
      
      // Create salesman linked to employee
      const { error: salesError } = await supabase
        .from('salesmen')
        .insert([{ 
          name: addForm.name,
          email: addForm.email,
          phone: addForm.phone || null,
          territory: addForm.territory || null,
          employee_id: employee.id,
        }])
        .select()
        .single();
      
      if (salesError) throw salesError;
      
      toast.success('Team member created successfully');
      setAddDialogOpen(false);
      setAddForm(initialFormState);
      refetch();
    } catch (error: any) {
      toast.error('Failed to add team member: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditSalesman = async () => {
    if (!selectedSalesman || !editForm.name) {
      toast.error('Name is required');
      return;
    }
    
    try {
      // Update salesman record
      await updateSalesman.mutateAsync({
        id: selectedSalesman.id,
        name: editForm.name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        territory: editForm.territory || null,
      });
      
      // Update position if changed
      if (editForm.position !== selectedSalesman.position) {
        await updatePosition.mutateAsync({ 
          salesmanId: selectedSalesman.id, 
          position: editForm.position 
        });
      }
      
      setEditDialogOpen(false);
      setSelectedSalesman(null);
      refetch();
    } catch (error: any) {
      toast.error('Failed to update team member: ' + error.message);
    }
  };

  const handleDeleteSalesman = async () => {
    if (!selectedSalesman) return;
    
    try {
      await deleteSalesman.mutateAsync(selectedSalesman.id);
      setDeleteDialogOpen(false);
      setSelectedSalesman(null);
      refetch();
    } catch (error: any) {
      toast.error('Failed to delete team member: ' + error.message);
    }
  };

  const openEditDialog = (salesman: SalesmanWithRole) => {
    setSelectedSalesman(salesman);
    setEditForm({
      name: salesman.name,
      email: salesman.email || '',
      phone: salesman.phone || '',
      territory: salesman.territory || '',
      position: salesman.position,
      password: '',
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (salesman: SalesmanWithRole) => {
    setSelectedSalesman(salesman);
    setDeleteDialogOpen(true);
  };

  const handlePositionChange = async (salesmanId: string, position: SalesPosition) => {
    await updatePosition.mutateAsync({ salesmanId, position });
  };

  const handlePermissionChange = async (pagePath: string, canAccess: boolean) => {
    if (!selectedSalesman) return;
    await setPermission.mutateAsync({ salesmanId: selectedSalesman.id, pagePath, canAccess });
  };

  const getPermissionStatus = (pagePath: string) => {
    const perm = permissions.find(p => p.page_path === pagePath);
    return perm ? perm.can_access : true;
  };

  const filteredSalesmen = salesmenWithRoles.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.territory?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-card/50 border-border/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Sales Team Management</h3>
            <p className="text-sm text-muted-foreground">
              {salesmenWithRoles.length} team members
            </p>
          </div>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      value={addForm.password}
                      onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                      placeholder="Min 6 characters"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Territory</Label>
                  <Input
                    value={addForm.territory}
                    onChange={(e) => setAddForm({ ...addForm, territory: e.target.value })}
                    placeholder="Region/Area"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Select 
                  value={addForm.position} 
                  onValueChange={(v) => setAddForm({ ...addForm, position: v as SalesPosition })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALES_POSITIONS.map(pos => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="bg-muted/30 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Role will be automatically assigned based on position:
                  <strong className="ml-1">
                    {ROLE_INFO[SALES_POSITIONS.find(p => p.value === addForm.position)?.role || 'employee'].label}
                  </strong>
                </p>
              </div>
              <Button 
                onClick={handleAddSalesman} 
                className="w-full" 
                disabled={isCreating}
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Add Team Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email, territory..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Team List */}
      <ScrollArea className="h-[500px]">
        <div className="space-y-3">
          {filteredSalesmen.map(salesman => {
            const positionInfo = SALES_POSITIONS.find(p => p.value === salesman.position);
            const roleInfo = ROLE_INFO[salesman.role];
            
            return (
              <div 
                key={salesman.id} 
                className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {salesman.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{salesman.name}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {salesman.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" /> {salesman.email}
                        </span>
                      )}
                      {salesman.territory && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {salesman.territory}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Position Selector */}
                  <div className="flex flex-col items-end gap-1">
                    <Select 
                      value={salesman.position || 'salesman'}
                      onValueChange={(v) => handlePositionChange(salesman.id, v as SalesPosition)}
                    >
                      <SelectTrigger className="w-[160px]">
                        <Briefcase className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALES_POSITIONS.map(pos => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Badge className={roleInfo.color} variant="outline">
                      <Shield className="h-3 w-3 mr-1" />
                      {roleInfo.label}
                    </Badge>
                  </div>
                  
                  {/* Edit Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(salesman)}
                    title="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  
                  {/* Permissions Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      setSelectedSalesman(salesman);
                      setPermissionsDialogOpen(true);
                    }}
                    title="Manage Permissions"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  
                  {/* Delete Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDeleteDialog(salesman)}
                    className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
          
          {filteredSalesmen.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No team members found</p>
              <p className="text-sm">Add team members to manage their roles and permissions</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="email@company.com"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="+1 234 567 890"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Territory</Label>
                <Input
                  value={editForm.territory}
                  onChange={(e) => setEditForm({ ...editForm, territory: e.target.value })}
                  placeholder="Region/Area"
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Select 
                  value={editForm.position} 
                  onValueChange={(v) => setEditForm({ ...editForm, position: v as SalesPosition })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SALES_POSITIONS.map(pos => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <Shield className="h-4 w-4 inline mr-1" />
                Role will be updated based on position:
                <strong className="ml-1">
                  {ROLE_INFO[SALES_POSITIONS.find(p => p.value === editForm.position)?.role || 'employee'].label}
                </strong>
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSalesman} disabled={updateSalesman.isPending}>
              {updateSalesman.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedSalesman?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSalesman}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteSalesman.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permissions Dialog */}
      <Dialog open={permissionsDialogOpen} onOpenChange={setPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Page Permissions - {selectedSalesman?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="bg-muted/30 p-3 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              Current role: <strong>{selectedSalesman && ROLE_INFO[selectedSalesman.role].label}</strong>
              <br />
              Position: <strong>{selectedSalesman && SALES_POSITIONS.find(p => p.value === selectedSalesman.position)?.label}</strong>
            </p>
          </div>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-3">
              {CRM_PAGES.map(page => (
                <div key={page.path} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                  <span className="text-sm">{page.label}</span>
                  <Checkbox
                    checked={getPermissionStatus(page.path)}
                    onCheckedChange={(checked) => handlePermissionChange(page.path, checked as boolean)}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}