import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Users } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
  position: string;
  payType: string;
  salary: number;
  status: string;
}

const initialEmployees: Employee[] = [
  { id: 'EMP-001', name: 'John Smith', department: 'Engineering', position: 'Senior Developer', payType: 'Salary', salary: 95000, status: 'active' },
  { id: 'EMP-002', name: 'Jane Doe', department: 'Marketing', position: 'Marketing Manager', payType: 'Salary', salary: 85000, status: 'active' },
  { id: 'EMP-003', name: 'Bob Wilson', department: 'Sales', position: 'Sales Rep', payType: 'Salary + Commission', salary: 60000, status: 'active' },
  { id: 'EMP-004', name: 'Alice Brown', department: 'HR', position: 'HR Specialist', payType: 'Salary', salary: 65000, status: 'active' },
  { id: 'EMP-005', name: 'Mike Johnson', department: 'Operations', position: 'Warehouse Worker', payType: 'Hourly', salary: 35, status: 'active' },
];

const columns: Column<Employee>[] = [
  { key: 'id', label: 'Employee ID', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'department', label: 'Department', type: 'select', options: [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'HR' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Finance', label: 'Finance' },
  ]},
  { key: 'position', label: 'Position', type: 'text' },
  { key: 'payType', label: 'Pay Type', type: 'select', options: [
    { value: 'Salary', label: 'Salary' },
    { value: 'Hourly', label: 'Hourly' },
    { value: 'Salary + Commission', label: 'Salary + Commission' },
  ]},
  { key: 'salary', label: 'Salary/Rate', type: 'currency', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' },
      { value: 'terminated', label: 'Terminated' },
    ],
    badgeVariant: (value) => value === 'active' ? 'default' : value === 'terminated' ? 'destructive' : 'secondary',
  },
];

export default function PayrollEmployeesPage() {
  return (
    <AccountingLayout title="Payroll Employees">
      <AccountingDataTable
        title="Employees"
        icon={Users}
        data={initialEmployees}
        columns={columns}
        addButtonLabel="Add Employee"
        searchPlaceholder="Search employees..."
      />
    </AccountingLayout>
  );
}
