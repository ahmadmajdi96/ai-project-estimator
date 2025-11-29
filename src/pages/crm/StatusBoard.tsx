import { CRMLayout } from '@/components/crm/CRMLayout';
import { KanbanBoard } from '@/components/crm/KanbanBoard';
import { useClients } from '@/hooks/useClients';
import { Loader2 } from 'lucide-react';

export default function StatusBoard() {
  const { data: clients = [], isLoading } = useClients();

  if (isLoading) {
    return (
      <CRMLayout title="Client Status Board">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CRMLayout>
    );
  }

  return (
    <CRMLayout title="Client Status Board">
      <KanbanBoard clients={clients} type="status" />
    </CRMLayout>
  );
}
