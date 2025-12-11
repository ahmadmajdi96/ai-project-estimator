import { HRLayout } from "@/components/hr/HRLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gift, Heart, Shield, DollarSign, Plus } from "lucide-react";
import { useBenefits } from "@/hooks/useHR";

export default function HRBenefitsPage() {
  const { data: benefits, isLoading } = useBenefits();

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      health: <Heart className="h-5 w-5 text-red-500" />,
      retirement: <DollarSign className="h-5 w-5 text-green-500" />,
      insurance: <Shield className="h-5 w-5 text-blue-500" />,
      allowance: <Gift className="h-5 w-5 text-purple-500" />,
      other: <Gift className="h-5 w-5 text-muted-foreground" />,
    };
    return icons[type] || icons.other;
  };

  const getTypeBadge = (type: string) => {
    const config: Record<string, string> = {
      health: "bg-red-500/10 text-red-600 border-red-500/20",
      retirement: "bg-green-500/10 text-green-600 border-green-500/20",
      insurance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      allowance: "bg-purple-500/10 text-purple-600 border-purple-500/20",
      other: "",
    };
    return (
      <Badge variant="outline" className={config[type] || ""}>
        {type}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const benefitsByType = benefits?.reduce((acc: Record<string, any[]>, benefit: any) => {
    const type = benefit.type || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(benefit);
    return acc;
  }, {}) || {};

  return (
    <HRLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Benefits & Compensation</h1>
            <p className="text-muted-foreground">Manage employee benefits and compensation packages</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Benefit
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Benefits</CardTitle>
              <Heart className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{benefitsByType.health?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active plans</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Insurance</CardTitle>
              <Shield className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{benefitsByType.insurance?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Coverage plans</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Retirement</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{benefitsByType.retirement?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Plans available</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Allowances</CardTitle>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{benefitsByType.allowance?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Active allowances</p>
            </CardContent>
          </Card>
        </div>

        {/* Benefits List */}
        <Card>
          <CardHeader>
            <CardTitle>Available Benefits</CardTitle>
            <CardDescription>All benefit plans offered to employees</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : benefits && benefits.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {benefits.map((benefit: any) => (
                  <Card key={benefit.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted">
                            {getTypeIcon(benefit.type)}
                          </div>
                          <div>
                            <CardTitle className="text-sm">{benefit.name}</CardTitle>
                            {getTypeBadge(benefit.type)}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {benefit.description || 'No description available'}
                      </p>
                      {benefit.value && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-sm text-muted-foreground">Value</span>
                          <span className="font-semibold">{formatCurrency(benefit.value)}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No benefits configured</h3>
                <p className="text-muted-foreground mb-4">Add benefit plans for your employees</p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Benefit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </HRLayout>
  );
}
