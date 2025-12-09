import { AccountingLayout } from '@/components/accounting/AccountingLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Search, Filter, Briefcase } from 'lucide-react';

const projects = [
  { id: 'PRJ-001', name: 'Website Redesign', client: 'ABC Corp', budget: 50000, spent: 35000, revenue: 45000, progress: 70, status: 'active' },
  { id: 'PRJ-002', name: 'Mobile App Development', client: 'XYZ Ltd', budget: 120000, spent: 80000, revenue: 100000, progress: 65, status: 'active' },
  { id: 'PRJ-003', name: 'ERP Implementation', client: 'Tech Inc', budget: 200000, spent: 190000, revenue: 200000, progress: 95, status: 'active' },
  { id: 'PRJ-004', name: 'Data Migration', client: 'Global Co', budget: 30000, spent: 30000, revenue: 30000, progress: 100, status: 'completed' },
  { id: 'PRJ-005', name: 'Security Audit', client: 'Local Shop', budget: 15000, spent: 5000, revenue: 0, progress: 30, status: 'on-hold' },
];

export default function ProjectsPage() {
  return (
    <AccountingLayout title="Projects">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." className="pl-9 w-64" />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead className="text-right">Budget</TableHead>
                  <TableHead className="text-right">Spent</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                  <TableHead className="w-32">Progress</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.id}</TableCell>
                    <TableCell>{project.name}</TableCell>
                    <TableCell>{project.client}</TableCell>
                    <TableCell className="text-right">${project.budget.toLocaleString()}</TableCell>
                    <TableCell className="text-right">${project.spent.toLocaleString()}</TableCell>
                    <TableCell className="text-right text-green-600">${project.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-2 flex-1" />
                        <span className="text-xs w-8">{project.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        project.status === 'completed' ? 'default' :
                        project.status === 'active' ? 'secondary' : 'outline'
                      }>
                        {project.status}
                      </Badge>
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
