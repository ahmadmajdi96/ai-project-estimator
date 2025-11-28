import { useCsvFiles, useAddCsvFile, useDeleteCsvFile } from '@/hooks/useCsvFiles';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Trash2, Info, Loader2 } from 'lucide-react';
import { useRef } from 'react';

export function CsvUploader() {
  const { data: csvFiles, isLoading } = useCsvFiles();
  const addCsvFile = useAddCsvFile();
  const deleteCsvFile = useDeleteCsvFile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      addCsvFile.mutate({
        name: file.name,
        size: file.size,
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">CSV Files</h2>
          <p className="text-sm text-muted-foreground">Upload data for AI pricing</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Upload area */}
        <div
          className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">CSV files only</p>
        </div>

        {/* File list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        ) : csvFiles && csvFiles.length > 0 ? (
          <div className="space-y-2">
            {csvFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {new Date(file.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteCsvFile.mutate(file.id)}
                  disabled={deleteCsvFile.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            No CSV files uploaded yet
          </p>
        )}

        {/* Info box */}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">About CSV uploads</p>
              <p>
                CSV files are used by the AI model to provide more accurate pricing
                estimates based on historical data and market analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
