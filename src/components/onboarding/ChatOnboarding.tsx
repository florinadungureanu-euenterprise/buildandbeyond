import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboardingChat } from '@/hooks/useOnboardingChat';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatOnboarding() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const { messages, currentQuestion, progress, isComplete, sendMessage, useTemplate } =
    useOnboardingChat();
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

  return (
    <div className="h-full flex">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Progress Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {isComplete ? 'Complete!' : `Question ${Math.min(messages.filter(m => m.role === 'system').length, 12)} of 12`}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Onboarding progress"
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
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
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                )}
              >
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        {!isComplete ? (
          <div className="border-t border-gray-200 bg-white p-4">
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
            <div className="flex gap-2">
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
          </div>
        ) : (
          <div className="border-t border-gray-200 bg-white p-4">
            <Button onClick={() => navigate('/passport')} className="w-full" size="lg">
              Finish & Generate Passport Preview
            </Button>
          </div>
        )}
      </div>

      {/* Right Sidebar - Progress Summary */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
        <h4 className="font-semibold text-gray-900 text-sm mb-4">Your Progress</h4>
        <div className="space-y-3">
          {[
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
          ].map((step, idx) => {
            const answered = idx < messages.filter((m) => m.role === 'user').length;
            return (
              <div key={step} className="flex items-center gap-2">
                <div
                  className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                    answered
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {answered ? '✓' : idx + 1}
                </div>
                <span className={cn('text-sm', answered ? 'text-gray-900' : 'text-gray-500')}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        {isComplete && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-100 text-green-700">Complete</Badge>
            </div>
            <p className="text-xs text-green-800">
              All questions answered! Your Startup Passport is ready to preview.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
