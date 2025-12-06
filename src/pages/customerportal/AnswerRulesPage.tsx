import { CustomerPortalLayout } from "@/components/customerportal/CustomerPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft,
  GripVertical,
  Copy,
  MoreVertical
} from "lucide-react";
import { useAnswerRules, useCreateAnswerRule, useUpdateAnswerRule, useDeleteAnswerRule, type AnswerRule } from "@/hooks/useCustomerPortal";
import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AnswerRulesPage() {
  const { id: chatbotId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: rules, isLoading } = useAnswerRules(chatbotId || '');
  const createRule = useCreateAnswerRule();
  const updateRule = useUpdateAnswerRule();
  const deleteRule = useDeleteAnswerRule();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AnswerRule | null>(null);
  const [formData, setFormData] = useState({
    rule_name: '',
    trigger_type: 'exact_match',
    keywords: '',
    exact_phrases: '',
    response_type: 'text',
    response_text: '',
    priority: 1,
    is_active: true,
  });

  const filteredRules = rules?.filter(rule =>
    rule.rule_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const resetForm = () => {
    setFormData({
      rule_name: '',
      trigger_type: 'exact_match',
      keywords: '',
      exact_phrases: '',
      response_type: 'text',
      response_text: '',
      priority: 1,
      is_active: true,
    });
    setEditingRule(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (rule: AnswerRule) => {
    setEditingRule(rule);
    setFormData({
      rule_name: rule.rule_name,
      trigger_type: rule.trigger_type,
      keywords: rule.keywords?.join(', ') || '',
      exact_phrases: rule.exact_phrases?.join('\n') || '',
      response_type: rule.response_type,
      response_text: rule.response_text || '',
      priority: rule.priority,
      is_active: rule.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.rule_name || !formData.response_text) {
      toast.error("Please fill in required fields");
      return;
    }

    const ruleData = {
      chatbot_id: chatbotId!,
      rule_name: formData.rule_name,
      trigger_type: formData.trigger_type,
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      exact_phrases: formData.exact_phrases.split('\n').map(p => p.trim()).filter(Boolean),
      response_type: formData.response_type,
      response_text: formData.response_text,
      priority: formData.priority,
      is_active: formData.is_active,
    };

    try {
      if (editingRule) {
        await updateRule.mutateAsync({ id: editingRule.id, ...ruleData });
        toast.success("Rule updated successfully");
      } else {
        await createRule.mutateAsync(ruleData);
        toast.success("Rule created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save rule");
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("Are you sure you want to delete this rule?")) return;
    try {
      await deleteRule.mutateAsync(ruleId);
      toast.success("Rule deleted");
    } catch (error) {
      toast.error("Failed to delete rule");
    }
  };

  const handleToggleActive = async (rule: AnswerRule) => {
    try {
      await updateRule.mutateAsync({ id: rule.id, is_active: !rule.is_active });
      toast.success(rule.is_active ? "Rule deactivated" : "Rule activated");
    } catch (error) {
      toast.error("Failed to update rule");
    }
  };

  const getTriggerTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      exact_match: 'bg-blue-500/10 text-blue-500',
      keyword: 'bg-green-500/10 text-green-500',
      pattern: 'bg-purple-500/10 text-purple-500',
      intent: 'bg-orange-500/10 text-orange-500',
    };
    return colors[type] || 'bg-muted text-muted-foreground';
  };

  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/customer-portal/chatbots/${chatbotId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Answer Rules</h1>
              <p className="text-muted-foreground">Configure how your chatbot responds to messages</p>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Rule
          </Button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="outline">{filteredRules.length} rules</Badge>
        </div>

        {/* Rules List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading rules...</div>
        ) : filteredRules.length > 0 ? (
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <Card key={rule.id} className={!rule.is_active ? 'opacity-60' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1 cursor-move">
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{rule.rule_name}</h3>
                          <Badge className={getTriggerTypeBadge(rule.trigger_type)}>
                            {rule.trigger_type.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">Priority: {rule.priority}</Badge>
                          {!rule.is_active && <Badge variant="secondary">Inactive</Badge>}
                        </div>
                        
                        {rule.keywords && rule.keywords.length > 0 && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-muted-foreground">Keywords:</span>
                            <div className="flex gap-1 flex-wrap">
                              {rule.keywords.slice(0, 5).map((keyword, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {rule.keywords.length > 5 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{rule.keywords.length - 5}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          Response: {rule.response_text}
                        </p>
                        
                        {rule.match_count > 0 && (
                          <p className="text-xs text-muted-foreground mt-2">
                            Triggered {rule.match_count} times
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={rule.is_active}
                        onCheckedChange={() => handleToggleActive(rule)}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(rule)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setFormData({
                              ...formData,
                              rule_name: rule.rule_name + ' (Copy)',
                              keywords: rule.keywords?.join(', ') || '',
                              exact_phrases: rule.exact_phrases?.join('\n') || '',
                              response_text: rule.response_text || '',
                            });
                            setIsDialogOpen(true);
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(rule.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <Zap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Answer Rules</h3>
              <p className="text-muted-foreground mb-4">
                Create your first rule to start automating responses.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Rule
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRule ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
              <DialogDescription>
                Define how your chatbot should respond to specific triggers.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rule_name">Rule Name *</Label>
                <Input
                  id="rule_name"
                  value={formData.rule_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, rule_name: e.target.value }))}
                  placeholder="e.g., Welcome Message"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Trigger Type</Label>
                  <Select
                    value={formData.trigger_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, trigger_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="exact_match">Exact Match</SelectItem>
                      <SelectItem value="keyword">Keywords</SelectItem>
                      <SelectItem value="pattern">Pattern</SelectItem>
                      <SelectItem value="intent">Intent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="hello, hi, hey, greetings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exact_phrases">Exact Phrases (one per line)</Label>
                <Textarea
                  id="exact_phrases"
                  value={formData.exact_phrases}
                  onChange={(e) => setFormData(prev => ({ ...prev, exact_phrases: e.target.value }))}
                  placeholder="What are your business hours?&#10;When are you open?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Response Type</Label>
                <Select
                  value={formData.response_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, response_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="buttons">Buttons</SelectItem>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="quick_replies">Quick Replies</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="response_text">Response Text *</Label>
                <Textarea
                  id="response_text"
                  value={formData.response_text}
                  onChange={(e) => setFormData(prev => ({ ...prev, response_text: e.target.value }))}
                  placeholder="Hello! How can I help you today?"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createRule.isPending || updateRule.isPending}>
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPortalLayout>
  );
}
