import { Client, CLIENT_STATUSES, SALES_STAGES } from '@/types/crm';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeleteClient } from '@/hooks/useClients';
import { format } from 'date-fns';

interface ClientsTableProps {
  clients: Client[];
  onEdit: (client: Client) => void;
}

export function ClientsTable({ clients, onEdit }: ClientsTableProps) {
  const navigate = useNavigate();
  const deleteClient = useDeleteClient();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      await deleteClient.mutateAsync(id);
    }
  };

  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead>Client Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Industry</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">Contract Value</TableHead>
            <TableHead>Last Contact</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map(client => {
            const status = CLIENT_STATUSES.find(s => s.value === client.status);
            const stage = SALES_STAGES.find(s => s.value === client.sales_stage);
            
            return (
              <TableRow 
                key={client.id} 
                className="cursor-pointer hover:bg-muted/20"
                onClick={() => navigate(`/crm/clients/${client.id}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{client.client_name}</span>
                    {client.follow_up_needed && (
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{client.contact_person || '-'}</div>
                    <div className="text-muted-foreground">{client.email || ''}</div>
                  </div>
                </TableCell>
                <TableCell>{client.industry || '-'}</TableCell>
                <TableCell>
                  {status && <Badge className={`${status.color} text-xs`}>{status.label}</Badge>}
                </TableCell>
                <TableCell>
                  {stage && <Badge className={`${stage.color} text-xs`}>{stage.label}</Badge>}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${client.contract_value?.toLocaleString() || 0}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {client.last_contact 
                    ? format(new Date(client.last_contact), 'MMM d, yyyy')
                    : '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/crm/clients/${client.id}`); }}>
                        <Eye className="mr-2 h-4 w-4" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(client); }}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {clients.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                No clients found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
