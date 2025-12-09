import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { LogisticsSidebar } from "./LogisticsSidebar";

interface LogisticsLayoutProps {
  children: React.ReactNode;
}

export function LogisticsLayout({ children }: LogisticsLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <LogisticsSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
