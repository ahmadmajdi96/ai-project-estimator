import { useState, useRef } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ManagementSidebar } from '@/components/management/ManagementSidebar';
import { useCompanyDocuments, useAddCompanyDocument, useDeleteCompanyDocument } from '@/hooks/useCompanyDocuments';
import { useDepartments } from '@/hooks/useDepartments';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Trash2, Loader2, Upload, Building, Download, Eye, Search, FolderOpen } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const categoryColors: Record<string, string> = {
  general: 'bg-slate-500/10 text-slate-500',
  policy: 'bg-blue-500/10 text-blue-500',
  template: 'bg-green-500/10 text-green-500',
  report: 'bg-purple-500/10 text-purple-500',
  training: 'bg-orange-500/10 text-orange-500',
  legal: 'bg-red-500/10 text-red-500',
};

const categories = ['general', 'policy', 'template', 'report', 'training', 'legal'];

export default function ManagementDocumentsPage() {
  const { data: departments = [] } = useDepartments();
  const [selectedDepartment, setSelectedDepartment] = useState<string>('__all__');
  const { data: documents = [], isLoading } = useCompanyDocuments(selectedDepartment === '__all__' ? undefined : selectedDepartment);
  const addDocument = useAddCompanyDocument();
  const deleteDocument = useDeleteCompanyDocument();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [departmentId, setDepartmentId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const filteredDocs = documents.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error('File size must be less than 20MB');
        return;
      }
      setSelectedFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedFile) {
      toast.error('Title and file are required');
      return;
    }

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('company-documents')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;

      await addDocument.mutateAsync({
        title,
        description: description || undefined,
        file_path: filePath,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        category,
        department_id: departmentId || undefined,
      });

      setTitle(''); setDescription(''); setCategory('general'); setDepartmentId(''); setSelectedFile(null);
      setDialogOpen(false);
    } catch (error: any) {
      toast.error('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: typeof documents[0]) => {
    const { data } = supabase.storage.from('company-documents').getPublicUrl(doc.file_path);
    window.open(data.publicUrl, '_blank');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this document?')) {
      await deleteDocument.mutateAsync(id);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <ManagementSidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold">Company Documents</h1>
                <p className="text-muted-foreground">Centralized document management</p>
              </div>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Upload Document</Button></DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>File *</Label>
                      <div 
                        className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                        {selectedFile ? (
                          <div className="flex items-center justify-center gap-2">
                            <FileText className="h-8 w-8 text-primary" />
                            <div className="text-left">
                              <p className="font-medium">{selectedFile.name}</p>
                              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground">Click to select a file</p>
                            <p className="text-xs text-muted-foreground">Max 20MB</p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2"><Label>Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{categories.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Department</Label>
                        <Select value={departmentId || "__none__"} onValueChange={(v) => setDepartmentId(v === "__none__" ? "" : v)}>
                          <SelectTrigger><SelectValue placeholder="Company Wide" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Company Wide</SelectItem>
                            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={uploading || addDocument.isPending}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Upload Document'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card className="p-4 bg-card/50">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search documents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="All Departments" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Departments</SelectItem>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : filteredDocs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">No documents found</h3>
                  <p className="text-muted-foreground mb-4">Upload your first document to get started</p>
                  <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-2" />Upload Document</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDocs.map(doc => (
                  <Card key={doc.id} className="group hover:shadow-lg transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-lg bg-primary/10 shrink-0">
                          <FileText className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{doc.title}</h4>
                          {doc.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{doc.description}</p>}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="secondary" className={categoryColors[doc.category] || categoryColors.general}>{doc.category}</Badge>
                            {doc.departments?.name && <Badge variant="outline">{doc.departments.name}</Badge>}
                          </div>
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                            <span className="text-xs text-muted-foreground">{formatFileSize(doc.file_size)} • {format(new Date(doc.created_at), 'MMM d, yyyy')}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDownload(doc)}><Download className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(doc.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
