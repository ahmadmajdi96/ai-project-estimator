import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { EmployeeRequest } from '@/hooks/useEmployeeDashboard';
import { format, formatDistanceToNow } from 'date-fns';
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  FileText,
  History,
  Send,
  MessageSquare,
} from 'lucide-react';

interface RequestDetailSheetProps {
  request: EmployeeRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const statusConfig = {
  pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', borderColor: 'border-amber-500', label: 'Pending' },
  in_review: { icon: AlertCircle, color: 'text-blue-500', bg: 'bg-blue-500/10', borderColor: 'border-blue-500', label: 'In Review' },
  approved: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', borderColor: 'border-green-500', label: 'Approved' },
  rejected: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10', borderColor: 'border-red-500', label: 'Rejected' },
};

export function RequestDetailSheet({ request, open, onOpenChange }: RequestDetailSheetProps) {
  if (!request) return null;

  const status = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.pending;
  const priority = priorityConfig[request.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const StatusIcon = status.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b bg-muted/30">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge className={`${status.bg} ${status.color} border ${status.borderColor}`}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {status.label}
                  </Badge>
                  <Badge className={`${priority.color} text-white`}>{priority.label}</Badge>
                </div>
                <h2 className="text-2xl font-bold">{request.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Send className="h-4 w-4" />
                    {requestTypes.find(t => t.value === request.request_type)?.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <ScrollArea className="flex-1">
            <div className="p-6">
              <Tabs defaultValue="details" className="space-y-6">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="details" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Details
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2">
                    <History className="h-4 w-4" />
                    Activity
                  </TabsTrigger>
                </TabsList>

                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                    <div className="p-4 rounded-lg border bg-card min-h-[120px]">
                      {request.description || (
                        <span className="text-muted-foreground italic">No description provided</span>
                      )}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Status</Label>
                        <div className={`flex items-center gap-2 mt-1 p-2 rounded-lg ${status.bg}`}>
                          <StatusIcon className={`h-5 w-5 ${status.color}`} />
                          <span className="font-medium">{status.label}</span>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Priority</Label>
                        <div className="mt-1">
                          <Badge className={`${priority.color} text-white`}>{priority.label}</Badge>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Request Type</Label>
                        <p className="mt-1 font-medium">
                          {requestTypes.find(t => t.value === request.request_type)?.label}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Submitted On</Label>
                        <p className="mt-1 font-medium">{format(new Date(request.created_at), 'PPpp')}</p>
                      </div>
                      {request.updated_at && request.updated_at !== request.created_at && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Last Updated</Label>
                          <p className="mt-1 font-medium">{format(new Date(request.updated_at), 'PPpp')}</p>
                        </div>
                      )}
                      {request.approved_by && (
                        <div>
                          <Label className="text-sm text-muted-foreground">
                            {request.status === 'approved' ? 'Approved By' : 'Reviewed By'}
                          </Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback>
                                <User className="h-3 w-3" />
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">Manager</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Approval Info */}
                  {request.status === 'approved' && (
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                      <div className="flex items-center gap-2 text-green-600 font-semibold mb-2">
                        <CheckCircle className="h-5 w-5" />
                        Request Approved
                      </div>
                      {request.approved_at && (
                        <p className="text-xs text-muted-foreground">
                          Approved on {format(new Date(request.approved_at), 'PPpp')}
                        </p>
                      )}
                    </div>
                  )}

                  {request.status === 'rejected' && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <div className="flex items-center gap-2 text-red-600 font-semibold mb-2">
                        <XCircle className="h-5 w-5" />
                        Request Rejected
                      </div>
                      {request.approved_at && (
                        <p className="text-xs text-muted-foreground">
                          Rejected on {format(new Date(request.approved_at), 'PPpp')}
                        </p>
                      )}
                    </div>
                  )}
                </TabsContent>

                {/* Activity Tab */}
                <TabsContent value="activity" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Send className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Request Submitted</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(request.created_at), 'PPpp')}
                        </p>
                      </div>
                    </div>
                    {request.status === 'in_review' && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <AlertCircle className="h-4 w-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Under Review</p>
                          <p className="text-xs text-muted-foreground">Your request is being reviewed</p>
                        </div>
                      </div>
                    )}
                    {request.approved_at && (
                      <div className="flex gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          request.status === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10'
                        }`}>
                          {request.status === 'approved' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Request {request.status === 'approved' ? 'Approved' : 'Rejected'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(request.approved_at), 'PPpp')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>

          {/* Actions Footer */}
          <div className="p-4 border-t bg-muted/30">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="ml-auto">
              Close
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
