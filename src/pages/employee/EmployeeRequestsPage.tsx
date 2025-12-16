import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { RequestDetailSheet } from '@/components/employee/RequestDetailSheet';
import { useEmployeeRequests, useAddEmployeeRequest, EmployeeRequest } from '@/hooks/useEmployeeDashboard';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, Search, Filter, Send } from 'lucide-react';
import { format } from 'date-fns';

const requestTypes = [
  { value: 'equipment', label: 'Equipment Request' },
  { value: 'training', label: 'Training Request' },
  { value: 'expense', label: 'Expense Reimbursement' },
  { value: 'access', label: 'Access Request' },
  { value: 'transfer', label: 'Transfer Request' },
  { value: 'certificate', label: 'Certificate Request' },
  { value: 'other', label: 'Other' },
];

const priorityConfig = {
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
  
  const [newRequest, setNewRequest] = useState({
    request_type: '',
    title: '',
    description: '',
    priority: 'medium',
  });

  const { data: requests = [] } = useEmployeeRequests();
  const addRequest = useAddEmployeeRequest();

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesType = filterType === 'all' || request.request_type === filterType;
    const matchesSearch = searchQuery === '' || 
      request.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesType && matchesSearch;
  });

  const handleSubmit = () => {
    if (!newRequest.request_type || !newRequest.title) return;
    addRequest.mutate(newRequest);
    setNewRequest({ request_type: '', title: '', description: '', priority: 'medium' });
    setDialogOpen(false);
  };

  const handleRequestClick = (request: EmployeeRequest) => {
    setSelectedRequest(request);
    setSheetOpen(true);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const inReviewRequests = requests.filter(r => r.status === 'in_review');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Send className="h-8 w-8" />
              My Requests
            </h1>
            <p className="text-muted-foreground">Submit and track your requests</p>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-muted">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{requests.length}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
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
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
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
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-450px)]">
              <div className="space-y-3">
                {filteredRequests.map((request) => {
                  const config = statusConfig[request.status] || statusConfig.pending;
                  const priority = priorityConfig[request.priority as keyof typeof priorityConfig] || priorityConfig.medium;
                  const StatusIcon = config.icon;
                  
                  return (
                    <div 
                      key={request.id} 
                      onClick={() => handleRequestClick(request)}
                      className="flex items-start gap-4 p-4 rounded-lg border cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <StatusIcon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{request.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {requestTypes.find(t => t.value === request.request_type)?.label || request.request_type}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${priority.color} text-white text-xs`}>
                              {priority.label}
                            </Badge>
                            <Badge variant="outline" className={config.color}>
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        {request.description && (
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{request.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Submitted: {format(new Date(request.created_at), 'PPP')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredRequests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No requests found. Click "New Request" to submit one.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Request Detail Sheet */}
        <RequestDetailSheet
          request={selectedRequest}
          open={sheetOpen}
          onOpenChange={setSheetOpen}
        />
      </div>
    </EmployeeLayout>
  );
}
