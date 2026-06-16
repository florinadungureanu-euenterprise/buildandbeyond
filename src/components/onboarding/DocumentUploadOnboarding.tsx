import { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle2, Loader2, ArrowLeft, ArrowRight, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUserId } from '@/hooks/useUserId';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface DocumentUploadOnboardingProps {
  onBack: () => void;
}

interface FileItem {
  file: File;
  status: 'pending' | 'uploading' | 'done' | 'error';
  error?: string;
}

const ACCEPTED = '.pdf,.doc,.docx,.ppt,.pptx,.txt,.md';

export function DocumentUploadOnboarding({ onBack }: DocumentUploadOnboardingProps) {
  const userId = useUserId();
  const { toast } = useToast();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const onPick = (list: FileList | null) => {
    if (!list) return;
    const next: FileItem[] = Array.from(list).map((file) => ({ file, status: 'pending' }));
    setFiles((prev) => [...prev, ...next]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const readBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result.includes(',') ? result.split(',')[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleUploadAndContinue = async () => {
    if (files.length === 0) return;
    setSubmitting(true);
    let anyOk = false;

    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      if (item.status === 'done') { anyOk = true; continue; }
      setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'uploading' } : f));
      try {
        const base64 = await readBase64(item.file);
        const { error } = await supabase
          .from('uploaded_documents' as any)
          .insert({
            user_id: userId,
            name: item.file.name,
            type: item.file.type || 'application/octet-stream',
            size: item.file.size,
            content: base64,
          } as any);
        if (error) throw error;
        anyOk = true;
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'done' } : f));
      } catch (err: any) {
        setFiles((prev) => prev.map((f, idx) => idx === i ? { ...f, status: 'error', error: err?.message || 'Upload failed' } : f));
      }
    }

    setSubmitting(false);

    if (anyOk) {
      toast({
        title: 'Documents uploaded',
        description: 'Your materials are saved. We\'ll use them to personalize your platform.',
      });
      // Continue into the platform; the chat advisor will pick up the docs
      navigate('/dashboard');
    } else {
      toast({
        title: 'Upload failed',
        description: 'No documents could be uploaded. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </Button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Upload your documents</h1>
          <p className="text-sm text-muted-foreground">
            Drop your pitch deck, business plan, or any founder doc. We&apos;ll extract key info and use it to populate your platform.
          </p>
        </div>

        <Card
          className="p-8 border-2 border-dashed border-border hover:border-primary/50 transition-colors cursor-pointer text-center"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); onPick(e.dataTransfer.files); }}
        >
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground mb-1">Click to select or drag files here</p>
          <p className="text-xs text-muted-foreground">PDF, Word, PowerPoint, or text files</p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED}
            className="hidden"
            onChange={(e) => onPick(e.target.files)}
          />
        </Card>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((f, idx) => (
              <Card key={idx} className="p-3 flex items-center gap-3">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{f.file.name}</p>
                  <p className="text-xs text-muted-foreground">{(f.file.size / 1024).toFixed(1)} KB</p>
                </div>
                {f.status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {f.status === 'done' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {f.status === 'error' && (
                  <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                )}
                {f.status !== 'uploading' && (
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(idx)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            Skip for now
          </Button>
          <Button
            onClick={handleUploadAndContinue}
            disabled={files.length === 0 || submitting}
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Uploading…</>
            ) : (
              <>Upload & continue <ArrowRight className="w-4 h-4 ml-1.5" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
