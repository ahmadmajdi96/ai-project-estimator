import { ManagementLayout } from '@/components/management/ManagementLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAIDecisions, useAddAIDecision, useUpdateAIDecision } from '@/hooks/useAIDecisions';
import { Scale, Plus, X, Loader2, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DecisionForm {
  title: string;
  description: string;
  context: string;
  options: string[];
}

const initialForm: DecisionForm = {
  title: '',
  description: '',
  context: '',
  options: ['', ''],
};

export default function ManagementAIDecisionsPage() {
  const { data: decisions, isLoading } = useAIDecisions();
  const addDecision = useAddAIDecision();
  const updateDecision = useUpdateAIDecision();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState<DecisionForm>(initialForm);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAddOption = () => {
    if (form.options.length < 5) {
      setForm(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const handleRemoveOption = (index: number) => {
    if (form.options.length > 2) {
      setForm(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index)
      }));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.map((opt, i) => i === index ? value : opt)
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.description || form.options.some(o => !o.trim())) {
      toast.error('Please fill all fields');
      return;
    }

    setIsAnalyzing(true);
    try {
      const formattedOptions = form.options.filter(o => o.trim()).map((opt, idx) => ({
        name: `Option ${idx + 1}`,
        description: opt
      }));
      
      const newDecision = await addDecision.mutateAsync({
        title: form.title,
        description: form.description,
        context: form.context,
        options: formattedOptions,
        status: 'analyzing',
      });

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Analyze this management decision and provide recommendations:
            
Title: ${form.title}
Description: ${form.description}
Context: ${form.context}
Options: ${form.options.filter(o => o.trim()).join(', ')}

Respond in JSON format:
{
  "recommendation": "your recommended option",
  "reasoning": "brief explanation",
  "pros": ["pro1", "pro2"],
  "cons": ["con1", "con2"],
  "risk_score": 0-100
}`
          }],
          context: 'management_decision'
        }
      });

      if (error) throw error;

      let analysis;
      try {
        const jsonMatch = data?.response?.match(/\{[\s\S]*\}/);
        analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
      } catch {
        analysis = { recommendation: data?.response, reasoning: '', pros: [], cons: [], risk_score: 50 };
      }

      await updateDecision.mutateAsync({
        id: newDecision.id,
        ai_analysis: analysis,
        status: 'pending',
      });

      setForm(initialForm);
      setIsDialogOpen(false);
      toast.success('Decision analyzed successfully');
    } catch (error) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze decision');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 30) return 'text-green-500';
    if (score < 70) return 'text-amber-500';
    return 'text-red-500';
  };

  const getRiskBg = (score: number) => {
    if (score < 30) return 'bg-green-500';
    if (score < 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <ManagementLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Decision Support</h1>
            <p className="text-muted-foreground">Get AI-powered analysis for management decisions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Decision
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Decision</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Decision title"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the decision to be made"
                  />
                </div>
                <div>
                  <Label>Context (optional)</Label>
                  <Textarea
                    value={form.context}
                    onChange={(e) => setForm(prev => ({ ...prev, context: e.target.value }))}
                    placeholder="Additional context or constraints"
                  />
                </div>
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {form.options.map((opt, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={opt}
                          onChange={(e) => handleOptionChange(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                        />
                        {form.options.length > 2 && (
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.options.length < 5 && (
                    <Button variant="outline" size="sm" className="mt-2" onClick={handleAddOption}>
                      Add Option
                    </Button>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={isAnalyzing}>
                    {isAnalyzing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Analyze Decision
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent></Card>
          ) : !decisions?.length ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Scale className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">No decisions yet. Create your first decision for AI analysis.</p>
              </CardContent>
            </Card>
          ) : (
            decisions.map(decision => {
              const analysis = decision.ai_analysis as any;
              return (
                <Card key={decision.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{decision.title}</CardTitle>
                        <CardDescription>{decision.description}</CardDescription>
                      </div>
                      <Badge variant={decision.status === 'completed' ? 'default' : 'secondary'}>
                        {decision.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {analysis ? (
                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                          <h4 className="font-medium text-primary mb-2">AI Recommendation</h4>
                          <p>{analysis.recommendation}</p>
                          {analysis.reasoning && (
                            <p className="text-sm text-muted-foreground mt-2">{analysis.reasoning}</p>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              Pros
                            </h4>
                            <ul className="space-y-1">
                              {analysis.pros?.map((pro: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground">• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium flex items-center gap-2">
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                              Cons
                            </h4>
                            <ul className="space-y-1">
                              {analysis.cons?.map((con: string, i: number) => (
                                <li key={i} className="text-sm text-muted-foreground">• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {analysis.risk_score !== undefined && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium flex items-center gap-2">
                                <AlertTriangle className={`h-4 w-4 ${getRiskColor(analysis.risk_score)}`} />
                                Risk Assessment
                              </h4>
                              <span className={`font-medium ${getRiskColor(analysis.risk_score)}`}>
                                {analysis.risk_score}%
                              </span>
                            </div>
                            <Progress value={analysis.risk_score} className={getRiskBg(analysis.risk_score)} />
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Analyzing...</p>
                    )}

                    <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                      Created {format(new Date(decision.created_at), 'MMM d, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </ManagementLayout>
  );
}
