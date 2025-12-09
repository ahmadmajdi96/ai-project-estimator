import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShipments, useCarriers, useDriverExpenses } from "@/hooks/useLogistics";
import { 
  Package, 
  Truck, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  MapPin,
  AlertTriangle,
  CheckCircle,
  Plus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

export default function LogisticsDashboard() {
  const navigate = useNavigate();
  const { data: shipments = [], isLoading: shipmentsLoading } = useShipments();
  const { data: carriers = [] } = useCarriers();
  const { data: expenses = [] } = useDriverExpenses();

  const activeShipments = shipments.filter(s => ['dispatched', 'in_transit'].includes(s.status));
  const pendingShipments = shipments.filter(s => ['draft', 'booked'].includes(s.status));
  const deliveredToday = shipments.filter(s => 
    s.status === 'delivered' && 
    s.actual_delivery_date && 
    format(new Date(s.actual_delivery_date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  
  const totalRevenue = shipments.reduce((sum, s) => sum + (s.total_revenue || 0), 0) / 100;
  const totalCost = shipments.reduce((sum, s) => sum + (s.total_cost || 0), 0) / 100;
  const totalMargin = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? ((totalMargin / totalRevenue) * 100).toFixed(1) : '0';

  const pendingExpenses = expenses.filter(e => e.status === 'pending');

  const kpis = [
    { 
      title: "Active Shipments", 
      value: activeShipments.length, 
      icon: Package, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    { 
      title: "In Transit", 
      value: shipments.filter(s => s.status === 'in_transit').length, 
      icon: Truck, 
      color: "text-orange-500",
      bgColor: "bg-orange-500/10"
    },
    { 
      title: "Total Revenue", 
      value: `$${totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    { 
      title: "Margin", 
      value: `${marginPercent}%`, 
      icon: TrendingUp, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
      draft: { variant: "outline", label: "Draft" },
      booked: { variant: "secondary", label: "Booked" },
      dispatched: { variant: "default", label: "Dispatched" },
      in_transit: { variant: "default", label: "In Transit" },
      delivered: { variant: "secondary", label: "Delivered" },
      cancelled: { variant: "destructive", label: "Cancelled" },
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Logistics Dashboard</h1>
            <p className="text-muted-foreground">Overview of your logistics operations</p>
          </div>
          <Button onClick={() => navigate('/logistics/shipments/new')}>
            <Plus className="w-4 h-4 mr-2" />
            New Shipment
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{kpi.title}</p>
                    <p className="text-2xl font-bold mt-1">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.bgColor}`}>
                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active Shipments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Truck className="w-5 h-5" />
                Active Shipments
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/logistics/shipments')}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              {shipmentsLoading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : activeShipments.length === 0 ? (
                <p className="text-muted-foreground">No active shipments</p>
              ) : (
                <div className="space-y-3">
                  {activeShipments.slice(0, 5).map((shipment) => (
                    <div 
                      key={shipment.id} 
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                      onClick={() => navigate(`/logistics/shipments/${shipment.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{shipment.shipment_number}</p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.customer?.name || 'No customer'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(shipment.status)}
                        <p className="text-sm text-muted-foreground mt-1">
                          {shipment.delivery_date ? format(new Date(shipment.delivery_date), 'MMM d') : '-'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pending Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingShipments.length > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 cursor-pointer"
                    onClick={() => navigate('/logistics/shipments?status=draft,booked')}
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Shipments to Dispatch</p>
                        <p className="text-sm text-muted-foreground">
                          {pendingShipments.length} shipments awaiting dispatch
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{pendingShipments.length}</Badge>
                  </div>
                )}

                {pendingExpenses.length > 0 && (
                  <div 
                    className="flex items-center justify-between p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 cursor-pointer"
                    onClick={() => navigate('/logistics/expenses?status=pending')}
                  >
                    <div className="flex items-center gap-3">
                      <DollarSign className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium">Expenses to Approve</p>
                        <p className="text-sm text-muted-foreground">
                          {pendingExpenses.length} driver expenses pending
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{pendingExpenses.length}</Badge>
                  </div>
                )}

                {deliveredToday.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-green-500/20 bg-green-500/5">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Delivered Today</p>
                        <p className="text-sm text-muted-foreground">
                          {deliveredToday.length} shipments completed
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      {deliveredToday.length}
                    </Badge>
                  </div>
                )}

                {pendingShipments.length === 0 && pendingExpenses.length === 0 && deliveredToday.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No pending actions</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrier Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Carrier Fleet
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/logistics/carriers')}>
              Manage Carriers
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{carriers.length}</p>
                <p className="text-sm text-muted-foreground">Total Carriers</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">{carriers.filter(c => c.is_active).length}</p>
                <p className="text-sm text-muted-foreground">Active Carriers</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50">
                <p className="text-3xl font-bold">
                  {carriers.length > 0 
                    ? (carriers.reduce((sum, c) => sum + c.performance_score, 0) / carriers.length).toFixed(0) 
                    : '-'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Performance Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LogisticsLayout>
  );
}
