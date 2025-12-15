import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { useLeaveRequests, useAddLeaveRequest } from '@/hooks/useHR';
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

const leaveTypes = [
  { value: 'annual', label: 'Annual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'personal', label: 'Personal Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
  { value: 'other', label: 'Other' },
];

const statusConfig: Record<string, { color: string; bg: string }> = {
  pending: { color: 'text-amber-600', bg: 'bg-amber-500' },
  approved: { color: 'text-green-600', bg: 'bg-green-500' },
  rejected: { color: 'text-red-600', bg: 'bg-red-500' },
};

export default function EmployeeLeavePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLeave, setNewLeave] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const { data: leaveRequests = [] } = useLeaveRequests();
  const addLeaveRequest = useAddLeaveRequest();

  const handleSubmit = () => {
    if (!newLeave.leave_type || !newLeave.start_date || !newLeave.end_date) return;
    
    const days = differenceInDays(new Date(newLeave.end_date), new Date(newLeave.start_date)) + 1;
    
    addLeaveRequest.mutate({
      leave_type: newLeave.leave_type,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      reason: newLeave.reason,
      days_requested: days,
      status: 'pending',
    });
    setNewLeave({ leave_type: '', start_date: '', end_date: '', reason: '' });
    setDialogOpen(false);
  };

  const pendingLeaves = leaveRequests.filter(l => l.status === 'pending');
  const approvedLeaves = leaveRequests.filter(l => l.status === 'approved');
  const totalDaysTaken = approvedLeaves.reduce((sum, l) => sum + (l.days_requested || 0), 0);

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground">Request and track your leave</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Request Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select 
                    value={newLeave.leave_type} 
                    onValueChange={(v) => setNewLeave(p => ({ ...p, leave_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={newLeave.start_date}
                      onChange={(e) => setNewLeave(p => ({ ...p, start_date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={newLeave.end_date}
                      onChange={(e) => setNewLeave(p => ({ ...p, end_date: e.target.value }))}
                    />
                  </div>
                </div>
                {newLeave.start_date && newLeave.end_date && (
                  <div className="text-sm text-muted-foreground">
                    Duration: {differenceInDays(new Date(newLeave.end_date), new Date(newLeave.start_date)) + 1} days
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea
                    value={newLeave.reason}
                    onChange={(e) => setNewLeave(p => ({ ...p, reason: e.target.value }))}
                    placeholder="Reason for leave request..."
                    rows={3}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full" disabled={addLeaveRequest.isPending}>
                  Submit Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requests</p>
                  <p className="text-2xl font-bold">{leaveRequests.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingLeaves.length}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{approvedLeaves.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Days Taken</p>
                  <p className="text-2xl font-bold">{totalDaysTaken}</p>
                </div>
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
            <CardDescription>All your leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Days</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRequests.map((leave) => {
                  const config = statusConfig[leave.status || 'pending'];
                  return (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium capitalize">
                        {leaveTypes.find(t => t.value === leave.leave_type)?.label || leave.leave_type}
                      </TableCell>
                      <TableCell>
                        {leave.start_date ? format(new Date(leave.start_date), 'PPP') : '-'}
                      </TableCell>
                      <TableCell>
                        {leave.end_date ? format(new Date(leave.end_date), 'PPP') : '-'}
                      </TableCell>
                      <TableCell>{leave.days_requested || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {leave.reason || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={config?.bg}>
                          {leave.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {leaveRequests.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No leave requests yet. Click "Request Leave" to submit one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </EmployeeLayout>
  );
}
