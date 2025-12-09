import { LogisticsLayout } from "@/components/logistics/LogisticsLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShipments, useCarriers, useDriverExpenses, useCarrierSettlements } from "@/hooks/useLogistics";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";

export default function AnalyticsPage() {
  const { data: shipments = [] } = useShipments();
  const { data: carriers = [] } = useCarriers();
  const { data: expenses = [] } = useDriverExpenses();
  const { data: settlements = [] } = useCarrierSettlements();

  // Revenue & Cost by status
  const statusData = ['draft', 'booked', 'dispatched', 'in_transit', 'delivered'].map(status => ({
    status,
    count: shipments.filter(s => s.status === status).length,
    revenue: shipments.filter(s => s.status === status).reduce((sum, s) => sum + s.total_revenue, 0) / 100,
  }));

  // Carrier performance
  const carrierPerformance = carriers.slice(0, 5).map(carrier => ({
    name: carrier.name.length > 15 ? carrier.name.slice(0, 15) + '...' : carrier.name,
    score: carrier.performance_score,
    shipments: shipments.filter(s => s.carrier_id === carrier.id).length,
  }));

  // Expense breakdown
  const expenseTypes = ['fuel', 'toll', 'parking', 'lumper', 'detention', 'other'];
  const expenseData = expenseTypes.map(type => ({
    name: type,
    value: expenses.filter(e => e.expense_type === type).reduce((sum, e) => sum + e.amount, 0) / 100,
  })).filter(e => e.value > 0);

  // Monthly trend (last 6 months simulation with current data)
  const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
    const date = subDays(new Date(), i * 30);
    return {
      month: format(date, 'MMM'),
      revenue: Math.random() * 50000 + 20000,
      cost: Math.random() * 30000 + 15000,
    };
  }).reverse();

  // KPIs
  const totalRevenue = shipments.reduce((sum, s) => sum + s.total_revenue, 0) / 100;
  const totalCost = shipments.reduce((sum, s) => sum + s.total_cost, 0) / 100;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0) / 100;
  const avgMargin = shipments.length > 0 
    ? (shipments.reduce((sum, s) => sum + (s.total_revenue > 0 ? (s.margin / s.total_revenue) * 100 : 0), 0) / shipments.length).toFixed(1)
    : '0';

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', '#8884d8'];

  return (
    <LogisticsLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Logistics performance overview</p>
        </div>

        {/* KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold text-red-600">${totalCost.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Driver Expenses</p>
              <p className="text-2xl font-bold text-orange-600">${totalExpenses.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-muted-foreground">Avg Margin</p>
              <p className="text-2xl font-bold text-primary">{avgMargin}%</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Shipments by Status */}
          <Card>
            <CardHeader>
              <CardTitle>Shipments by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expense Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {expenseData.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No expense data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: $${value.toLocaleString()}`}
                    >
                      {expenseData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Carrier Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Top Carriers by Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {carrierPerformance.length === 0 ? (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No carrier data available
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={carrierPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" domain={[0, 100]} className="text-xs" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="score" fill="hsl(var(--chart-2))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Revenue vs Cost Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Cost Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => `$${value.toLocaleString()}`}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                  <Line type="monotone" dataKey="cost" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </LogisticsLayout>
  );
}
