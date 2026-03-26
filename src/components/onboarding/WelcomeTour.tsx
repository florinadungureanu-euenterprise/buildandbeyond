import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';
import { useTourSequence } from '@/hooks/useTourSequence';
import { useStore } from '@/store';

const TOUR_SEEN_KEY = 'welcomeTourSeen';

export function WelcomeTour() {
  const [isOpen, setIsOpen] = useState(false);
  const { startTourSequence } = useTourSequence();

  useEffect(() => {
    const tourSeen = localStorage.getItem(TOUR_SEEN_KEY);
    if (!tourSeen) {
      setIsOpen(true);
    }
  }, []);

  const handleNext = () => {
    handleClose();
    startTourSequence();
  };

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
  };

  const handleSkip = () => {
    handleClose();
    // Reset example data since they skipped the tour
    resetExampleData();
  };

  const tourContent = {
    title: "Welcome to Build & Beyond 🚀",
    description: "Your workspace for turning ideas, projects, or organizations into momentum.\n\nWe'll show you example data during this tour so you can see what the platform looks like in action. After the tour, sections will reset and get populated with your real data as you go through onboarding.\n\nLet's take a quick look at each section.",
    icon: <Sparkles className="w-12 h-12 text-primary" />,
    action: "Start Tour"
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {tourContent.icon}
          </div>
          <DialogTitle className="text-center text-2xl">{tourContent.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {tourContent.description.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < tourContent.description.split('\n').length - 1 && <br />}
              </span>
            ))}
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

function resetExampleData() {
  const store = useStore.getState();
  // Only reset if onboarding hasn't been completed
  if (!store.onboardingComplete) {
    store.setValidation({ marketFit: 0, problemValidation: 0, solutionFit: 0 });
    store.setMilestones([]);
    store.setSignals([]);
    store.updatePassport({
      founderName: '', startupName: '', tagline: '', summary: '',
      validationSummary: '', competitorSnapshot: [], marketData: [],
      roadmapSnapshot: '', complianceFlags: [], fundingReadiness: [],
    });
  }
}
