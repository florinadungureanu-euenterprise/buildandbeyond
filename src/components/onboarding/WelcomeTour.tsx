import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles, LayoutDashboard } from 'lucide-react';

const TOUR_SEEN_KEY = 'welcomeTourSeen';

export function WelcomeTour() {
  const [step, setStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user has seen the tour
    const tourSeen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!tourSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (step === 0) {
      // Navigate to whisperer and show next step
      navigate('/whisperer');
      setStep(1);
    } else if (step === 1) {
      // Navigate to dashboard and close
      navigate('/');
      handleClose();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
  };

  const handleSkip = () => {
    handleClose();
  };

  const tourSteps = [
    {
      title: "Welcome to Build & Beyond! 🎉",
      description: "Let's start by understanding your startup journey. Your Entrepreneur Whisperer will ask you some questions to build your personalized roadmap.",
      icon: <Sparkles className="w-12 h-12 text-primary" />,
      action: "Start Your Journey",
      route: "/whisperer"
    },
    {
      title: "Your Dashboard Awaits",
      description: "Once you complete your profile, come back here to see your personalized dashboard with insights, recommendations, and next steps.",
      icon: <LayoutDashboard className="w-12 h-12 text-primary" />,
      action: "Go to Dashboard",
      route: "/"
    }
  ];

  const currentStep = tourSteps[step];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {currentStep.icon}
          </div>
          <DialogTitle className="text-center text-2xl">{currentStep.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {currentStep.description}
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <Button variant="ghost" onClick={handleSkip} className="order-2 sm:order-1">
            Skip Tour
          </Button>
          <Button onClick={handleNext} className="order-1 sm:order-2 gap-2">
            {currentStep.action}
            <ChevronRight className="w-4 h-4" />
          </Button>
        </DialogFooter>
        
        <div className="flex justify-center gap-2 mt-4">
          {tourSteps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 w-2 rounded-full transition-colors ${
                idx === step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
