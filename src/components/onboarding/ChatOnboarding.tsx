import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingChat } from '@/hooks/useOnboardingChat';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, ChevronRight, Upload, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

  const handleTemplateClick = (template: string) => {
    useTemplate(template);
    if (currentQuestion) {
      updateUserInput(currentQuestion.key, template);
    }
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

  const questionLabels = [
    'Startup Stage',
    'Problem Definition',
    'Target Customer',
    'Value Proposition',
    'Business Model',
    'Market Size',
    'Competitors',
    'Competitive Advantage',
    'Traction',
    'Key Metrics',
    'GTM Strategy',
    'Funding Needs',
    '12-Month Vision'
  ];

  // Filter labels based on stage
  const getVisibleLabels = () => {
    if (!startupStage) return ['Startup Stage'];
    
    if (startupStage === 'later') {
      // Skip early-stage only questions
      return questionLabels.filter((_, idx) => 
        idx === 0 || // Stage
        idx === 4 || // Business Model
        idx === 5 || // Market Size
        idx === 6 || // Competitors
        idx === 7 || // Advantage
        idx === 8 || // Traction
        idx === 9 || // Metrics
        idx === 10 || // GTM
        idx === 11 || // Funding
        idx === 12 // Vision
      );
    }
    
    return questionLabels.filter((_, idx) => idx !== 9); // Skip Key Metrics for early stage
  };

  const visibleLabels = getVisibleLabels();

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
              <div className="mb-3 flex flex-wrap gap-2">
                {currentQuestion.templates.map((template, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleTemplateClick(template)}
                    className="text-xs"
                  >
                    <ChevronRight className="w-3 h-3 mr-1" />
                    {template.slice(0, 50)}...
                  </Button>
                ))}
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
            <Button onClick={() => navigate('/passport')} className="w-full" size="lg">
              Finish & Generate Passport Preview
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Progress Summary */}
      <div className="w-80 bg-muted/30 border-l border-border p-6 overflow-y-auto">
        <h4 className="font-semibold text-foreground text-sm mb-4">
          {!startupStage ? 'Stage Detection' : startupStage === 'early' ? 'Early-Stage Discovery' : 'Growth Assessment'}
        </h4>
        
        {!startupStage ? (
          <div className="text-sm text-muted-foreground">
            <p className="mb-3">We'll adapt the onboarding based on your stage:</p>
            <div className="space-y-3">
              <div className="p-3 bg-card border border-border rounded-lg">
                <p className="font-medium text-foreground mb-1">🌱 Early Stage</p>
                <p className="text-xs">Idea → MVP → Early Customers</p>
                <p className="text-xs text-muted-foreground mt-1">Focus: Customer discovery, problem validation, experiments</p>
              </div>
              <div className="p-3 bg-card border border-border rounded-lg">
                <p className="font-medium text-foreground mb-1">🚀 Growth Stage</p>
                <p className="text-xs">Growing → Scale-up → Established</p>
                <p className="text-xs text-muted-foreground mt-1">Focus: Operations, systems, scaling challenges</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {startupStage === 'early' ? (
              <>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Customer Discovery:</p>
                  <div className="space-y-1 pl-2">
                    <p>✓ Customer definition</p>
                    <p>✓ Problem validation</p>
                    <p>✓ Existing alternatives</p>
                    <p>✓ Jobs to be done</p>
                  </div>
                  
                  <p className="font-medium text-foreground mt-3">Solution & Validation:</p>
                  <div className="space-y-1 pl-2">
                    <p>✓ Proposed solution</p>
                    <p>✓ Value proposition</p>
                    <p>✓ Unfair advantage</p>
                    <p>✓ Riskiest assumption</p>
                    <p>✓ Test method</p>
                  </div>
                  
                  <p className="font-medium text-foreground mt-3">Business Model:</p>
                  <div className="space-y-1 pl-2">
                    <p>✓ Revenue model</p>
                    <p>✓ Distribution channels</p>
                    <p>✓ Key metrics</p>
                    <p>✓ 12-week goal</p>
                    <p>✓ Risks</p>
                    <p>✓ Fundraising plans</p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p className="font-medium text-foreground">Operational Focus:</p>
                  <div className="space-y-1 pl-2">
                    <p>✓ Current priorities</p>
                    <p>✓ Bottlenecks</p>
                    <p>✓ Goals (Q/Y)</p>
                    <p>✓ Systems & tools</p>
                    <p>✓ Process gaps</p>
                    <p>✓ Metrics tracked</p>
                    <p>✓ Risks & compliance</p>
                    <p>✓ Long-term vision</p>
                    <p>✓ Fundraising plans</p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {uploadedDocuments.length > 0 && (
          <div className="mt-6 p-4 bg-card border border-border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {uploadedDocuments.length} Document{uploadedDocuments.length > 1 ? 's' : ''} Uploaded
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Your documents will help us pre-fill information
            </p>
          </div>
        )}

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
