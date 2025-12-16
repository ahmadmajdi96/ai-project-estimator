import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Auth from "./pages/Auth";
import Portal from "./pages/Portal";
import CompanyProfile from "./pages/CompanyProfile";
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
import AccountingAuth from "./pages/accounting/AccountingAuth";
import AccountingDashboard from "./pages/accounting/AccountingDashboard";
import ChartOfAccountsPage from "./pages/accounting/gl/ChartOfAccountsPage";
import JournalEntriesPage from "./pages/accounting/gl/JournalEntriesPage";
import TrialBalancePage from "./pages/accounting/gl/TrialBalancePage";
import ARCustomersPage from "./pages/accounting/ar/CustomersPage";
import ARInvoicesPage from "./pages/accounting/ar/InvoicesPage";
import ARPaymentsPage from "./pages/accounting/ar/PaymentsPage";
import AgingReportPage from "./pages/accounting/ar/AgingReportPage";
import VendorsPage from "./pages/accounting/ap/VendorsPage";
import BillsPage from "./pages/accounting/ap/BillsPage";
import APPaymentsPage from "./pages/accounting/ap/APPaymentsPage";
import BankAccountsPage from "./pages/accounting/banking/BankAccountsPage";
import BankTransactionsPage from "./pages/accounting/banking/TransactionsPage";
import ReconciliationPage from "./pages/accounting/banking/ReconciliationPage";
import PayrollEmployeesPage from "./pages/accounting/payroll/EmployeesPage";
import PayrollRunsPage from "./pages/accounting/payroll/PayrollRunsPage";
import PaystubsPage from "./pages/accounting/payroll/PaystubsPage";
import ExpensesPage from "./pages/accounting/ExpensesPage";
import AccountingReportsPage from "./pages/accounting/ReportsPage";
import BudgetsPage from "./pages/accounting/BudgetsPage";
import FixedAssetsPage from "./pages/accounting/FixedAssetsPage";
import InventoryPage from "./pages/accounting/InventoryPage";
import AccountingProjectsPage from "./pages/accounting/ProjectsPage";
import TimeEntriesPage from "./pages/accounting/TimeEntriesPage";
import AccountingSettingsPage from "./pages/accounting/AccountingSettingsPage";
// Logistics
import LogisticsDashboard from "./pages/logistics/LogisticsDashboard";
// HR
import HRDashboard from "./pages/hr/HRDashboard";
import HREmployeesPage from "./pages/hr/HREmployeesPage";
import HRAttendancePage from "./pages/hr/HRAttendancePage";
import HRLeavePage from "./pages/hr/HRLeavePage";
import HRJobsPage from "./pages/hr/HRJobsPage";
import HRCandidatesPage from "./pages/hr/HRCandidatesPage";
import HRPayrollPage from "./pages/hr/HRPayrollPage";
import HRPerformancePage from "./pages/hr/HRPerformancePage";
import HRTrainingPage from "./pages/hr/HRTrainingPage";
import HRBenefitsPage from "./pages/hr/HRBenefitsPage";
import HROrgChartPage from "./pages/hr/HROrgChartPage";
import HROnboardingPage from "./pages/hr/HROnboardingPage";
import HRAnalyticsPage from "./pages/hr/HRAnalyticsPage";
import HRDocumentsPage from "./pages/hr/HRDocumentsPage";
import HRSettingsPage from "./pages/hr/HRSettingsPage";
import HRAIChatPage from "./pages/hr/HRAIChatPage";
import ShipmentsPage from "./pages/logistics/ShipmentsPage";
import CarriersPage from "./pages/logistics/CarriersPage";
import EquipmentPage from "./pages/logistics/EquipmentPage";
import DispatchPage from "./pages/logistics/DispatchPage";
import TrackingPage from "./pages/logistics/TrackingPage";
import DriverExpensesPage from "./pages/logistics/DriverExpensesPage";
import SettlementsPage from "./pages/logistics/SettlementsPage";
import LogisticsAnalyticsPage from "./pages/logistics/AnalyticsPage";
import LogisticsBillingPage from "./pages/logistics/BillingPage";
import LogisticsSettingsPage from "./pages/logistics/SettingsPage";
// Employee Portal
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeTasksPage from "./pages/employee/EmployeeTasksPage";
import EmployeeProjectsPage from "./pages/employee/EmployeeProjectsPage";
import EmployeeRequestsPage from "./pages/employee/EmployeeRequestsPage";
import EmployeeSalaryPage from "./pages/employee/EmployeeSalaryPage";
import EmployeeAttendancePage from "./pages/employee/EmployeeAttendancePage";
import EmployeeLeavePage from "./pages/employee/EmployeeLeavePage";
import EmployeeAIChatPage from "./pages/employee/EmployeeAIChatPage";
import EmployeeTicketsPage from "./pages/employee/EmployeeTicketsPage";
import EmployeeSchedulePage from "./pages/employee/EmployeeSchedulePage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Portal />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
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
          <Route path="/accounting/auth" element={<AccountingAuth />} />
          <Route path="/accounting" element={<AccountingDashboard />} />
          <Route path="/accounting/gl/accounts" element={<ChartOfAccountsPage />} />
          <Route path="/accounting/gl/journals" element={<JournalEntriesPage />} />
          <Route path="/accounting/gl/trial-balance" element={<TrialBalancePage />} />
          <Route path="/accounting/ar/customers" element={<ARCustomersPage />} />
          <Route path="/accounting/ar/invoices" element={<ARInvoicesPage />} />
          <Route path="/accounting/ar/payments" element={<ARPaymentsPage />} />
          <Route path="/accounting/ar/aging" element={<AgingReportPage />} />
          <Route path="/accounting/ap/vendors" element={<VendorsPage />} />
          <Route path="/accounting/ap/bills" element={<BillsPage />} />
          <Route path="/accounting/ap/payments" element={<APPaymentsPage />} />
          <Route path="/accounting/banking/accounts" element={<BankAccountsPage />} />
          <Route path="/accounting/banking/transactions" element={<BankTransactionsPage />} />
          <Route path="/accounting/banking/reconciliation" element={<ReconciliationPage />} />
          <Route path="/accounting/payroll/employees" element={<PayrollEmployeesPage />} />
          <Route path="/accounting/payroll/runs" element={<PayrollRunsPage />} />
          <Route path="/accounting/payroll/paystubs" element={<PaystubsPage />} />
          <Route path="/accounting/expenses" element={<ExpensesPage />} />
          <Route path="/accounting/reports" element={<AccountingReportsPage />} />
          <Route path="/accounting/budgets" element={<BudgetsPage />} />
          <Route path="/accounting/assets" element={<FixedAssetsPage />} />
          <Route path="/accounting/inventory" element={<InventoryPage />} />
          <Route path="/accounting/projects" element={<AccountingProjectsPage />} />
          <Route path="/accounting/time" element={<TimeEntriesPage />} />
          <Route path="/accounting/settings" element={<AccountingSettingsPage />} />
          {/* Logistics Routes */}
          <Route path="/logistics" element={<LogisticsDashboard />} />
          <Route path="/logistics/shipments" element={<ShipmentsPage />} />
          <Route path="/logistics/carriers" element={<CarriersPage />} />
          <Route path="/logistics/equipment" element={<EquipmentPage />} />
          <Route path="/logistics/dispatch" element={<DispatchPage />} />
          <Route path="/logistics/tracking" element={<TrackingPage />} />
          <Route path="/logistics/expenses" element={<DriverExpensesPage />} />
          <Route path="/logistics/settlements" element={<SettlementsPage />} />
          <Route path="/logistics/analytics" element={<LogisticsAnalyticsPage />} />
          <Route path="/logistics/billing" element={<LogisticsBillingPage />} />
          <Route path="/logistics/settings" element={<LogisticsSettingsPage />} />
          {/* HR Routes */}
          <Route path="/hr" element={<HRDashboard />} />
          <Route path="/hr/employees" element={<HREmployeesPage />} />
          <Route path="/hr/attendance" element={<HRAttendancePage />} />
          <Route path="/hr/leave" element={<HRLeavePage />} />
          <Route path="/hr/jobs" element={<HRJobsPage />} />
          <Route path="/hr/candidates" element={<HRCandidatesPage />} />
          <Route path="/hr/payroll" element={<HRPayrollPage />} />
          <Route path="/hr/performance" element={<HRPerformancePage />} />
          <Route path="/hr/training" element={<HRTrainingPage />} />
          <Route path="/hr/benefits" element={<HRBenefitsPage />} />
          <Route path="/hr/org-chart" element={<HROrgChartPage />} />
          <Route path="/hr/onboarding" element={<HROnboardingPage />} />
          <Route path="/hr/analytics" element={<HRAnalyticsPage />} />
          <Route path="/hr/documents" element={<HRDocumentsPage />} />
          <Route path="/hr/settings" element={<HRSettingsPage />} />
          <Route path="/hr/ai-chat" element={<HRAIChatPage />} />
          {/* Employee Portal Routes */}
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/schedule" element={<EmployeeSchedulePage />} />
          <Route path="/employee/tasks" element={<EmployeeTasksPage />} />
          <Route path="/employee/projects" element={<EmployeeProjectsPage />} />
          <Route path="/employee/requests" element={<EmployeeRequestsPage />} />
          <Route path="/employee/tickets" element={<EmployeeTicketsPage />} />
          <Route path="/employee/salary" element={<EmployeeSalaryPage />} />
          <Route path="/employee/attendance" element={<EmployeeAttendancePage />} />
          <Route path="/employee/leave" element={<EmployeeLeavePage />} />
          <Route path="/employee/ai-chat" element={<EmployeeAIChatPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
