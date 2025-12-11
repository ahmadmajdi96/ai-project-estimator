import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { HRSidebar } from "./HRSidebar";

interface HRLayoutProps {
  children: React.ReactNode;
}

export function HRLayout({ children }: HRLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <HRSidebar />
        <SidebarInset className="flex-1">
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
