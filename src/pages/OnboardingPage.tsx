import { useState } from 'react';
import { ChatOnboarding } from '@/components/onboarding/ChatOnboarding';
import { OnboardingPathSelector } from '@/components/onboarding/OnboardingPathSelector';
import { FounderIntakeForm } from '@/components/onboarding/FounderIntakeForm';
import { DocumentUploadOnboarding } from '@/components/onboarding/DocumentUploadOnboarding';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { MessageCircle } from 'lucide-react';

type OnboardingPath = 'chat' | 'form' | 'upload' | null;

export function OnboardingPage() {
  const [selectedPath, setSelectedPath] = useState<OnboardingPath>(null);

  const handlePathSelect = (path: OnboardingPath) => {
    setSelectedPath(path);
  };

  const handleBack = () => setSelectedPath(null);

  if (!selectedPath) {
    return <OnboardingPathSelector onSelect={handlePathSelect} />;
  }

  if (selectedPath === 'form') {
    return <FounderIntakeForm onBack={handleBack} />;
  }

  if (selectedPath === 'upload') {
    return <DocumentUploadOnboarding onBack={handleBack} />;
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
