import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';

const TOUR_SEEN_KEY = 'welcomeTourSeen';

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen the tour
    const tourSeen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!tourSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    // Navigate to whisperer and close
    navigate('/whisperer');
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
  };

  const handleSkip = () => {
    handleClose();
  };

  const tourContent = {
    title: "Welcome to Build & Beyond 🚀",
    description: "Your workspace for turning ideas, projects, or organizations into momentum.\n\nHere, you'll get a tailored roadmap, live market insights, tool recommendations, and a Passport that grows with you.\n\nLet's show you around.",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    action: "Start Your Journey"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {tourContent.icon}
          </div>
          <DialogTitle className="text-center text-2xl">{tourContent.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2 whitespace-pre-line">
            {tourContent.description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="ghost" onClick={handleSkip} className="order-2 sm:order-1">
            Skip
          </Button>
          <Button onClick={handleNext} className="order-1 sm:order-2 gap-2">
            {tourContent.action}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
