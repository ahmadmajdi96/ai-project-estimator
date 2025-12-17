import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { useLeaveTypes, useAddLeaveRequest } from '@/hooks/useHR';
import { useRoleBasedLeaveRequests, useUpdateLeaveStatus } from '@/hooks/useRoleBasedData';
import { useUserRole } from '@/hooks/useUserRole';
import { Plus, Calendar, Clock, CheckCircle, AlertCircle, XCircle, Users, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'sonner';

const statusConfig: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  pending: { color: 'text-amber-600', bg: 'bg-amber-500', icon: Clock },
  approved: { color: 'text-green-600', bg: 'bg-green-500', icon: CheckCircle },
  rejected: { color: 'text-red-600', bg: 'bg-red-500', icon: XCircle },
};

export default function EmployeeLeavePage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingLeaveId, setRejectingLeaveId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  const [newLeave, setNewLeave] = useState({
    leave_type_id: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const { data: roleBasedData } = useRoleBasedLeaveRequests();
  const { data: leaveTypes = [] } = useLeaveTypes();
  const addLeaveRequest = useAddLeaveRequest();
  const updateLeaveStatus = useUpdateLeaveStatus();
  const { canApproveRequests, canViewTeamData, employeeId } = useUserRole();

  const myLeaves = roleBasedData?.myLeaves || [];
  const teamLeaves = roleBasedData?.teamLeaves || [];

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return 0;
    return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
  };

  const isValidDateRange = () => {
    if (!newLeave.start_date || !newLeave.end_date) return true;
    return parseISO(newLeave.end_date) >= parseISO(newLeave.start_date);
  };

  const handleSubmit = () => {
    if (!newLeave.leave_type_id || !newLeave.start_date || !newLeave.end_date || !employeeId) return;
    
    if (!isValidDateRange()) {
      toast.error('End date cannot be earlier than start date');
      return;
    }
    
    addLeaveRequest.mutate({
      employee_id: employeeId,
      leave_type_id: newLeave.leave_type_id,
      start_date: newLeave.start_date,
      end_date: newLeave.end_date,
      reason: newLeave.reason,
    });
    setNewLeave({ leave_type_id: '', start_date: '', end_date: '', reason: '' });
    setDialogOpen(false);
  };

  const handleApprove = (leaveId: string) => {
    updateLeaveStatus.mutate({ leaveId, status: 'approved' });
  };

  const handleRejectClick = (leaveId: string) => {
    setRejectingLeaveId(leaveId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectingLeaveId) return;
    updateLeaveStatus.mutate({ 
      leaveId: rejectingLeaveId, 
      status: 'rejected',
      rejectionReason: rejectionReason || undefined
    });
    setRejectDialogOpen(false);
    setRejectingLeaveId(null);
    setRejectionReason('');
  };

  const pendingLeaves = myLeaves.filter((l: any) => l.status === 'pending');
  const approvedLeaves = myLeaves.filter((l: any) => l.status === 'approved');
  const rejectedLeaves = myLeaves.filter((l: any) => l.status === 'rejected');
  const totalDaysTaken = approvedLeaves.reduce((sum: number, l: any) => sum + calculateDays(l.start_date, l.end_date), 0);
  const teamPendingCount = teamLeaves.filter((l: any) => l.status === 'pending').length;

  const LeaveCard = ({ leave, showActions = false }: { leave: any; showActions?: boolean }) => {
    const config = statusConfig[leave.status] || statusConfig.pending;
    const StatusIcon = config.icon;
    const days = calculateDays(leave.start_date, leave.end_date);
    const employeeName = leave.employees?.full_name || 'Unknown';
    const initials = employeeName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
      <Card className="border-0 shadow-sm hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${config.bg}/10`}>
                <StatusIcon className={`h-4 w-4 ${config.color}`} />
              </div>
              <Badge variant="outline">{leave.leave_type?.name || 'Leave'}</Badge>
            </div>
            <Badge className={config.bg}>{leave.status}</Badge>
          </div>

          {showActions && leave.employees?.full_name && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[10px] bg-primary/10">{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{leave.employees.full_name}</span>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-medium">{leave.start_date ? format(parseISO(leave.start_date), 'MMM d, yyyy') : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">End Date</span>
              <span className="font-medium">{leave.end_date ? format(parseISO(leave.end_date), 'MMM d, yyyy') : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-medium">{days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '-'}</span>
            </div>
          </div>

          {leave.reason && (
            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{leave.reason}</p>
          )}

          {leave.rejection_reason && leave.status === 'rejected' && (
            <div className="mt-3 p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
              <p className="text-xs text-red-600 dark:text-red-400">
                <strong>Rejection reason:</strong> {leave.rejection_reason}
              </p>
            </div>
          )}

          {showActions && leave.status === 'pending' && canApproveRequests && (
            <div className="flex gap-2 mt-3 pt-3 border-t">
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={() => handleApprove(leave.id)}
                disabled={updateLeaveStatus.isPending}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                className="flex-1"
                onClick={() => handleRejectClick(leave.id)}
                disabled={updateLeaveStatus.isPending}
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
              <Calendar className="h-7 w-7" />
              {canViewTeamData ? 'Leave Management' : 'My Leave'}
            </h1>
            <p className="text-muted-foreground">
              {canViewTeamData ? 'Manage your leave and review team requests' : 'Request and track your leave'}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg shadow-primary/20">
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
                    value={newLeave.leave_type_id} 
                    onValueChange={(v) => setNewLeave(p => ({ ...p, leave_type_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select leave type" />
                    </SelectTrigger>
                    <SelectContent>
                      {leaveTypes.map((t: any) => (
                        <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
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
                  <div className={`text-sm flex items-center gap-2 ${!isValidDateRange() ? 'text-red-500' : 'text-muted-foreground'}`}>
                    {!isValidDateRange() ? (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        <span>End date cannot be earlier than start date</span>
                      </>
                    ) : (
                      <span>Duration: {calculateDays(newLeave.start_date, newLeave.end_date)} days</span>
                    )}
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
                <Button 
                  onClick={handleSubmit} 
                  className="w-full" 
                  disabled={addLeaveRequest.isPending || !employeeId || !isValidDateRange()}
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
            { label: 'Total Requests', value: myLeaves.length, icon: Calendar, color: 'from-slate-500 to-slate-600' },
            { label: 'Pending', value: pendingLeaves.length, icon: Clock, color: 'from-amber-500 to-orange-500' },
            { label: 'Approved', value: approvedLeaves.length, icon: CheckCircle, color: 'from-emerald-500 to-green-500' },
            { label: 'Days Taken', value: totalDaysTaken, icon: Calendar, color: 'from-blue-500 to-cyan-500' },
            ...(canViewTeamData ? [{ label: 'Team Pending', value: teamPendingCount, icon: Users, color: 'from-purple-500 to-pink-500' }] : []),
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

        {/* Content */}
        {canViewTeamData ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="my-leaves" className="flex-1 sm:flex-none">
                <User className="h-4 w-4 mr-2" />
                My Leave ({myLeaves.length})
              </TabsTrigger>
              <TabsTrigger value="team-leaves" className="flex-1 sm:flex-none relative">
                <Users className="h-4 w-4 mr-2" />
                Team Leave ({teamLeaves.length})
                {teamPendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {teamPendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="my-leaves" className="mt-6">
              <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
                  {myLeaves.map(leave => (
                    <LeaveCard key={leave.id} leave={leave} />
                  ))}
                </div>
                {myLeaves.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No leave requests. Click "Request Leave" to submit one.</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="team-leaves" className="mt-6">
              <ScrollArea className="h-[calc(100vh-500px)] min-h-[400px]">
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 pr-4">
                  {teamLeaves.map(leave => (
                    <LeaveCard key={leave.id} leave={leave} showActions />
                  ))}
                </div>
                {teamLeaves.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team leave requests found</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        ) : (
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
                  {(myLeaves as any[]).map((leave: any) => {
                    const config = statusConfig[leave.status || 'pending'];
                    const days = calculateDays(leave.start_date, leave.end_date);
                    return (
                      <TableRow key={leave.id}>
                        <TableCell className="font-medium capitalize">
                          {leave.leave_type?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {leave.start_date ? format(parseISO(leave.start_date), 'PPP') : '-'}
                        </TableCell>
                        <TableCell>
                          {leave.end_date ? format(parseISO(leave.end_date), 'PPP') : '-'}
                        </TableCell>
                        <TableCell>{days > 0 ? days : '-'}</TableCell>
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
                  {myLeaves.length === 0 && (
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
        )}

        {/* Rejection Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Leave Request</DialogTitle>
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
                disabled={updateLeaveStatus.isPending}
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
