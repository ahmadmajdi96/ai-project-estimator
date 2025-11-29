import { CRMLayout } from '@/components/crm/CRMLayout';
import { ProfitMarginControl } from '@/components/config/ProfitMarginControl';
import { CsvUploader } from '@/components/config/CsvUploader';
import { ComponentEditor } from '@/components/config/ComponentEditor';
import { Settings } from 'lucide-react';

export default function ConfigPage() {
  return (
    <CRMLayout title="Configuration">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
            <Settings className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold">Configuration</h2>
            <p className="text-muted-foreground">Manage your pricing settings and components</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-8">
          <div className="space-y-8">
            <ComponentEditor />
          </div>
          <div className="space-y-6">
            <ProfitMarginControl />
            <CsvUploader />
          </div>
        </div>
      </div>
    </CRMLayout>
  );
}
