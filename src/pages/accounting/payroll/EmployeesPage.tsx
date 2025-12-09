import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Users } from 'lucide-react';

const employees = [
  { id: 'EMP-001', name: 'John Smith', department: 'Engineering', position: 'Senior Developer', salary: 95000, payType: 'Salary', status: 'active' },
  { id: 'EMP-002', name: 'Jane Doe', department: 'Marketing', position: 'Marketing Manager', salary: 85000, payType: 'Salary', status: 'active' },
  { id: 'EMP-003', name: 'Bob Wilson', department: 'Sales', position: 'Sales Rep', salary: 60000, payType: 'Salary + Commission', status: 'active' },
  { id: 'EMP-004', name: 'Alice Brown', department: 'HR', position: 'HR Specialist', salary: 65000, payType: 'Salary', status: 'active' },
  { id: 'EMP-005', name: 'Mike Johnson', department: 'Operations', position: 'Warehouse Worker', salary: 35, payType: 'Hourly', status: 'active' },
];

export default function PayrollEmployeesPage() {
  return (
    <AccountingLayout title="Payroll Employees">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search employees..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Employees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Position</TableHead>
                  <TableHead>Pay Type</TableHead>
                  <TableHead className="text-right">Salary/Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.id}</TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{emp.payType}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {emp.payType === 'Hourly' ? `$${emp.salary}/hr` : `$${emp.salary.toLocaleString()}/yr`}
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">{emp.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
