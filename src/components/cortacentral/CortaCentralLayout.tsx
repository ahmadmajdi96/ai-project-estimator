import { SidebarProvider } from '@/components/ui/sidebar';
import { CortaCentralSidebar } from './CortaCentralSidebar';
import { ReactNode } from 'react';

interface CortaCentralLayoutProps {
  children: ReactNode;
}

export function CortaCentralLayout({ children }: CortaCentralLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CortaCentralSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
