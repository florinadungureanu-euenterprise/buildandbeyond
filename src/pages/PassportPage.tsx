import { PassportView } from '@/components/passport/PassportView';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Badge } from 'lucide-react';

export function PassportPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="passport"
        title="Your Startup Passport 🪪"
        description="A living profile of your venture: summary, validation, architecture, market evidence, milestones, and compliance status. Share it with incubators, partners, and investors."
        icon={<Badge className="w-12 h-12 text-primary" />}
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Startup Passport</h1>
        <p className="mt-2 text-gray-600">Your comprehensive startup profile and validation record</p>
      </div>
      <PassportView />
    </div>
  );
}
