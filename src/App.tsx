import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import CRMDashboard from "./pages/crm/CRMDashboard";
import ClientsPage from "./pages/crm/ClientsPage";
import ClientProfile from "./pages/crm/ClientProfile";
import SalesPipeline from "./pages/crm/SalesPipeline";
import StatusBoard from "./pages/crm/StatusBoard";
import CalendarPage from "./pages/crm/CalendarPage";
import QuotesPage from "./pages/crm/QuotesPage";
import TasksPage from "./pages/crm/TasksPage";
import RoadmapsPage from "./pages/crm/RoadmapsPage";
import KPIsPage from "./pages/crm/KPIsPage";
import AIInsightsPage from "./pages/crm/AIInsightsPage";
import AIChatPage from "./pages/crm/AIChatPage";
import AIRecommendationsPage from "./pages/crm/AIRecommendationsPage";
import AIDecisionsPage from "./pages/crm/AIDecisionsPage";
import ConfigPage from "./pages/crm/ConfigPage";
import SalesmenPage from "./pages/crm/SalesmenPage";
import SalesPage from "./pages/crm/SalesPage";
import UsersRolesPage from "./pages/crm/UsersRolesPage";
import TraceabilityPage from "./pages/crm/TraceabilityPage";
import ReportsPage from "./pages/crm/ReportsPage";
import WorkflowsPage from "./pages/crm/WorkflowsPage";
import RemindersPage from "./pages/crm/RemindersPage";
import DepartmentsPage from "./pages/crm/DepartmentsPage";
import EmployeesPage from "./pages/crm/EmployeesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/crm" replace />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/crm" element={<CRMDashboard />} />
          <Route path="/crm/sales" element={<SalesPage />} />
          <Route path="/crm/clients" element={<ClientsPage />} />
          <Route path="/crm/clients/:id" element={<ClientProfile />} />
          <Route path="/crm/salesmen" element={<SalesmenPage />} />
          <Route path="/crm/pipeline" element={<SalesPipeline />} />
          <Route path="/crm/status" element={<StatusBoard />} />
          <Route path="/crm/calendar" element={<CalendarPage />} />
          <Route path="/crm/quotes" element={<QuotesPage />} />
          <Route path="/crm/users" element={<UsersRolesPage />} />
          <Route path="/crm/tasks" element={<TasksPage />} />
          <Route path="/crm/roadmaps" element={<RoadmapsPage />} />
          <Route path="/crm/kpis" element={<KPIsPage />} />
          <Route path="/crm/departments" element={<DepartmentsPage />} />
          <Route path="/crm/employees" element={<EmployeesPage />} />
          <Route path="/crm/workflows" element={<WorkflowsPage />} />
          <Route path="/crm/reminders" element={<RemindersPage />} />
          <Route path="/crm/ai-insights" element={<AIInsightsPage />} />
          <Route path="/crm/ai-chat" element={<AIChatPage />} />
          <Route path="/crm/ai-recommendations" element={<AIRecommendationsPage />} />
          <Route path="/crm/ai-decisions" element={<AIDecisionsPage />} />
          <Route path="/crm/config" element={<ConfigPage />} />
          <Route path="/crm/traceability" element={<TraceabilityPage />} />
          <Route path="/crm/reports" element={<ReportsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
