import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Config from "./pages/Config";
import NotFound from "./pages/NotFound";
import CRMDashboard from "./pages/crm/CRMDashboard";
import ClientsPage from "./pages/crm/ClientsPage";
import ClientProfile from "./pages/crm/ClientProfile";
import SalesPipeline from "./pages/crm/SalesPipeline";
import StatusBoard from "./pages/crm/StatusBoard";
import CalendarPage from "./pages/crm/CalendarPage";
import QuotesPage from "./pages/crm/QuotesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/config" element={<Config />} />
          <Route path="/crm" element={<CRMDashboard />} />
          <Route path="/crm/clients" element={<ClientsPage />} />
          <Route path="/crm/clients/:id" element={<ClientProfile />} />
          <Route path="/crm/pipeline" element={<SalesPipeline />} />
          <Route path="/crm/status" element={<StatusBoard />} />
          <Route path="/crm/calendar" element={<CalendarPage />} />
          <Route path="/crm/quotes" element={<QuotesPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
