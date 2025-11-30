import { useState } from 'react';
import { CRMLayout } from '@/components/crm/CRMLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import { useAIDecisions, useAddAIDecision, useUpdateAIDecision, useDeleteAIDecision } from '@/hooks/useAIDecisions';
import { 
  Scale, Plus, Trash2, Loader2, AlertTriangle, CheckCircle, 
  XCircle, ThumbsUp, ThumbsDown, TrendingUp, TrendingDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface DecisionForm {
  title: string;
  description: string;
  context: string;
  options: Array<{ name: string; description: string }>;
}

const initialForm: DecisionForm = {
  title: '',
  description: '',
  context: '',
  options: [{ name: '', description: '' }, { name: '', description: '' }],
};

export default function AIDecisionsPage() {
  const { data: decisions = [], isLoading } = useAIDecisions();
  const addDecision = useAddAIDecision();
  const updateDecision = useUpdateAIDecision();
  const deleteDecision = useDeleteAIDecision();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<DecisionForm>(initialForm);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDecision, setSelectedDecision] = useState<any>(null);

  const handleAddOption = () => {
    if (form.options.length < 5) {
      setForm({ ...form, options: [...form.options, { name: '', description: '' }] });
    }
  };

  const handleRemoveOption = (index: number) => {
    if (form.options.length > 2) {
      setForm({ ...form, options: form.options.filter((_, i) => i !== index) });
    }
  };

  const handleOptionChange = (index: number, field: 'name' | 'description', value: string) => {
    const newOptions = [...form.options];
    newOptions[index][field] = value;
    setForm({ ...form, options: newOptions });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || form.options.some(o => !o.name)) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsAnalyzing(true);

    try {
      // First save the decision
      const { data: savedDecision, error: saveError } = await supabase
        .from('ai_decisions')
        .insert({
          title: form.title,
          description: form.description,
          context: form.context || null,
          options: form.options,
          status: 'analyzing',
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Call AI to analyze the decision
      const analysisPrompt = `Analyze this business decision for a software/AI company CRM:

Title: ${form.title}
Description: ${form.description}
Context: ${form.context || 'None provided'}
Options:
${form.options.map((o, i) => `${i + 1}. ${o.name}: ${o.description}`).join('\n')}

Provide a structured JSON analysis with:
1. recommendation: Which option is best and why (string)
2. advantages: Array of 3-5 advantages of the recommended option
3. disadvantages: Array of 2-4 potential disadvantages/challenges
4. risk_score: A number from 1-10 (10 being highest risk)
5. risk_factors: Array of 2-4 specific risk factors to consider
6. confidence: Your confidence level 1-100

Respond ONLY with valid JSON, no markdown or explanation.`;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: analysisPrompt }],
          context: {},
        }),
      });

      if (!response.ok) throw new Error('AI analysis failed');

      const reader = response.body?.getReader();
      let analysisText = '';
      
      if (reader) {
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const json = JSON.parse(line.slice(6));
                analysisText += json.choices?.[0]?.delta?.content || '';
              } catch {}
            }
          }
        }
      }

      // Parse the AI response
      let aiAnalysis;
      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAnalysis = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found');
        }
      } catch {
        aiAnalysis = {
          recommendation: 'Unable to provide automated analysis. Please review options manually.',
          advantages: ['Manual review recommended'],
          disadvantages: ['AI analysis unavailable'],
          risk_score: 5,
          risk_factors: ['Insufficient data for AI analysis'],
          confidence: 50,
        };
      }

      // Update the decision with AI analysis
      await supabase
        .from('ai_decisions')
        .update({
          ai_analysis: aiAnalysis,
          status: 'analyzed',
        })
        .eq('id', savedDecision.id);

      toast.success('Decision analyzed successfully');
      setIsDialogOpen(false);
      setForm(initialForm);
    } catch (error: any) {
      toast.error(error.message || 'Failed to analyze decision');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-500';
    if (score <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskBg = (score: number) => {
    if (score <= 3) return 'bg-green-500';
    if (score <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <CRMLayout title="AI Decision Support">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">AI Decision Support</h2>
            <p className="text-muted-foreground">Get AI-powered analysis for your business decisions</p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Decision
          </Button>
        </div>

        {/* Decisions List */}
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">Loading decisions...</Card>
        ) : decisions.length === 0 ? (
          <Card className="p-8 text-center">
            <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No decisions yet</h3>
            <p className="text-muted-foreground mb-4">Create a new decision to get AI-powered analysis</p>
            <Button onClick={() => setIsDialogOpen(true)}>Create First Decision</Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {decisions.map((decision: any) => (
              <Card key={decision.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{decision.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{decision.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={decision.status === 'analyzed' ? 'default' : 'secondary'}>
                        {decision.status}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => deleteDecision.mutateAsync(decision.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {decision.ai_analysis && Object.keys(decision.ai_analysis).length > 0 && (
                    <div className="space-y-4">
                      {/* Recommendation */}
                      <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-primary" />
                          <span className="font-semibold">AI Recommendation</span>
                        </div>
                        <p className="text-sm">{decision.ai_analysis.recommendation}</p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        {/* Advantages */}
                        <div className="p-4 rounded-lg bg-green-500/5 border border-green-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="h-4 w-4 text-green-500" />
                            <span className="font-medium text-green-500">Advantages</span>
                          </div>
                          <ul className="text-sm space-y-1">
                            {decision.ai_analysis.advantages?.map((adv: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <TrendingUp className="h-3 w-3 mt-1 text-green-500" />
                                {adv}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Disadvantages */}
                        <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20">
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                            <span className="font-medium text-red-500">Disadvantages</span>
                          </div>
                          <ul className="text-sm space-y-1">
                            {decision.ai_analysis.disadvantages?.map((dis: string, i: number) => (
                              <li key={i} className="flex items-start gap-2">
                                <TrendingDown className="h-3 w-3 mt-1 text-red-500" />
                                {dis}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Risk Assessment */}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className={`h-4 w-4 ${getRiskColor(decision.ai_analysis.risk_score || 5)}`} />
                            <span className="font-medium">Risk Assessment</span>
                          </div>
                          <span className={`text-2xl font-bold ${getRiskColor(decision.ai_analysis.risk_score || 5)}`}>
                            {decision.ai_analysis.risk_score || 5}/10
                          </span>
                        </div>
                        <Progress 
                          value={(decision.ai_analysis.risk_score || 5) * 10} 
                          className={`h-2 ${getRiskBg(decision.ai_analysis.risk_score || 5)}`}
                        />
                        {decision.ai_analysis.risk_factors && (
                          <div className="mt-3">
                            <p className="text-xs text-muted-foreground mb-1">Risk Factors:</p>
                            <div className="flex flex-wrap gap-1">
                              {decision.ai_analysis.risk_factors.map((rf: string, i: number) => (
                                <Badge key={i} variant="outline" className="text-xs">{rf}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Confidence */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">AI Confidence Level</span>
                        <span className="font-medium">{decision.ai_analysis.confidence || 75}%</span>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-4">
                    Created: {format(new Date(decision.created_at), 'MMM d, yyyy HH:mm')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Decision Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Decision Analysis</DialogTitle>
            <DialogDescription>
              Describe your decision and options to get AI-powered analysis with advantages, disadvantages, and risk assessment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Decision Title *</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., Expand to European Market"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the decision you need to make..."
                rows={3}
              />
            </div>

            <div>
              <Label>Context (optional)</Label>
              <Textarea
                value={form.context}
                onChange={(e) => setForm({ ...form, context: e.target.value })}
                placeholder="Additional context, constraints, or considerations..."
                rows={2}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Options to Consider *</Label>
                {form.options.length < 5 && (
                  <Button type="button" variant="ghost" size="sm" onClick={handleAddOption}>
                    <Plus className="h-4 w-4 mr-1" /> Add Option
                  </Button>
                )}
              </div>
              <div className="space-y-3">
                {form.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <Input
                        value={option.name}
                        onChange={(e) => handleOptionChange(index, 'name', e.target.value)}
                        placeholder={`Option ${index + 1} name`}
                      />
                      <Input
                        value={option.description}
                        onChange={(e) => handleOptionChange(index, 'description', e.target.value)}
                        placeholder="Brief description"
                      />
                    </div>
                    {form.options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <XCircle className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAnalyzing}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isAnalyzing} className="gap-2">
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Scale className="h-4 w-4" />
                  Analyze Decision
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CRMLayout>
  );
}
