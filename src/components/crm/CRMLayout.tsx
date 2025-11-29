import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { CRMSidebar } from './CRMSidebar';

interface CRMLayoutProps {
  children?: ReactNode;
  title?: string;
}

export function CRMLayout({ children, title }: CRMLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <CRMSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 h-14 flex items-center gap-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <SidebarTrigger />
            {title && <h1 className="font-display font-semibold text-lg">{title}</h1>}
          </header>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
