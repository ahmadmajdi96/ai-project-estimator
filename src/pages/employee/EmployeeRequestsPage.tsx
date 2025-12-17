import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { RequestDetailSheet } from '@/components/employee/RequestDetailSheet';
import { useAddEmployeeRequest, EmployeeRequest } from '@/hooks/useEmployeeDashboard';
import { useRoleBasedRequests, useUpdateRequestStatus } from '@/hooks/useRoleBasedData';
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Search, Send, Users, ThumbsUp, ThumbsDown, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const requestTypes = [
  { value: 'equipment', label: 'Equipment Request' },
  { value: 'training', label: 'Training Request' },
  { value: 'expense', label: 'Expense Reimbursement' },
  { value: 'access', label: 'Access Request' },
  { value: 'transfer', label: 'Transfer Request' },
  { value: 'certificate', label: 'Certificate Request' },
  { value: 'other', label: 'Other' },
];

const priorityConfig: Record<string, { color: string; label: string }> = {
  low: { color: 'bg-slate-500', label: 'Low' },
  medium: { color: 'bg-blue-500', label: 'Medium' },
  high: { color: 'bg-orange-500', label: 'High' },
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Pending' },
  in_review: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'In Review' },
  approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' },
};

export default function EmployeeRequestsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<EmployeeRequest | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('my-requests');
  
  // Rejection dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [newRequest, setNewRequest] = useState({
    request_type: '',
    title: '',
    description: '',
    priority: 'medium',
  });

  const { data: roleBasedData, isLoading } = useRoleBasedRequests();
  const { canApproveRequests, canViewTeamData, employeeId } = useUserRole();
  const addRequest = useAddEmployeeRequest();
  const updateRequestStatus = useUpdateRequestStatus();

  const myRequests = roleBasedData?.myRequests || [];
  const teamRequests = roleBasedData?.teamRequests || [];

  const filterRequests = (requests: any[]) => {
    return requests.filter(request => {
      const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
      const matchesType = filterType === 'all' || request.request_type === filterType;
      const matchesSearch = searchQuery === '' || 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesType && matchesSearch;
    });
  };

  const filteredMyRequests = filterRequests(myRequests);
  const filteredTeamRequests = filterRequests(teamRequests);

  const handleSubmit = () => {
    if (!newRequest.request_type || !newRequest.title) return;
    addRequest.mutate({ ...newRequest, employee_id: employeeId || undefined });
    setNewRequest({ request_type: '', title: '', description: '', priority: 'medium' });
    setDialogOpen(false);
  };

  const handleRequestClick = (request: EmployeeRequest) => {
    setSelectedRequest(request);
    setSheetOpen(true);
  };

  const handleApprove = (requestId: string) => {
    updateRequestStatus.mutate({ requestId, status: 'approved' });
  };

  const handleRejectClick = (requestId: string) => {
    setRejectingRequestId(requestId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectingRequestId) return;
    updateRequestStatus.mutate({ 
      requestId: rejectingRequestId, 
      status: 'rejected',
      rejectionReason: rejectionReason || undefined
    });
    setRejectDialogOpen(false);
    setRejectingRequestId(null);
    setRejectionReason('');
  };

  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const approvedRequests = myRequests.filter(r => r.status === 'approved');
  const rejectedRequests = myRequests.filter(r => r.status === 'rejected');

  const teamPendingCount = teamRequests.filter(r => r.status === 'pending' || r.status === 'in_review').length;

  const RequestCard = ({ request, showActions = false }: { request: any; showActions?: boolean }) => {
    const status = statusConfig[request.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const priority = priorityConfig[request.priority] || priorityConfig.medium;
    const employeeName = request.employees?.full_name || 'Unknown';
    const initials = employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <Card 
        className="hover:shadow-md transition-all cursor-pointer border-0 shadow-sm"
        onClick={() => handleRequestClick(request)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${status.bg}`}>
                <StatusIcon className={`h-4 w-4 ${status.color}`} />
              </div>
              <Badge variant="outline" className="text-xs">
                {requestTypes.find(t => t.value === request.request_type)?.label || request.request_type}
              </Badge>
            </div>
            <div className={`w-2 h-2 rounded-full ${priority.color}`} title={priority.label} />
          </div>
          
          <h3 className="font-medium mb-1 line-clamp-1">{request.title}</h3>
          
          {showActions && request.employees?.full_name && (
            <div className="flex items-center gap-2 mb-2">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px] bg-primary/10">{initials}</AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground">{request.employees.full_name}</p>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {request.description || 'No description provided'}
          </p>

          {request.rejection_reason && request.status === 'rejected' && (
            <div className="mb-3 p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Rejection reason:</strong> {request.rejection_reason}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {format(parseISO(request.created_at), 'MMM d, yyyy')}
            </span>
            <Badge className={status.bg + ' ' + status.color} variant="secondary">
              {status.label}
            </Badge>
          </div>

          {showActions && (request.status === 'pending' || request.status === 'in_review') && canApproveRequests && (
            <div className="flex gap-2 mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleApprove(request.id)}
                disabled={updateRequestStatus.isPending}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                className="flex-1"
                onClick={() => handleRejectClick(request.id)}
                disabled={updateRequestStatus.isPending}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <EmployeeLayout>
      <div className="space-y-6 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <Send className="h-7 w-7" />
              {canViewTeamData ? 'Requests Management' : 'My Requests'}
            </h1>
            <p className="text-muted-foreground">
              {canViewTeamData ? 'Manage your requests and review team requests' : 'Submit and track your requests'}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit New Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Request Type *</Label>
                    <Select 
                      value={newRequest.request_type} 
                      onValueChange={(v) => setNewRequest(p => ({ ...p, request_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select 
                      value={newRequest.priority} 
                      onValueChange={(v) => setNewRequest(p => ({ ...p, priority: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={newRequest.title}
                    onChange={(e) => setNewRequest(p => ({ ...p, title: e.target.value }))}
                    placeholder="Brief title for your request"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newRequest.description}
                    onChange={(e) => setNewRequest(p => ({ ...p, description: e.target.value }))}
                    placeholder="Describe your request in detail..."
                    rows={5}
                  />
                </div>
                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  disabled={!newRequest.request_type || !newRequest.title || addRequest.isPending}
                >
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {[
            { label: 'Total', value: myRequests.length, icon: AlertCircle, color: 'from-slate-500 to-slate-600' },
            { label: 'Pending', value: pendingRequests.length, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Approved', value: approvedRequests.length, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
            { label: 'Rejected', value: rejectedRequests.length, icon: XCircle, color: 'from-red-500 to-rose-500' },
            ...(canViewTeamData ? [{ label: 'Team Pending', value: teamPendingCount, icon: Users, color: 'from-blue-500 to-cyan-500' }] : []),
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`relative overflow-hidden rounded-xl p-4 bg-gradient-to-br text-white ${stat.color}`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
                <Icon className="h-5 w-5 mb-2 opacity-80" />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-white/80 text-xs">{stat.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-lg shadow-black/5">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-muted/50 border-0"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-[150px] bg-muted/50 border-0">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-[150px] bg-muted/50 border-0">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {requestTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Content based on role */}
        {canViewTeamData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="my-requests" className="flex-1 sm:flex-none">
                <User className="h-4 w-4 mr-2" />
                My Requests ({filteredMyRequests.length})
              </TabsTrigger>
              <TabsTrigger value="team-requests" className="flex-1 sm:flex-none relative">
                <Users className="h-4 w-4 mr-2" />
                Team Requests ({filteredTeamRequests.length})
                {teamPendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {teamPendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-requests" className="mt-6">
              <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
                  {filteredMyRequests.map(request => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
                {filteredMyRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No requests found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team-requests" className="mt-6">
              <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
                  {filteredTeamRequests.map(request => (
                    <RequestCard key={request.id} request={request} showActions />
                  ))}
                </div>
                {filteredTeamRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team requests found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-[calc(100vh-450px)] min-h-[400px]">
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
              {filteredMyRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
            {filteredMyRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No requests found. Click "New Request" to submit one.</p>
              </div>
            )}
          </ScrollArea>
        )}

        {/* Request Detail Sheet */}
        <RequestDetailSheet
          request={selectedRequest}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Rejection Reason (Optional)</Label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleRejectConfirm}
                disabled={updateRequestStatus.isPending}
              >
                Confirm Rejection
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EmployeeLayout>
  );
}
