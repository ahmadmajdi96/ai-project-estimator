import { useState } from "react";
import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, Check, X, Clock, FileText } from "lucide-react";
import { useLeaveRequests, useUpdateLeaveRequest, useLeaveTypes } from "@/hooks/useHR";
import { format } from "date-fns";

export default function HRLeavePage() {
  const [activeTab, setActiveTab] = useState("pending");
  const { data: leaveRequests, isLoading } = useLeaveRequests(activeTab === "all" ? undefined : activeTab);
  const { data: leaveTypes } = useLeaveTypes();
  const updateLeaveRequest = useUpdateLeaveRequest();

  const handleApprove = async (id: string) => {
    await updateLeaveRequest.mutateAsync({ id, status: "approved" });
  };

  const handleReject = async (id: string) => {
    await updateLeaveRequest.mutateAsync({ id, status: "rejected" });
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      pending: { variant: "secondary", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
      approved: { variant: "default", className: "bg-green-500/10 text-green-600 border-green-500/20" },
      rejected: { variant: "destructive" },
      cancelled: { variant: "outline" },
    };
    return (
      <Badge variant={config[status]?.variant || "default"} className={config[status]?.className}>
        {status}
      </Badge>
    );
  };

  const pendingCount = leaveRequests?.filter((r: any) => r.status === "pending").length || 0;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Leave Management</h1>
            <p className="text-muted-foreground">Manage employee leave requests and balances</p>
          </div>
        </div>

        {/* Leave Types Overview */}
        <div className="grid gap-4 md:grid-cols-5">
          {leaveTypes?.map((type: any) => (
            <Card key={type.id}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{type.name}</p>
                    <p className="text-xs text-muted-foreground">{type.days_allowed} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Leave Requests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Leave Requests
              {pendingCount > 0 && (
                <Badge variant="secondary">{pendingCount} pending</Badge>
              )}
            </CardTitle>
            <CardDescription>Review and manage leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="mt-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : leaveRequests && leaveRequests.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        {activeTab === "pending" && <TableHead>Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaveRequests.map((request: any) => (
                        <TableRow key={request.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{request.employees?.employee_code || 'N/A'}</p>
                              <p className="text-sm text-muted-foreground">{request.employees?.position}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{request.leave_type?.name || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell>{format(new Date(request.start_date), "MMM d, yyyy")}</TableCell>
                          <TableCell>{format(new Date(request.end_date), "MMM d, yyyy")}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{request.reason || "-"}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          {activeTab === "pending" && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => handleApprove(request.id)}
                                  disabled={updateLeaveRequest.isPending}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(request.id)}
                                  disabled={updateLeaveRequest.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No leave requests found
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
