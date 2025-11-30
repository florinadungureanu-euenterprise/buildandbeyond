import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';
import { useTourSequence } from '@/hooks/useTourSequence';

interface ScreenTourProps {
  screenKey: string;
  title: string;
  description: string;
  icon?: React.ReactNode;
  buttonText?: string;
  onComplete?: () => void;
}

export function ScreenTour({ 
  screenKey, 
  title, 
  description, 
  icon,
  buttonText = "Got it!",
  onComplete 
}: ScreenTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { isSequenceActive, moveToNextTour, isCurrentScreen } = useTourSequence();

  useEffect(() => {
    if (isSequenceActive && isCurrentScreen(screenKey)) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [screenKey, isSequenceActive, isCurrentScreen]);

  const handleComplete = () => {
    setIsOpen(false);
    
    if (isSequenceActive) {
      moveToNextTour();
    }
    
    onComplete?.();
  };

  const handleSkip = () => {
    handleComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          {icon && (
            <div className="flex justify-center mb-4">
              {icon}
            </div>
          )}
          <DialogTitle className="text-center text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {description.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < description.split('\n').length - 1 && <br />}
              </span>
            ))}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleComplete} className="px-8 gap-2">
            {isSequenceActive ? 'Next' : buttonText}
            {isSequenceActive && <ChevronRight className="w-4 h-4" />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
