import { useState } from 'react';
import { ChatOnboarding } from '@/components/onboarding/ChatOnboarding';
import { OnboardingPathSelector } from '@/components/onboarding/OnboardingPathSelector';
import { FounderIntakeForm } from '@/components/onboarding/FounderIntakeForm';
import { IntegrationsPanel } from '@/components/onboarding/IntegrationsPanel';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';

type OnboardingPath = 'chat' | 'form' | 'upload' | null;
type OnboardingStep = 'path' | 'integrations' | 'main';

export function OnboardingPage() {
  const [selectedPath, setSelectedPath] = useState<OnboardingPath>(null);
  const [step, setStep] = useState<OnboardingStep>('path');

  const handlePathSelect = (path: OnboardingPath) => {
    setSelectedPath(path);
    setStep('integrations');
  };

  const handleIntegrationsComplete = () => {
    setStep('main');
  };

  if (step === 'path' || !selectedPath) {
    return <OnboardingPathSelector onSelect={handlePathSelect} />;
  }

  if (step === 'integrations') {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-6">
        <Card className="w-full max-w-3xl p-8">
          <IntegrationsPanel onComplete={handleIntegrationsComplete} />
        </Card>
      </div>
    );
  }

  if (selectedPath === 'form') {
    return <FounderIntakeForm onBack={() => setStep('path')} />;
  }

  return (
    <>
      <ScreenTour
        screenKey="whisperer"
        title="Your Entrepreneur Whisperer 💬"
        description="This is your personal AI advisor that helps you refine your idea, plan your roadmap, and make better decisions. Ask questions, get strategic guidance, and let it learn about your venture through natural conversation."
        icon={<MessageCircle className="w-12 h-12 text-primary" />}
      />
      <ChatOnboarding />
    </>
  );
}
