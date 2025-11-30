import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClientDocuments, useUploadClientDocument, useDeleteClientDocument, getClientDocumentUrl } from '@/hooks/useClientDocuments';
import { FileText, Upload, Download, Trash2, Loader2, File, FileImage, FileSpreadsheet } from 'lucide-react';
import { format } from 'date-fns';

interface ClientDocumentsProps {
  clientId: string;
}

const getFileIcon = (fileType: string | null) => {
  if (!fileType) return File;
  if (fileType.includes('image')) return FileImage;
  if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) return FileSpreadsheet;
  if (fileType.includes('pdf')) return FileText;
  return File;
};

const formatFileSize = (bytes: number | null) => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function ClientDocuments({ clientId }: ClientDocumentsProps) {
  const { data: documents = [], isLoading } = useClientDocuments(clientId);
  const uploadDocument = useUploadClientDocument();
  const deleteDocument = useDeleteClientDocument();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadDocument.mutateAsync({ clientId, file });
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const url = getClientDocumentUrl(filePath);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Documents ({documents.length})
        </h3>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
          <Button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadDocument.isPending}
            className="gap-2"
          >
            {uploadDocument.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Document
          </Button>
        </div>
      </div>

      {documents.length === 0 ? (
        <Card className="p-8 text-center bg-muted/30">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">No documents uploaded yet</p>
          <p className="text-sm text-muted-foreground/70">Upload contracts, proposals, or other files</p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {documents.map(doc => {
            const Icon = getFileIcon(doc.file_type);
            return (
              <Card key={doc.id} className="p-4 bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{doc.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{format(new Date(doc.uploaded_at), 'MMM d, yyyy')}</span>
                      {doc.file_type && (
                        <>
                          <span>•</span>
                          <Badge variant="outline" className="text-xs">{doc.file_type.split('/').pop()}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(doc.file_path, doc.name)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => deleteDocument.mutate({ id: doc.id, filePath: doc.file_path, clientId })}
                      disabled={deleteDocument.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}