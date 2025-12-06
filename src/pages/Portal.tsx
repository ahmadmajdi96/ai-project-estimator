import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, Loader2, LogOut, Bot } from 'lucide-react';

interface DashboardAccess {
  dashboard_name: string;
  min_role: string;
}

const ROLE_LEVELS: Record<string, number> = {
  super_admin: 4,
  ceo: 3,
  department_head: 2,
  team_lead: 1,
  employee: 0,
};

const dashboards = [
  {
    id: 'crm',
    name: 'CRM Dashboard',
    description: 'Manage clients, sales pipeline, support tickets, and debit collection',
    icon: LayoutDashboard,
    path: '/crm',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'management',
    name: 'Management Portal',
    description: 'Employee management, user roles, and organizational structure',
    icon: Users,
    path: '/management',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    id: 'chatflow',
    name: 'ChatFlow AI',
    description: 'AI-powered chatbot platform with social media integrations',
    icon: Bot,
    path: '/chatflow',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

export default function Portal() {
  const { user, role, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [dashboardAccess, setDashboardAccess] = useState<DashboardAccess[]>([]);
  const [accessLoading, setAccessLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    async function fetchDashboardAccess() {
      const { data } = await supabase
        .from('dashboard_access')
        .select('dashboard_name, min_role');
      
      if (data) {
        setDashboardAccess(data);
      }
      setAccessLoading(false);
    }

    if (user) {
      fetchDashboardAccess();
    }
  }, [user]);

  const canAccessDashboard = (dashboardId: string) => {
    if (!role) return false;
    
    const access = dashboardAccess.find(d => d.dashboard_name === dashboardId);
    if (!access) return true; // If no restriction, allow access
    
    const userLevel = ROLE_LEVELS[role] ?? 0;
    const requiredLevel = ROLE_LEVELS[access.min_role] ?? 0;
    
    return userLevel >= requiredLevel;
  };

  const handleDashboardSelect = (path: string) => {
    navigate(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading || accessLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">CortaneX AI</h1>
              <p className="text-xs text-muted-foreground">Enterprise Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{role?.replace('_', ' ')}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-display font-bold mb-3">Welcome Back</h2>
            <p className="text-muted-foreground">Select a dashboard to continue</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {dashboards.map((dashboard) => {
              const hasAccess = canAccessDashboard(dashboard.id);
              const Icon = dashboard.icon;

              return (
                <Card 
                  key={dashboard.id}
                  className={`group relative overflow-hidden transition-all duration-300 ${
                    hasAccess 
                      ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] hover:border-primary/50' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => hasAccess && handleDashboardSelect(dashboard.path)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${dashboard.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${dashboard.gradient} flex items-center justify-center mb-4`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{dashboard.name}</CardTitle>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {hasAccess ? (
                      <Button className="w-full" variant="outline">
                        Open Dashboard
                      </Button>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        Access restricted - contact administrator
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
