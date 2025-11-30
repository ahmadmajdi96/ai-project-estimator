import { CRMLayout } from '@/components/crm/CRMLayout';
import { ProfitMarginControl } from '@/components/config/ProfitMarginControl';
import { CsvUploader } from '@/components/config/CsvUploader';
import { ComponentEditor } from '@/components/config/ComponentEditor';
import { CategoryEditor } from '@/components/config/CategoryEditor';
import { PipelineConfigEditor } from '@/components/crm/PipelineConfigEditor';
import { Settings, GitBranch, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            <p className="text-muted-foreground">Manage your CRM settings, pipelines, and components</p>
          </div>
        </div>

        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList>
            <TabsTrigger value="crm" className="gap-2">
              <GitBranch className="h-4 w-4" />
              CRM Settings
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculator Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm" className="space-y-6">
            <PipelineConfigEditor />
          </TabsContent>

          <TabsContent value="calculator" className="space-y-6">
            <div className="grid lg:grid-cols-[1fr,400px] gap-8">
              <div className="space-y-8">
                <ComponentEditor />
              </div>
              <div className="space-y-6">
                <ProfitMarginControl />
                <Card className="p-5 bg-card/50 border-border/50">
                  <CategoryEditor />
                </Card>
                <CsvUploader />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}