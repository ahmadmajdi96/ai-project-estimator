import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Salesman } from '@/hooks/useSalesmen';
import { useSalesmanDocuments, useUploadSalesmanDocument, useDeleteSalesmanDocument, getDocumentUrl } from '@/hooks/useSalesmanDocuments';
import { format } from 'date-fns';
import { 
  User, FileText, Upload, Trash2, Download, Eye, Loader2,
  Mail, Phone, MapPin, Calendar, DollarSign, Target, Briefcase
} from 'lucide-react';

interface SalesmanProfileDialogProps {
  salesman: Salesman | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SalesmanProfileDialog({ salesman, open, onOpenChange }: SalesmanProfileDialogProps) {
  const { data: documents = [], isLoading: loadingDocs } = useSalesmanDocuments(salesman?.id);
  const uploadDocument = useUploadSalesmanDocument();
  const deleteDocument = useDeleteSalesmanDocument();
  
  const [documentName, setDocumentName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!salesman) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!documentName) {
        setDocumentName(file.name.split('.')[0]);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName) return;
    
    await uploadDocument.mutateAsync({
      salesmanId: salesman.id,
      file: selectedFile,
      documentName,
    });
    
    setSelectedFile(null);
    setDocumentName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = async (doc: { id: string; file_path: string }) => {
    if (confirm('Delete this document?')) {
      await deleteDocument.mutateAsync({
        id: doc.id,
        filePath: doc.file_path,
        salesmanId: salesman.id,
      });
    }
  };

  const getContractTypeBadge = (type: string) => {
    const styles = {
      fulltime: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      parttime: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      contractor: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    };
    return styles[type as keyof typeof styles] || styles.fulltime;
  };

  const getApprovalBadge = (status: string) => {
    const styles = {
      pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      approved: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {salesman.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{salesman.name}</h2>
              <div className="flex gap-2 mt-1">
                <Badge className={getContractTypeBadge(salesman.contract_type || 'fulltime')}>
                  {salesman.contract_type || 'Full-time'}
                </Badge>
                <Badge className={getApprovalBadge(salesman.approval_status || 'pending')}>
                  {salesman.approval_status || 'Pending'}
                </Badge>
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList className="w-full">
            <TabsTrigger value="details" className="flex-1 gap-2">
              <User className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1 gap-2">
              <FileText className="h-4 w-4" />
              Documents ({documents.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4 mt-4">
            {/* Contact Info */}
            <Card className="p-4 bg-card/50">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Contact Information</h3>
              <div className="grid grid-cols-2 gap-4">
                {salesman.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{salesman.email}</span>
                  </div>
                )}
                {salesman.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{salesman.phone}</span>
                  </div>
                )}
                {salesman.territory && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{salesman.territory}</span>
                  </div>
                )}
                {salesman.hire_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Hired: {format(new Date(salesman.hire_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Employment Info */}
            <Card className="p-4 bg-card/50">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Employment</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Contract: {salesman.contract_type || 'Full-time'}</span>
                </div>
                {salesman.social_number && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">SSN: •••-••-{salesman.social_number.slice(-4)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Commission: {salesman.commission_rate}%</span>
                </div>
              </div>
            </Card>

            {/* Targets */}
            <Card className="p-4 bg-card/50">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Targets</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-primary/10">
                  <p className="text-lg font-bold text-primary">${salesman.target_monthly.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Monthly</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-emerald-500/10">
                  <p className="text-lg font-bold text-emerald-400">${salesman.target_quarterly.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Quarterly</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-purple-500/10">
                  <p className="text-lg font-bold text-purple-400">${salesman.target_annual.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Annual</p>
                </div>
              </div>
            </Card>

            {/* Rejection Reason */}
            {salesman.approval_status === 'rejected' && salesman.rejection_reason && (
              <Card className="p-4 bg-red-500/10 border-red-500/20">
                <h3 className="font-semibold mb-2 text-red-400">Rejection Reason</h3>
                <p className="text-sm">{salesman.rejection_reason}</p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4 mt-4">
            {/* Upload Section */}
            <Card className="p-4 bg-card/50">
              <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wide">Upload Document</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Document Name</Label>
                    <Input
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      placeholder="e.g., Contract, ID Copy"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>File</Label>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileSelect}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || !documentName || uploadDocument.isPending}
                  className="w-full"
                >
                  {uploadDocument.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Document
                </Button>
              </div>
            </Card>

            {/* Documents List */}
            <div className="space-y-2">
              {loadingDocs ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : documents.length > 0 ? (
                documents.map((doc) => (
                  <Card key={doc.id} className="p-3 bg-card/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB • ` : ''}
                          {format(new Date(doc.uploaded_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => window.open(getDocumentUrl(doc.file_path), '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <a href={getDocumentUrl(doc.file_path)} download={doc.name}>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(doc)}
                        disabled={deleteDocument.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}