import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { RequestDetailSheet } from '@/components/employee/RequestDetailSheet';
import { useAddEmployeeRequest, EmployeeRequest } from '@/hooks/useEmployeeDashboard';
import { useRoleBasedRequests, useUpdateRequestStatus } from '@/hooks/useRoleBasedData';
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Search, Send, Users, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';

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

  const handleReject = (requestId: string) => {
    updateRequestStatus.mutate({ requestId, status: 'rejected' });
  };

  const pendingRequests = myRequests.filter(r => r.status === 'pending');
  const inReviewRequests = myRequests.filter(r => r.status === 'in_review');
  const approvedRequests = myRequests.filter(r => r.status === 'approved');
  const rejectedRequests = myRequests.filter(r => r.status === 'rejected');

  const teamPendingCount = teamRequests.filter(r => r.status === 'pending' || r.status === 'in_review').length;

  const RequestCard = ({ request, showActions = false }: { request: any; showActions?: boolean }) => {
    const status = statusConfig[request.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const priority = priorityConfig[request.priority] || priorityConfig.medium;

    return (
      <Card 
        className="hover:shadow-md transition-shadow cursor-pointer"
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
          {request.employees?.full_name && (
            <p className="text-xs text-muted-foreground mb-2">By: {request.employees.full_name}</p>
          )}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {request.description || 'No description provided'}
          </p>
          
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
                variant="outline" 
                className="flex-1 text-green-600 hover:bg-green-50"
                onClick={() => handleApprove(request.id)}
                disabled={updateRequestStatus.isPending}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 text-red-600 hover:bg-red-50"
                onClick={() => handleReject(request.id)}
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Send className="h-8 w-8" />
              {canViewTeamData ? 'Requests Management' : 'My Requests'}
            </h1>
            <p className="text-muted-foreground">
              {canViewTeamData ? 'Manage your requests and review team requests' : 'Submit and track your requests'}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{myRequests.length}</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Clock className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingRequests.length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/10">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </CardContent>
          </Card>
          {canViewTeamData && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{teamPendingCount}</p>
                  <p className="text-sm text-muted-foreground">Team Pending</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px]">
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
            <SelectTrigger className="w-[150px]">
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

        {/* Content based on role */}
        {canViewTeamData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-requests">My Requests ({filteredMyRequests.length})</TabsTrigger>
              <TabsTrigger value="team-requests" className="relative">
                Team Requests ({filteredTeamRequests.length})
                {teamPendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {teamPendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-requests" className="mt-6">
              <ScrollArea className="h-[calc(100vh-450px)]">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMyRequests.map(request => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </div>
                {filteredMyRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No requests found
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team-requests" className="mt-6">
              <ScrollArea className="h-[calc(100vh-450px)]">
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeamRequests.map(request => (
                    <RequestCard key={request.id} request={request} showActions />
                  ))}
                </div>
                {filteredTeamRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    No team requests found
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
          <ScrollArea className="h-[calc(100vh-400px)]">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMyRequests.map(request => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
            {filteredMyRequests.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                No requests found
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      <RequestDetailSheet
        request={selectedRequest}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </EmployeeLayout>
  );
}
