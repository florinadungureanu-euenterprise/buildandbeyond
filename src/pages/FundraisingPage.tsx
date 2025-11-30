import { FundingStatus } from '@/components/fundraising/FundingStatus';
import { FundingRoutes } from '@/components/fundraising/FundingRoutes';
import { FundingGoals } from '@/components/fundraising/FundingGoals';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { DollarSign } from 'lucide-react';

export function FundraisingPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="fundraising"
        title="Fundraising Hub 💰"
        description="Your complete fundraising command center:\n\n• Current funding status\n• Funding goals & timeline\n• Public & private funding routes\n• Grant opportunities\n• Investor connections\n\nTrack your path to capital and choose the best route for your stage."
        icon={<DollarSign className="w-12 h-12 text-primary" />}
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Fundraising</h1>
        <p className="mt-2 text-gray-600">Manage your funding strategy, track progress, and explore funding routes</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FundingStatus />
          <FundingRoutes />
        </div>
        <div>
          <FundingGoals />
        </div>
      </div>
    </div>
  );
}
