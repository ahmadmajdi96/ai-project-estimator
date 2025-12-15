import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { useEmployeeRequests, useAddEmployeeRequest } from '@/hooks/useEmployeeDashboard';
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
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

const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  in_review: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' },
};

export default function EmployeeRequestsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    request_type: '',
    title: '',
    description: '',
    priority: 'medium',
  });

  const { data: requests = [] } = useEmployeeRequests();
  const addRequest = useAddEmployeeRequest();

  const handleSubmit = () => {
    if (!newRequest.request_type || !newRequest.title) return;
    addRequest.mutate(newRequest);
    setNewRequest({ request_type: '', title: '', description: '', priority: 'medium' });
    setDialogOpen(false);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Requests</h1>
            <p className="text-muted-foreground">Submit and track your requests</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit New Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Request Type</Label>
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
                  <Label>Title</Label>
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
                    rows={4}
                  />
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
                <Button onClick={handleSubmit} className="w-full" disabled={addRequest.isPending}>
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <CardTitle>All Requests</CardTitle>
            <CardDescription>Your submitted requests and their status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {requests.map((request) => {
                const config = statusConfig[request.status] || statusConfig.pending;
                const StatusIcon = config.icon;
                return (
                  <div 
                    key={request.id} 
                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
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
                        <Badge variant="outline" className={config.color}>
                          {request.status}
                        </Badge>
                      </div>
                      {request.description && (
                        <p className="text-sm text-muted-foreground mt-2">{request.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Submitted: {format(new Date(request.created_at), 'PPP')}</span>
                        <Badge variant="secondary" className="text-xs">{request.priority}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
              {requests.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No requests yet. Click "New Request" to submit one.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
