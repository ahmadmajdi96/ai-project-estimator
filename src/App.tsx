import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Portal from "./pages/Portal";
import NotFound from "./pages/NotFound";
import CRMDashboard from "./pages/crm/CRMDashboard";
import ManagementDashboard from "./pages/management/ManagementDashboardNew";
import ManagementUsersPage from "./pages/management/ManagementUsersPage";
import ManagementEmployeesPage from "./pages/management/ManagementEmployeesPage";
import ManagementDepartmentsPage from "./pages/management/ManagementDepartmentsPage";
import OrgTreePage from "./pages/management/OrgTreePage";
import SkillsAndPositionsPage from "./pages/management/SkillsAndPositionsPage";
import ManagementTasksPage from "./pages/management/ManagementTasksPage";
import ManagementRoadmapsPage from "./pages/management/ManagementRoadmapsPage";
import ManagementKPIsPage from "./pages/management/ManagementKPIsPage";
import ManagementReportsPage from "./pages/management/ManagementReportsPage";
import ManagementDocumentsPage from "./pages/management/ManagementDocumentsPage";
import ManagementAIChatPage from "./pages/management/ManagementAIChatPage";
import ManagementAIInsightsPage from "./pages/management/ManagementAIInsightsPage";
import ManagementAIRecommendationsPage from "./pages/management/ManagementAIRecommendationsPage";
import ManagementAIDecisionsPage from "./pages/management/ManagementAIDecisionsPage";
import ManagementCalendarPage from "./pages/management/ManagementCalendarPage";
import ManagementConfigPage from "./pages/management/ManagementConfigPage";
import ManagementTraceabilityPage from "./pages/management/ManagementTraceabilityPage";
import ManagementNotificationsPage from "./pages/management/ManagementNotificationsPage";
import ManagementWorkflowsPage from "./pages/management/ManagementWorkflowsPage";
import ManagementStrategicGoalsPage from "./pages/management/ManagementStrategicGoalsPage";
import ManagementOKRsPage from "./pages/management/ManagementOKRsPage";
import CortaCentralDashboard from "./pages/cortacentral/CortaCentralDashboard";
import CXOConversationsPage from "./pages/cortacentral/CXOConversationsPage";
import CXOConnectorsPage from "./pages/cortacentral/CXOConnectorsPage";
import CXOWorkflowsPage from "./pages/cortacentral/CXOWorkflowsPage";
import CXOAnalyticsPage from "./pages/cortacentral/CXOAnalyticsPage";
import CXOSupportPage from "./pages/cortacentral/CXOSupportPage";
import CXOSettingsPage from "./pages/cortacentral/CXOSettingsPage";
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
import DevToolsPage from "./pages/DevToolsPage";
import OpportunitiesPage from "./pages/crm/OpportunitiesPage";
import SupportTicketsPage from "./pages/crm/SupportTicketsPage";
import ProductsPage from "./pages/crm/ProductsPage";
import InvoicesPage from "./pages/crm/InvoicesPage";
import CompetitorsPage from "./pages/crm/CompetitorsPage";
import MarketingPage from "./pages/crm/MarketingPage";
import SupportAgentsPage from "./pages/crm/SupportAgentsPage";
import SupportPipelinePage from "./pages/crm/SupportPipelinePage";
import DebitDashboardPage from "./pages/crm/DebitDashboardPage";
import DebitCollectorsPage from "./pages/crm/DebitCollectorsPage";
import DebitCasesPage from "./pages/crm/DebitCasesPage";
import DebitPipelinePage from "./pages/crm/DebitPipelinePage";
import ChatFlowDashboard from "./pages/chatflow/ChatFlowDashboard";
import ChatbotsPage from "./pages/chatflow/ChatbotsPage";
import ConversationsPage from "./pages/chatflow/ConversationsPage";
import AnalyticsPage from "./pages/chatflow/AnalyticsPage";
import KnowledgeBasePage from "./pages/chatflow/KnowledgeBasePage";
import TemplatesPage from "./pages/chatflow/TemplatesPage";
import IntegrationsPage from "./pages/chatflow/IntegrationsPage";
import TeamPage from "./pages/chatflow/TeamPage";
import BillingPage from "./pages/chatflow/BillingPage";
import SettingsPage from "./pages/chatflow/SettingsPage";
import UsersManagementPage from "./pages/chatflow/UsersManagementPage";
import NotificationsPage from "./pages/chatflow/NotificationsPage";
import ApiWebhooksPage from "./pages/chatflow/ApiWebhooksPage";
import SecurityPage from "./pages/chatflow/SecurityPage";
import HelpPage from "./pages/chatflow/HelpPage";
import CustomerPortalLoginPage from "./pages/customerportal/CustomerPortalLoginPage";
import CustomerPortalDashboard from "./pages/customerportal/CustomerPortalDashboard";
import MyChatbotsPage from "./pages/customerportal/MyChatbotsPage";
import ChatbotDetailPage from "./pages/customerportal/ChatbotDetailPage";
import AnswerRulesPage from "./pages/customerportal/AnswerRulesPage";
import CustomerPortalKnowledgeBasePage from "./pages/customerportal/CustomerPortalKnowledgeBasePage";
import TrainingPage from "./pages/customerportal/TrainingPage";
import TestChatbotPage from "./pages/customerportal/TestChatbotPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portal />} />
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
          <Route path="/crm/opportunities" element={<OpportunitiesPage />} />
          <Route path="/crm/support-tickets" element={<SupportTicketsPage />} />
          <Route path="/crm/support-agents" element={<SupportAgentsPage />} />
          <Route path="/crm/support-pipeline" element={<SupportPipelinePage />} />
          <Route path="/crm/products" element={<ProductsPage />} />
          <Route path="/crm/invoices" element={<InvoicesPage />} />
          <Route path="/crm/competitors" element={<CompetitorsPage />} />
          <Route path="/crm/marketing" element={<MarketingPage />} />
          <Route path="/crm/debit" element={<DebitDashboardPage />} />
          <Route path="/crm/debit-collectors" element={<DebitCollectorsPage />} />
          <Route path="/crm/debit-cases" element={<DebitCasesPage />} />
          <Route path="/crm/debit-pipeline" element={<DebitPipelinePage />} />
          <Route path="/management" element={<ManagementDashboard />} />
          <Route path="/management/users" element={<ManagementUsersPage />} />
          <Route path="/management/employees" element={<ManagementEmployeesPage />} />
          <Route path="/management/departments" element={<ManagementDepartmentsPage />} />
          <Route path="/management/org-tree" element={<OrgTreePage />} />
          <Route path="/management/skills-positions" element={<SkillsAndPositionsPage />} />
          <Route path="/management/strategic-goals" element={<ManagementStrategicGoalsPage />} />
          <Route path="/management/okrs" element={<ManagementOKRsPage />} />
          <Route path="/management/roadmaps" element={<ManagementRoadmapsPage />} />
          <Route path="/management/tasks" element={<ManagementTasksPage />} />
          <Route path="/management/kpis" element={<ManagementKPIsPage />} />
          <Route path="/management/reports" element={<ManagementReportsPage />} />
          <Route path="/management/documents" element={<ManagementDocumentsPage />} />
          <Route path="/management/notifications" element={<ManagementNotificationsPage />} />
          <Route path="/management/workflows" element={<ManagementWorkflowsPage />} />
          <Route path="/management/ai-chat" element={<ManagementAIChatPage />} />
          <Route path="/management/ai-insights" element={<ManagementAIInsightsPage />} />
          <Route path="/management/ai-recommendations" element={<ManagementAIRecommendationsPage />} />
          <Route path="/management/ai-decisions" element={<ManagementAIDecisionsPage />} />
          <Route path="/management/calendar" element={<ManagementCalendarPage />} />
          <Route path="/management/config" element={<ManagementConfigPage />} />
          <Route path="/management/traceability" element={<ManagementTraceabilityPage />} />
          <Route path="/dev-tools" element={<DevToolsPage />} />
          <Route path="/cortacentral" element={<CortaCentralDashboard />} />
          <Route path="/cortacentral/conversations" element={<CXOConversationsPage />} />
          <Route path="/cortacentral/connectors" element={<CXOConnectorsPage />} />
          <Route path="/cortacentral/workflows" element={<CXOWorkflowsPage />} />
          <Route path="/cortacentral/analytics" element={<CXOAnalyticsPage />} />
          <Route path="/cortacentral/support" element={<CXOSupportPage />} />
          <Route path="/cortacentral/settings" element={<CXOSettingsPage />} />
          <Route path="/chatflow" element={<ChatFlowDashboard />} />
          <Route path="/chatflow/chatbots" element={<ChatbotsPage />} />
          <Route path="/chatflow/conversations" element={<ConversationsPage />} />
          <Route path="/chatflow/analytics" element={<AnalyticsPage />} />
          <Route path="/chatflow/knowledge-base" element={<KnowledgeBasePage />} />
          <Route path="/chatflow/templates" element={<TemplatesPage />} />
          <Route path="/chatflow/integrations" element={<IntegrationsPage />} />
          <Route path="/chatflow/team" element={<TeamPage />} />
          <Route path="/chatflow/billing" element={<BillingPage />} />
          <Route path="/chatflow/settings" element={<SettingsPage />} />
          <Route path="/chatflow/users" element={<UsersManagementPage />} />
          <Route path="/chatflow/notifications" element={<NotificationsPage />} />
          <Route path="/chatflow/api" element={<ApiWebhooksPage />} />
          <Route path="/chatflow/security" element={<SecurityPage />} />
          <Route path="/chatflow/help" element={<HelpPage />} />
          <Route path="/customer-portal/login" element={<CustomerPortalLoginPage />} />
          <Route path="/customer-portal" element={<CustomerPortalDashboard />} />
          <Route path="/customer-portal/chatbots" element={<MyChatbotsPage />} />
          <Route path="/customer-portal/chatbots/:id" element={<ChatbotDetailPage />} />
          <Route path="/customer-portal/chatbots/:id/rules" element={<AnswerRulesPage />} />
          <Route path="/customer-portal/chatbots/:id/knowledge-base" element={<CustomerPortalKnowledgeBasePage />} />
          <Route path="/customer-portal/chatbots/:id/training" element={<TrainingPage />} />
          <Route path="/customer-portal/chatbots/:id/test" element={<TestChatbotPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
