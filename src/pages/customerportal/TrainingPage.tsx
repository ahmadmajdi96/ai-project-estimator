import { CustomerPortalLayout } from "@/components/customerportal/CustomerPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  GraduationCap, 
  Plus, 
  Search, 
  Trash2, 
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { useTrainingQuestions, useCreateTrainingQuestion, useDeleteTrainingQuestion, type TrainingQuestion } from "@/hooks/useCustomerPortal";
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

export default function TrainingPage() {
  const { id: chatbotId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: questions, isLoading } = useTrainingQuestions(chatbotId || '');
  const createQuestion = useCreateTrainingQuestion();
  const deleteQuestion = useDeleteTrainingQuestion();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    question: '',
    variations: '',
    answer: '',
    confidence_threshold: 0.7,
  });

  const filteredQuestions = questions?.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const resetForm = () => {
    setFormData({
      question: '',
      variations: '',
      answer: '',
      confidence_threshold: 0.7,
    });
  };

  const handleSubmit = async () => {
    if (!formData.question || !formData.answer) {
      toast.error("Please fill in required fields");
      return;
    }

    const questionData = {
      chatbot_id: chatbotId!,
      question: formData.question,
      variations: formData.variations.split('\n').map(v => v.trim()).filter(Boolean),
      answer: formData.answer,
      confidence_threshold: formData.confidence_threshold,
    };

    try {
      await createQuestion.mutateAsync(questionData);
      toast.success("Training question added");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to add training question");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this training question?")) return;
    try {
      await deleteQuestion.mutateAsync(id);
      toast.success("Training question deleted");
    } catch (error) {
      toast.error("Failed to delete training question");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'trained':
        return <Badge className="bg-green-500/10 text-green-500"><CheckCircle className="h-3 w-3 mr-1" />Trained</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/10 text-red-500"><AlertCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const trainedCount = questions?.filter(q => q.training_status === 'trained').length || 0;
  const pendingCount = questions?.filter(q => q.training_status === 'pending').length || 0;

  return (
    <CustomerPortalLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/customer-portal/chatbots/${chatbotId}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Training</h1>
              <p className="text-muted-foreground">Train your chatbot with Q&A pairs</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={pendingCount === 0}>
              <Sparkles className="h-4 w-4 mr-2" />
              Train All ({pendingCount})
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Q&A
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Q&As</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{questions?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Trained</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{trainedCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search Q&As..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading training data...</div>
        ) : filteredQuestions.length > 0 ? (
          <div className="space-y-3">
            {filteredQuestions.map((question) => (
              <Card key={question.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-primary">Q:</span>
                        <p className="font-medium">{question.question}</p>
                        {getStatusBadge(question.training_status)}
                      </div>
                      
                      {question.variations && question.variations.length > 0 && (
                        <div className="ml-6 text-sm text-muted-foreground">
                          <span className="font-medium">Variations:</span>
                          <ul className="list-disc ml-4">
                            {question.variations.slice(0, 3).map((v, i) => (
                              <li key={i}>{v}</li>
                            ))}
                            {question.variations.length > 3 && (
                              <li>+{question.variations.length - 3} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-2">
                        <span className="font-semibold text-green-500">A:</span>
                        <p className="text-muted-foreground">{question.answer}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Confidence threshold: {(question.confidence_threshold * 100).toFixed(0)}%</span>
                        {question.match_count > 0 && (
                          <span>Used {question.match_count} times</span>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(question.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <GraduationCap className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Training Data</h3>
              <p className="text-muted-foreground mb-4">
                Add Q&A pairs to train your chatbot.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Q&A
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Training Q&A</DialogTitle>
              <DialogDescription>
                Add a question and answer pair to train your chatbot.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question *</Label>
                <Input
                  id="question"
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="What is your return policy?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="variations">Question Variations (one per line)</Label>
                <Textarea
                  id="variations"
                  value={formData.variations}
                  onChange={(e) => setFormData(prev => ({ ...prev, variations: e.target.value }))}
                  placeholder="Can I return items?&#10;How do I return a product?&#10;What's the refund policy?"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  Add different ways users might ask the same question
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer *</Label>
                <Textarea
                  id="answer"
                  value={formData.answer}
                  onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
                  placeholder="You can return any item within 30 days of purchase for a full refund..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confidence">Confidence Threshold: {(formData.confidence_threshold * 100).toFixed(0)}%</Label>
                <input
                  type="range"
                  id="confidence"
                  min="0.5"
                  max="1"
                  step="0.05"
                  value={formData.confidence_threshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, confidence_threshold: parseFloat(e.target.value) }))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Higher threshold means more exact matching required
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createQuestion.isPending}>
                Add Q&A
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPortalLayout>
  );
}
