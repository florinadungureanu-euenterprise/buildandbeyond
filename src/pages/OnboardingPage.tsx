import { ChatOnboarding } from '@/components/onboarding/ChatOnboarding';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { MessageCircle } from 'lucide-react';

export function OnboardingPage() {
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
