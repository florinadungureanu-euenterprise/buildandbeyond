import { SignalsList } from '@/components/signals/SignalsList';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { TrendingUp } from 'lucide-react';

export function SignalsPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="signals"
        title="Real-Time Market Intelligence 📈"
        description="Outcome: Spot opportunities before your competitors.\n\nLive monitoring of pricing changes, competitor moves, demand shifts, and funding patterns in your segment."
        icon={<TrendingUp className="w-12 h-12 text-primary" />}
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Market Signals</h1>
        <p className="mt-2 text-gray-600">Real-time insights and trends in your market</p>
      </div>
      <SignalsList />
    </div>
  );
}
