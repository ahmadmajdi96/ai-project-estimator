import { CustomerPortalLayout } from "@/components/customerportal/CustomerPortalLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Tag,
  MoreVertical
} from "lucide-react";
import { useKnowledgeBaseEntries, useCreateKBEntry, useUpdateKBEntry, useDeleteKBEntry, type KnowledgeBaseEntry } from "@/hooks/useCustomerPortal";
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
import { format } from "date-fns";

const categories = [
  "General",
  "Products",
  "Services",
  "Pricing",
  "Support",
  "FAQ",
  "Policies",
  "Other"
];

export default function CustomerPortalKnowledgeBasePage() {
  const { id: chatbotId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: entries, isLoading } = useKnowledgeBaseEntries(chatbotId || '');
  const createEntry = useCreateKBEntry();
  const updateEntry = useUpdateKBEntry();
  const deleteEntry = useDeleteKBEntry();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<KnowledgeBaseEntry | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    category: 'General',
    tags: '',
    keywords: '',
    status: 'active',
  });

  const filteredEntries = entries?.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    return matchesSearch && matchesCategory;
  }) || [];

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: 'General',
      tags: '',
      keywords: '',
      status: 'active',
    });
    setEditingEntry(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (entry: KnowledgeBaseEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title,
      content: entry.content,
      summary: entry.summary || '',
      category: entry.category || 'General',
      tags: entry.tags?.join(', ') || '',
      keywords: entry.keywords?.join(', ') || '',
      status: entry.status,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      toast.error("Please fill in required fields");
      return;
    }

    const entryData = {
      chatbot_id: chatbotId!,
      title: formData.title,
      content: formData.content,
      summary: formData.summary || null,
      category: formData.category,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(Boolean),
      status: formData.status,
    };

    try {
      if (editingEntry) {
        await updateEntry.mutateAsync({ id: editingEntry.id, ...entryData });
        toast.success("Entry updated successfully");
      } else {
        await createEntry.mutateAsync(entryData);
        toast.success("Entry created successfully");
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Failed to save entry");
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await deleteEntry.mutateAsync(entryId);
      toast.success("Entry deleted");
    } catch (error) {
      toast.error("Failed to delete entry");
    }
  };

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      General: 'bg-blue-500/10 text-blue-500',
      Products: 'bg-green-500/10 text-green-500',
      Services: 'bg-purple-500/10 text-purple-500',
      Pricing: 'bg-yellow-500/10 text-yellow-500',
      Support: 'bg-orange-500/10 text-orange-500',
      FAQ: 'bg-cyan-500/10 text-cyan-500',
      Policies: 'bg-red-500/10 text-red-500',
    };
    return colors[category || 'General'] || 'bg-muted text-muted-foreground';
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
              <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
              <p className="text-muted-foreground">Manage your chatbot's knowledge articles</p>
            </div>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline">{filteredEntries.length} entries</Badge>
        </div>

        {/* Entries Grid */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Loading entries...</div>
        ) : filteredEntries.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <Badge className={getCategoryColor(entry.category)}>
                      {entry.category || 'General'}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(entry)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(entry.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{entry.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {entry.summary || entry.content}
                  </p>
                  
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      {entry.tags.slice(0, 3).map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {entry.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{entry.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {entry.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        {entry.helpful_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="h-3 w-3" />
                        {entry.unhelpful_count}
                      </span>
                    </div>
                    <Badge variant={entry.status === 'active' ? 'default' : 'secondary'}>
                      {entry.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="py-12">
            <CardContent className="text-center">
              <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-semibold mb-2">No Knowledge Entries</h3>
              <p className="text-muted-foreground mb-4">
                Add your first entry to help train your chatbot.
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingEntry ? 'Edit Entry' : 'Create New Entry'}</DialogTitle>
              <DialogDescription>
                Add knowledge that your chatbot can use to answer questions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Return Policy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Detailed information about this topic..."
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary (optional)</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary for quick reference..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="returns, refund, policy"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (comma separated)</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData(prev => ({ ...prev, keywords: e.target.value }))}
                  placeholder="return, exchange, refund, money back"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={createEntry.isPending || updateEntry.isPending}>
                {editingEntry ? 'Update Entry' : 'Create Entry'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </CustomerPortalLayout>
  );
}
