import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { EmployeeLayout } from '@/components/employee/EmployeeLayout';
import { useSalarySlips, SalarySlip } from '@/hooks/useEmployeeDashboard';
import { DollarSign, Download, Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function EmployeeSalaryPage() {
  const { data: salarySlips = [] } = useSalarySlips();
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);

  const latestSlip = salarySlips[0];
  const previousSlip = salarySlips[1];
  
  const netChange = latestSlip && previousSlip 
    ? latestSlip.net_salary - previousSlip.net_salary 
    : 0;

  const totalEarnings = salarySlips.reduce((sum, s) => sum + (s.net_salary || 0), 0);
  const avgNetSalary = salarySlips.length > 0 ? totalEarnings / salarySlips.length : 0;

  return (
    <EmployeeLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Salary Slips</h1>
          <p className="text-muted-foreground">View your salary history and deductions</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Latest Net Salary</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${latestSlip?.net_salary?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">vs Previous</p>
                  <p className={`text-2xl font-bold ${netChange > 0 ? 'text-green-600' : netChange < 0 ? 'text-red-600' : ''}`}>
                    {netChange > 0 ? '+' : ''}{netChange.toLocaleString()}
                  </p>
                </div>
                {netChange > 0 ? (
                  <TrendingUp className="h-8 w-8 text-green-500" />
                ) : netChange < 0 ? (
                  <TrendingDown className="h-8 w-8 text-red-500" />
                ) : (
                  <Minus className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Net</p>
                  <p className="text-2xl font-bold">${avgNetSalary.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Slips</p>
                  <p className="text-2xl font-bold">{salarySlips.length}</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Salary Slips Table */}
        <Card>
          <CardHeader>
            <CardTitle>Salary History</CardTitle>
            <CardDescription>All your salary slips with detailed breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Deductions</TableHead>
                  <TableHead className="text-right">Net Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salarySlips.map((slip) => (
                  <TableRow key={slip.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {format(new Date(slip.period_start), 'MMM d')} - {format(new Date(slip.period_end), 'MMM d, yyyy')}
                        </p>
                        {slip.payment_date && (
                          <p className="text-xs text-muted-foreground">
                            Paid: {format(new Date(slip.payment_date), 'PPP')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${slip.gross_salary?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-red-500">
                      -${slip.total_deductions?.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      ${slip.net_salary?.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        slip.payment_status === 'paid' ? 'bg-green-500' :
                        slip.payment_status === 'pending' ? 'bg-amber-500' :
                        'bg-slate-500'
                      }>
                        {slip.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedSlip(slip)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Salary Slip Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="text-center pb-4 border-b">
                              <p className="font-medium">
                                {format(new Date(slip.period_start), 'MMMM d')} - {format(new Date(slip.period_end), 'MMMM d, yyyy')}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-green-600">Earnings</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Basic Salary</span>
                                  <span>${slip.basic_salary?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Allowances</span>
                                  <span>${slip.allowances?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Bonuses</span>
                                  <span>${slip.bonuses?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium pt-2 border-t">
                                  <span>Gross Salary</span>
                                  <span>${slip.gross_salary?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <h4 className="font-medium text-red-600">Deductions</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Tax</span>
                                  <span className="text-red-500">-${slip.tax_deduction?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Insurance</span>
                                  <span className="text-red-500">-${slip.insurance_deduction?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Pension</span>
                                  <span className="text-red-500">-${slip.pension_deduction?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Other</span>
                                  <span className="text-red-500">-${slip.other_deductions?.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between font-medium pt-2 border-t">
                                  <span>Total Deductions</span>
                                  <span className="text-red-500">-${slip.total_deductions?.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-between items-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                              <span className="font-bold text-lg">Net Salary</span>
                              <span className="font-bold text-2xl text-green-600">
                                ${slip.net_salary?.toLocaleString()}
                              </span>
                            </div>

                            {slip.notes && (
                              <div className="text-sm text-muted-foreground">
                                <p className="font-medium">Notes:</p>
                                <p>{slip.notes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
                {salarySlips.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No salary slips available yet
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
