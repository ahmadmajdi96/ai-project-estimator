import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { ProfitMarginControl } from '@/components/config/ProfitMarginControl';
import { CsvUploader } from '@/components/config/CsvUploader';
import { ComponentEditor } from '@/components/config/ComponentEditor';
import { CategoryEditor } from '@/components/config/CategoryEditor';
import { AllPipelinesConfigEditor } from '@/components/crm/AllPipelinesConfigEditor';
import { useAIConfigs, useAddAIConfig, useUpdateAIConfig, useDeleteAIConfig } from '@/hooks/useAIConfig';
import { useCompanyPolicies, useAddCompanyPolicy, useUpdateCompanyPolicy, useDeleteCompanyPolicy } from '@/hooks/useCompanyPolicies';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  GitBranch, Calculator, Bot, FileText, Plus, Trash2, 
  Edit, Loader2, Sparkles, Shield
} from 'lucide-react';
import { toast } from 'sonner';

const POLICY_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'sales', label: 'Sales' },
  { value: 'hr', label: 'Human Resources' },
  { value: 'finance', label: 'Finance' },
  { value: 'security', label: 'Security' },
  { value: 'compliance', label: 'Compliance' },
];

export default function ConfigPage() {
  const { data: aiConfigs = [], isLoading: loadingAI } = useAIConfigs();
  const { data: policies = [], isLoading: loadingPolicies } = useCompanyPolicies();
  const addAIConfig = useAddAIConfig();
  const updateAIConfig = useUpdateAIConfig();
  const deleteAIConfig = useDeleteAIConfig();
  const addPolicy = useAddCompanyPolicy();
  const updatePolicy = useUpdateCompanyPolicy();
  const deletePolicy = useDeleteCompanyPolicy();

  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);
  const [editingAI, setEditingAI] = useState<any>(null);
  const [editingPolicy, setEditingPolicy] = useState<any>(null);

  // AI Config form
  const [aiName, setAIName] = useState('');
  const [aiPrompt, setAIPrompt] = useState('');
  const [aiPersonality, setAIPersonality] = useState('');
  const [aiRules, setAIRules] = useState('');

  // Policy form
  const [policyTitle, setPolicyTitle] = useState('');
  const [policyCategory, setPolicyCategory] = useState('general');
  const [policyContent, setPolicyContent] = useState('');

  const handleSaveAIConfig = async () => {
    if (!aiName.trim()) {
      toast.error('Name is required');
      return;
    }

    const rules = aiRules.split('\n').filter(r => r.trim());
    
    if (editingAI) {
      await updateAIConfig.mutateAsync({
        id: editingAI.id,
        name: aiName,
        system_prompt: aiPrompt,
        personality: aiPersonality,
        rules,
      });
    } else {
      await addAIConfig.mutateAsync({
        name: aiName,
        system_prompt: aiPrompt,
        personality: aiPersonality,
        rules,
      });
    }

    resetAIForm();
    setAIDialogOpen(false);
  };

  const handleSavePolicy = async () => {
    if (!policyTitle.trim() || !policyContent.trim()) {
      toast.error('Title and content are required');
      return;
    }

    if (editingPolicy) {
      await updatePolicy.mutateAsync({
        id: editingPolicy.id,
        title: policyTitle,
        category: policyCategory,
        content: policyContent,
      });
    } else {
      await addPolicy.mutateAsync({
        title: policyTitle,
        category: policyCategory,
        content: policyContent,
      });
    }

    resetPolicyForm();
    setPolicyDialogOpen(false);
  };

  const resetAIForm = () => {
    setAIName('');
    setAIPrompt('');
    setAIPersonality('');
    setAIRules('');
    setEditingAI(null);
  };

  const resetPolicyForm = () => {
    setPolicyTitle('');
    setPolicyCategory('general');
    setPolicyContent('');
    setEditingPolicy(null);
  };

  const openEditAI = (config: any) => {
    setEditingAI(config);
    setAIName(config.name);
    setAIPrompt(config.system_prompt || '');
    setAIPersonality(config.personality || '');
    setAIRules(Array.isArray(config.rules) ? config.rules.join('\n') : '');
    setAIDialogOpen(true);
  };

  const openEditPolicy = (policy: any) => {
    setEditingPolicy(policy);
    setPolicyTitle(policy.title);
    setPolicyCategory(policy.category);
    setPolicyContent(policy.content);
    setPolicyDialogOpen(true);
  };

  return (
    <CRMLayout title="Configuration">
      <div className="space-y-6">
        <Tabs defaultValue="crm" className="space-y-6">
          <TabsList>
            <TabsTrigger value="crm" className="gap-2">
              <GitBranch className="h-4 w-4" />
              CRM Settings
            </TabsTrigger>
            <TabsTrigger value="calculator" className="gap-2">
              <Calculator className="h-4 w-4" />
              Calculator
            </TabsTrigger>
            <TabsTrigger value="ai" className="gap-2">
              <Bot className="h-4 w-4" />
              AI
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <Shield className="h-4 w-4" />
              R&P
            </TabsTrigger>
          </TabsList>

          <TabsContent value="crm" className="space-y-6">
            <AllPipelinesConfigEditor />
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

          <TabsContent value="ai" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Agent Configuration
                </CardTitle>
                <Dialog open={aiDialogOpen} onOpenChange={(open) => { setAIDialogOpen(open); if (!open) resetAIForm(); }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Config
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingAI ? 'Edit' : 'Add'} AI Configuration</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Configuration Name *</Label>
                        <Input
                          value={aiName}
                          onChange={(e) => setAIName(e.target.value)}
                          placeholder="e.g., Sales Assistant"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>System Prompt</Label>
                        <Textarea
                          value={aiPrompt}
                          onChange={(e) => setAIPrompt(e.target.value)}
                          placeholder="Define the AI's base instructions and context..."
                          rows={4}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Personality</Label>
                        <Textarea
                          value={aiPersonality}
                          onChange={(e) => setAIPersonality(e.target.value)}
                          placeholder="Describe the AI's personality and communication style..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Rules (one per line)</Label>
                        <Textarea
                          value={aiRules}
                          onChange={(e) => setAIRules(e.target.value)}
                          placeholder="Always respond in professional tone&#10;Never share confidential data&#10;Focus on sales-related topics"
                          rows={4}
                        />
                      </div>
                      <Button 
                        onClick={handleSaveAIConfig} 
                        className="w-full"
                        disabled={addAIConfig.isPending || updateAIConfig.isPending}
                      >
                        {(addAIConfig.isPending || updateAIConfig.isPending) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Save Configuration'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingAI ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : aiConfigs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bot className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No AI configurations yet</p>
                    <p className="text-sm">Create your first configuration to customize AI behavior</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {aiConfigs.map((config) => (
                      <div key={config.id} className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{config.name}</h4>
                              <Badge variant={config.is_active ? 'default' : 'secondary'}>
                                {config.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            {config.personality && (
                              <p className="text-sm text-muted-foreground mb-2">{config.personality}</p>
                            )}
                            {Array.isArray(config.rules) && config.rules.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {config.rules.slice(0, 3).map((rule: string, i: number) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {rule.length > 30 ? rule.slice(0, 30) + '...' : rule}
                                  </Badge>
                                ))}
                                {config.rules.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{config.rules.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditAI(config)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deleteAIConfig.mutate(config.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Rules & Policies
                </CardTitle>
                <Dialog open={policyDialogOpen} onOpenChange={(open) => { setPolicyDialogOpen(open); if (!open) resetPolicyForm(); }}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Policy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingPolicy ? 'Edit' : 'Add'} Policy</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Title *</Label>
                          <Input
                            value={policyTitle}
                            onChange={(e) => setPolicyTitle(e.target.value)}
                            placeholder="Policy title"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Category</Label>
                          <Select value={policyCategory} onValueChange={setPolicyCategory}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {POLICY_CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Content *</Label>
                        <Textarea
                          value={policyContent}
                          onChange={(e) => setPolicyContent(e.target.value)}
                          placeholder="Full policy content..."
                          rows={10}
                        />
                      </div>
                      <Button 
                        onClick={handleSavePolicy} 
                        className="w-full"
                        disabled={addPolicy.isPending || updatePolicy.isPending}
                      >
                        {(addPolicy.isPending || updatePolicy.isPending) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Save Policy'
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingPolicies ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : policies.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No policies defined yet</p>
                    <p className="text-sm">Add your company's internal rules and policies</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {policies.map((policy) => (
                      <div key={policy.id} className="p-4 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{policy.title}</h4>
                              <Badge variant="outline">{policy.category}</Badge>
                              <Badge variant={policy.is_active ? 'default' : 'secondary'}>
                                {policy.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{policy.content}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => openEditPolicy(policy)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive hover:text-destructive"
                              onClick={() => deletePolicy.mutate(policy.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CRMLayout>
  );
}
