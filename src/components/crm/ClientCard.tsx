import { Client, CLIENT_STATUSES, SALES_STAGES } from '@/types/crm';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Building2, Mail, Phone, Globe, Calendar, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

interface ClientCardProps {
  client: Client;
  compact?: boolean;
}

export function ClientCard({ client, compact = false }: ClientCardProps) {
  const navigate = useNavigate();
  const status = CLIENT_STATUSES.find(s => s.value === client.status);
  const stage = SALES_STAGES.find(s => s.value === client.sales_stage);

  if (compact) {
    return (
      <Card 
        className="p-3 cursor-pointer hover:border-primary/50 transition-all bg-card/50 backdrop-blur-sm border-border/50"
        onClick={() => navigate(`/crm/clients/${client.id}`)}
      >
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-sm truncate">{client.client_name}</h4>
          {client.follow_up_needed && (
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{client.contact_person}</p>
        {client.contract_value > 0 && (
          <p className="text-xs text-primary mt-1 font-medium">
            ${client.contract_value.toLocaleString()}
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card 
      className="p-4 cursor-pointer hover:border-primary/50 hover:shadow-glow transition-all bg-card/80 backdrop-blur-sm border-border/50"
      onClick={() => navigate(`/crm/clients/${client.id}`)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold truncate">{client.client_name}</h3>
            {client.follow_up_needed && (
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
            )}
          </div>
          {client.industry && (
            <Badge variant="outline" className="text-xs">
              {client.industry}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground mb-3">
        {client.contact_person && (
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5" />
            <span className="truncate">{client.contact_person}</span>
          </div>
        )}
        {client.email && (
          <div className="flex items-center gap-2">
            <Mail className="w-3.5 h-3.5" />
            <span className="truncate">{client.email}</span>
          </div>
        )}
        {client.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" />
            <span>{client.phone}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/50">
        <div className="flex gap-2">
          {status && (
            <Badge className={`${status.color} text-xs`}>
              {status.label}
            </Badge>
          )}
          {stage && (
            <Badge className={`${stage.color} text-xs`}>
              {stage.label}
            </Badge>
          )}
        </div>
        {client.contract_value > 0 && (
          <span className="text-sm font-medium text-primary">
            ${client.contract_value.toLocaleString()}
          </span>
        )}
      </div>
    </Card>
  );
}
