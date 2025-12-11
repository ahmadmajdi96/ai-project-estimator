import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Calendar, FileText, Download, Plus, TrendingUp } from "lucide-react";
import { usePayrollPeriods, usePayrollEntries } from "@/hooks/useHR";
import { format } from "date-fns";

export default function HRPayrollPage() {
  const { data: periods, isLoading: periodsLoading } = usePayrollPeriods();
  const { data: entries, isLoading: entriesLoading } = usePayrollEntries();

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
      draft: { variant: "secondary" },
      processing: { variant: "secondary", className: "bg-yellow-500/10 text-yellow-600" },
      approved: { variant: "default", className: "bg-blue-500" },
      paid: { variant: "default", className: "bg-green-500" },
    };
    return (
      <Badge variant={config[status]?.variant || "default"} className={config[status]?.className}>
        {status}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const currentPeriod = periods?.[0];
  const totalGross = entries?.reduce((sum: number, e: any) => sum + (e.gross_pay || 0), 0) || 0;
  const totalNet = entries?.reduce((sum: number, e: any) => sum + (e.net_pay || 0), 0) || 0;

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payroll Management</h1>
            <p className="text-muted-foreground">Process and manage employee payroll</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Payroll Run
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Period</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{currentPeriod?.name || "No active period"}</div>
              {currentPeriod && (
                <p className="text-xs text-muted-foreground">
                  {format(new Date(currentPeriod.start_date), "MMM d")} - {format(new Date(currentPeriod.end_date), "MMM d, yyyy")}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalGross)}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Net</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalNet)}</div>
              <p className="text-xs text-muted-foreground">After deductions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Employees</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{entries?.length || 0}</div>
              <p className="text-xs text-muted-foreground">In payroll</p>
            </CardContent>
          </Card>
        </div>

        {/* Payroll Periods */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Periods</CardTitle>
            <CardDescription>View and manage payroll cycles</CardDescription>
          </CardHeader>
          <CardContent>
            {periodsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : periods && periods.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Pay Date</TableHead>
                    <TableHead>Total Gross</TableHead>
                    <TableHead>Total Net</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period: any) => (
                    <TableRow key={period.id}>
                      <TableCell className="font-medium">{period.name}</TableCell>
                      <TableCell>{format(new Date(period.start_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>{format(new Date(period.end_date), "MMM d, yyyy")}</TableCell>
                      <TableCell>
                        {period.pay_date ? format(new Date(period.pay_date), "MMM d, yyyy") : "-"}
                      </TableCell>
                      <TableCell>{formatCurrency(period.total_gross || 0)}</TableCell>
                      <TableCell>{formatCurrency(period.total_net || 0)}</TableCell>
                      <TableCell>{getStatusBadge(period.status)}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No payroll periods found
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payroll Entries */}
        <Card>
          <CardHeader>
            <CardTitle>Payroll Entries</CardTitle>
            <CardDescription>Individual employee payroll records</CardDescription>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : entries && entries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Base Salary</TableHead>
                    <TableHead>Bonuses</TableHead>
                    <TableHead>Overtime</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry: any) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.employees?.employee_code || 'N/A'}</p>
                          <p className="text-sm text-muted-foreground">{entry.employees?.position}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatCurrency(entry.base_salary || 0)}</TableCell>
                      <TableCell>{formatCurrency(entry.bonuses || 0)}</TableCell>
                      <TableCell>{formatCurrency(entry.overtime_pay || 0)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(entry.gross_pay || 0)}</TableCell>
                      <TableCell className="text-red-500">-{formatCurrency(entry.tax_amount || 0)}</TableCell>
                      <TableCell className="font-bold text-green-600">{formatCurrency(entry.net_pay || 0)}</TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No payroll entries found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
