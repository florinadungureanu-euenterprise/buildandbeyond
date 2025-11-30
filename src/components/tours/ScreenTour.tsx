import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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
  const storageKey = `tour-${screenKey}-seen`;

  useEffect(() => {
    const tourSeen = localStorage.getItem(storageKey);
    const universalTourSeen = localStorage.getItem('welcomeTourSeen');
    
    // Only show if universal tour is complete and this screen tour hasn't been seen
    if (universalTourSeen && !tourSeen) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [screenKey, storageKey]);

  const handleComplete = () => {
    setIsOpen(false);
    localStorage.setItem(storageKey, 'true');
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
          <DialogDescription className="text-center text-base pt-2 whitespace-pre-line">
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="sm:justify-center">
          <Button onClick={handleComplete} className="px-8">
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
