import { CortaCentralLayout } from '@/components/cortacentral/CortaCentralLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useCXOConnectors, useCXOTenants, useAddCXOConnector, useUpdateCXOConnector } from '@/hooks/useCortaCentral';
import { Plug, Plus, CheckCircle, AlertTriangle, Clock, Settings } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';

const connectorTypes = [
  { value: 'ringcentral', label: 'RingCentral', description: 'Voice, SMS, and team messaging' },
  { value: 'twilio', label: 'Twilio', description: 'Voice, SMS, and WhatsApp' },
  { value: 'zoom_phone', label: 'Zoom Phone', description: 'Cloud phone system' },
  { value: 'ms_teams_phone', label: 'MS Teams Phone', description: 'Microsoft Teams calling' },
  { value: 'generic_voice', label: 'Generic Voice', description: 'Custom voice provider' },
  { value: 'sms_provider', label: 'SMS Provider', description: 'Custom SMS gateway' },
  { value: 'whatsapp_provider', label: 'WhatsApp', description: 'WhatsApp Business API' },
  { value: 'email_provider', label: 'Email Provider', description: 'Email integration' },
  { value: 'webchat_provider', label: 'Webchat', description: 'Website chat widget' },
];

const healthColors: Record<string, string> = {
  healthy: 'bg-green-500/10 text-green-500 border-green-500/20',
  degraded: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  down: 'bg-red-500/10 text-red-500 border-red-500/20',
  unknown: 'bg-muted text-muted-foreground',
};

export default function CXOConnectorsPage() {
  const { data: connectors, isLoading } = useCXOConnectors();
  const { data: tenants } = useCXOTenants();
  const addConnector = useAddCXOConnector();
  const updateConnector = useUpdateCXOConnector();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({
    type: '',
    display_name: '',
    tenant_id: '',
  });

  const handleSubmit = async () => {
    if (!form.type || !form.display_name) return;
    
    const tenantId = form.tenant_id || tenants?.[0]?.id;
    if (!tenantId) {
      // Create a default tenant if none exists
      return;
    }

    await addConnector.mutateAsync({
      type: form.type as any,
      display_name: form.display_name,
      tenant_id: tenantId,
      is_enabled: true,
      config: {},
      health_status: 'unknown',
    });
    
    setForm({ type: '', display_name: '', tenant_id: '' });
    setIsDialogOpen(false);
  };

  const handleToggleEnabled = async (connector: any) => {
    await updateConnector.mutateAsync({
      id: connector.id,
      is_enabled: !connector.is_enabled,
    });
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-5 w-5" />;
      case 'degraded': return <AlertTriangle className="h-5 w-5" />;
      case 'down': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  return (
    <CortaCentralLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Connectors & Providers</h1>
            <p className="text-muted-foreground">Manage external telephony and communication providers</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Connector
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Connector</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Provider Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm(prev => ({ ...prev, type: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {connectorTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-xs text-muted-foreground">{type.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={form.display_name}
                    onChange={(e) => setForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="e.g., Production RingCentral"
                  />
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-sm text-amber-600">
                    <strong>Note:</strong> This platform orchestrates external providers. It does not host PSTN calls or handle RTP media directly. All voice traffic flows through your configured provider.
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={!form.type || !form.display_name}>
                    Add Connector
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plug className="h-5 w-5" />
              Configured Connectors
            </CardTitle>
            <CardDescription>
              External providers connected to your CX orchestration platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-muted-foreground">Loading...</p>
            ) : !connectors?.length ? (
              <div className="text-center py-12">
                <Plug className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No connectors configured</p>
                <p className="text-sm text-muted-foreground">Add a provider to start orchestrating</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {connectors.map((connector) => {
                  const typeInfo = connectorTypes.find(t => t.value === connector.type);
                  return (
                    <div key={connector.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${healthColors[connector.health_status]}`}>
                            {getHealthIcon(connector.health_status)}
                          </div>
                          <div>
                            <h4 className="font-medium">{connector.display_name}</h4>
                            <p className="text-sm text-muted-foreground">{typeInfo?.label || connector.type}</p>
                            <p className="text-xs text-muted-foreground mt-1">{typeInfo?.description}</p>
                            {connector.last_health_check_at && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Last checked: {format(new Date(connector.last_health_check_at), 'MMM d, h:mm a')}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge className={healthColors[connector.health_status]}>
                            {connector.health_status}
                          </Badge>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={connector.is_enabled}
                              onCheckedChange={() => handleToggleEnabled(connector)}
                            />
                            <span className="text-sm">{connector.is_enabled ? 'Enabled' : 'Disabled'}</span>
                          </div>
                          <Button variant="outline" size="icon">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Architecture</CardTitle>
            <CardDescription>How CortaCentral orchestrates external providers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-3">
                    <Plug className="h-6 w-6 text-blue-500" />
                  </div>
                  <h4 className="font-medium">External Providers</h4>
                  <p className="text-sm text-muted-foreground">RingCentral, Twilio, Zoom handle actual calls & messages</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-3">
                    <Settings className="h-6 w-6 text-purple-500" />
                  </div>
                  <h4 className="font-medium">CortaCentral</h4>
                  <p className="text-sm text-muted-foreground">Orchestrates routing, analytics, AI & unified experience</p>
                </div>
                <div>
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                  <h4 className="font-medium">Unified View</h4>
                  <p className="text-sm text-muted-foreground">Single pane for all conversations across channels</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CortaCentralLayout>
  );
}
