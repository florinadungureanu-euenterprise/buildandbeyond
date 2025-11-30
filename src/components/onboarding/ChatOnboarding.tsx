import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingChat } from '@/hooks/useOnboardingChat';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Upload, X, FileText, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TemplatePopover } from './TemplatePopover';

// Simple markdown parser for chat messages
const parseMarkdown = (text: string) => {
  const lines = text.split('\n');
  
  return lines.map((line, lineIdx) => {
    // Handle bold text (**text**)
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const elements = parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={idx}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
    
    return (
      <span key={lineIdx}>
        {elements}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
};

export function ChatOnboarding() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  const { 
    messages, 
    currentQuestion, 
    progress, 
    isComplete, 
    sendMessage, 
    useTemplate,
    uploadDocument,
    removeDocument,
    uploadedDocuments,
    startupStage,
    totalQuestions
  } = useOnboardingChat();
  
  const updateUserInput = useStore((state) => state.updateUserInput);

  const handleSend = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      if (currentQuestion) {
        updateUserInput(currentQuestion.key, inputValue);
      }
      setInputValue('');
    }
  };

  const handleTemplateUse = (template: string) => {
    // Populate the input field instead of sending immediately
    setInputValue(template);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload a file smaller than 5MB',
        variant: 'destructive'
      });
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a PDF, Word document, or text file',
        variant: 'destructive'
      });
      return;
    }

    try {
      await uploadDocument(file);
      toast({
        title: 'Document uploaded',
        description: `${file.name} has been uploaded successfully`
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload document. Please try again.',
        variant: 'destructive'
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Get all questions to show in tracker
  const getAllQuestionLabels = () => {
    if (!startupStage) return ['Startup Stage'];
    
    const allQuestions = [];
    
    if (startupStage === 'early') {
      allQuestions.push(
        'Startup Stage',
        'Customer',
        'Problem',
        'Consequences',
        'Alternatives',
        'Jobs to be Done',
        'Solution',
        'Unique Value',
        'Unfair Advantage',
        'Riskiest Assumption',
        'Test Method',
        'Business Model',
        'Channels',
        'Key Metrics',
        '12-Week Goal',
        'Risks',
        'Fundraising Type',
        'Fundraising Amount',
        'Industry',
        'Region'
      );
    } else {
      allQuestions.push(
        'Startup Stage',
        'Main Focus',
        'Bottlenecks',
        'Goals',
        'Systems & Tools',
        'Process Gaps',
        'Metrics',
        'Risks',
        'Vision',
        'Fundraising Type',
        'Fundraising Amount',
        'Customer & Problem',
        'UVP & Advantage',
        'Revenue Model',
        'Industry',
        'Region'
      );
    }
    
    return allQuestions;
  };

  const getAnsweredQuestions = () => {
    return messages.filter(m => m.role === 'user').length;
  };

  const questionLabels = getAllQuestionLabels();
  const answeredCount = getAnsweredQuestions();

  return (
    <div className="h-full flex">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Progress Bar */}
        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">
              {isComplete ? 'Complete!' : `Question ${Math.min(messages.filter(m => m.role === 'user').length + 1, totalQuestions)} of ${totalQuestions}`}
            </span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div
            className="w-full h-2 bg-muted rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Onboarding progress"
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
            {startupStage && (
              <Badge variant="outline" className="text-xs">
                {startupStage === 'early' ? '🌱 Early Stage Path' : '🚀 Growth Stage Path'}
              </Badge>
            )}
            {uploadedDocuments.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                📄 {uploadedDocuments.length} doc{uploadedDocuments.length > 1 ? 's' : ''} uploaded
              </Badge>
            )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-xl px-4 py-3 rounded-lg',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{parseMarkdown(message.content)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        {!isComplete ? (
          <div className="border-t border-border bg-card p-4">
            {/* Uploaded Documents */}
            {uploadedDocuments.length > 0 && (
              <div className="mb-3 space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-2 bg-muted rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <span className="text-xs text-foreground">{doc.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(doc.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeDocument(doc.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Templates */}
            {currentQuestion && currentQuestion.templates.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">Use a template to get started (you can edit it):</p>
                <div className="flex flex-wrap gap-2">
                  {currentQuestion.templates.map((template, idx) => (
                    <TemplatePopover
                      key={idx}
                      template={template}
                      onUse={handleTemplateUse}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0"
                title="Upload document"
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer or use a template..."
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!inputValue.trim()} aria-label="Send message">
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              You can upload pitch decks, business plans, or other documents (PDF, Word, PPT - max 5MB)
            </p>
          </div>
        ) : (
          <div className="border-t border-border bg-card p-4">
            <Button onClick={() => navigate('/')} className="w-full" size="lg">
              View Your Dashboard
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Question Tracker */}
      <div className="w-80 bg-muted/30 border-l border-border p-6 overflow-y-auto">
        <h4 className="font-semibold text-foreground text-sm mb-2">
          Your Progress
        </h4>
        <p className="text-xs text-muted-foreground mb-4">
          Questions we need answers to
        </p>
        
        {uploadedDocuments.length > 0 && (
          <div className="mb-4 p-3 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">
                {uploadedDocuments.length} Document{uploadedDocuments.length > 1 ? 's' : ''} Uploaded
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {uploadedDocuments.map(doc => doc.name).join(', ')}
            </p>
          </div>
        )}
        
        <div className="space-y-2">
          {questionLabels.map((label, idx) => {
            const isAnswered = idx < answeredCount;
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2 p-2 rounded text-xs transition-colors",
                  isAnswered ? "bg-green-50 dark:bg-green-900/20" : "bg-card"
                )}
              >
                <div className={cn(
                  "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                  isAnswered 
                    ? "bg-green-500 text-white" 
                    : "bg-muted text-muted-foreground border border-border"
                )}>
                  {isAnswered ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <span className="text-[10px]">{idx + 1}</span>
                  )}
                </div>
                <span className={cn(
                  "flex-1",
                  isAnswered 
                    ? "text-green-700 dark:text-green-300 font-medium" 
                    : "text-muted-foreground"
                )}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                Complete
              </Badge>
            </div>
            <p className="text-xs text-green-800 dark:text-green-300">
              All questions answered! Your Startup Passport is ready to preview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
