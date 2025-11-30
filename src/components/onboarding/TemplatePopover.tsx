import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TemplatePopoverProps {
  template: string;
  onUse: (editedTemplate: string) => void;
}

export function TemplatePopover({ template, onUse }: TemplatePopoverProps) {
  const [editedTemplate, setEditedTemplate] = useState(template);
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(editedTemplate);
    setCopied(true);
    toast({
      description: 'Template copied to clipboard'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onUse(editedTemplate);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs justify-start"
        >
          <ChevronRight className="w-3 h-3 mr-1" />
          {template.slice(0, 50)}...
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Edit this template to fit your answer:</label>
            <Textarea
              value={editedTemplate}
              onChange={(e) => setEditedTemplate(e.target.value)}
              className="mt-2 min-h-[100px]"
              placeholder="Edit the template..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="flex-1"
            >
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
            <Button
              size="sm"
              onClick={handleUse}
              className="flex-1"
            >
              Use This Answer
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
