import { Header } from '@/components/layout/Header';
import { ProfitMarginControl } from '@/components/config/ProfitMarginControl';
import { CsvUploader } from '@/components/config/CsvUploader';
import { ComponentEditor } from '@/components/config/ComponentEditor';
import { Settings } from 'lucide-react';

const Config = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-soft">
              <Settings className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">Configuration</h1>
              <p className="text-muted-foreground">Manage your pricing settings and components</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          {/* Main Content */}
          <div className="space-y-8">
            <div className="animate-fade-in stagger-1">
              <ComponentEditor />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="animate-fade-in stagger-2">
              <ProfitMarginControl />
            </div>
            <div className="animate-fade-in stagger-3">
              <CsvUploader />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Config;
