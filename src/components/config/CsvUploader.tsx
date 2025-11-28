import { useCallback } from 'react';
import { useCalculatorStore } from '@/store/calculatorStore';
import { Button } from '@/components/ui/button';
import { Upload, FileSpreadsheet, Trash2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CsvUploader() {
  const { csvFiles, addCsvFile, deleteCsvFile } = useCalculatorStore();
  const { toast } = useToast();

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        addCsvFile({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          uploadedAt: new Date(),
          size: file.size,
        });
        toast({
          title: 'File uploaded',
          description: `${file.name} has been added successfully.`,
        });
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload a CSV file.',
          variant: 'destructive',
        });
      }
    });

    e.target.value = '';
  }, [addCsvFile, toast]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
          <FileSpreadsheet className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">CSV Data Files</h2>
          <p className="text-sm text-muted-foreground">Upload data for AI price calculations</p>
        </div>
      </div>

      {/* Info box */}
      <div className="mb-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <div className="flex gap-3">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">How CSV files work</p>
            <p>Upload your historical project data, pricing benchmarks, or market analysis. Your AI model will use this data to provide intelligent pricing suggestions.</p>
          </div>
        </div>
      </div>

      {/* Upload area */}
      <label className="block cursor-pointer">
        <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-all">
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium text-foreground mb-1">Drop CSV files here or click to browse</p>
          <p className="text-sm text-muted-foreground">Supports .csv files up to 10MB</p>
        </div>
        <input
          type="file"
          accept=".csv"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>

      {/* File list */}
      {csvFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-medium text-foreground">{csvFiles.length} file(s) uploaded</p>
          {csvFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border/50"
            >
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={() => deleteCsvFile(file.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
