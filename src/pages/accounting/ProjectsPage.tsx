import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { AccountingDataTable, Column } from '@/components/accounting/AccountingDataTable';
import { Briefcase } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  client: string;
  budget: number;
  spent: number;
  revenue: number;
  progress: number;
  status: string;
}

const initialProjects: Project[] = [
  { id: 'PRJ-001', name: 'Website Redesign', client: 'ABC Corp', budget: 50000, spent: 35000, revenue: 45000, progress: 70, status: 'active' },
  { id: 'PRJ-002', name: 'Mobile App Development', client: 'XYZ Ltd', budget: 120000, spent: 80000, revenue: 100000, progress: 65, status: 'active' },
  { id: 'PRJ-003', name: 'ERP Implementation', client: 'Tech Inc', budget: 200000, spent: 190000, revenue: 200000, progress: 95, status: 'active' },
  { id: 'PRJ-004', name: 'Data Migration', client: 'Global Co', budget: 30000, spent: 30000, revenue: 30000, progress: 100, status: 'completed' },
  { id: 'PRJ-005', name: 'Security Audit', client: 'Local Shop', budget: 15000, spent: 5000, revenue: 0, progress: 30, status: 'on-hold' },
];

const columns: Column<Project>[] = [
  { key: 'id', label: 'Project ID', type: 'text' },
  { key: 'name', label: 'Name', type: 'text' },
  { key: 'client', label: 'Client', type: 'text' },
  { key: 'budget', label: 'Budget', type: 'currency', align: 'right' },
  { key: 'spent', label: 'Spent', type: 'currency', align: 'right' },
  { key: 'revenue', label: 'Revenue', type: 'currency', align: 'right' },
  { key: 'progress', label: 'Progress %', type: 'number', align: 'right' },
  { 
    key: 'status', 
    label: 'Status', 
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'on-hold', label: 'On Hold' },
    ],
    badgeVariant: (value) => {
      if (value === 'completed') return 'default';
      if (value === 'on-hold') return 'destructive';
      return 'secondary';
    },
  },
];

export default function ProjectsPage() {
  return (
    <AccountingLayout title="Projects">
      <AccountingDataTable
        title="Projects"
        icon={Briefcase}
        data={initialProjects}
        columns={columns}
        addButtonLabel="New Project"
        searchPlaceholder="Search projects..."
      />
    </AccountingLayout>
  );
}
