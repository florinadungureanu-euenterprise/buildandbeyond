import { AlertBanner } from '@/components/AlertBanner';
import { ValidationWidget } from '@/components/widgets/ValidationWidget';
import { ToolMatchesWidget } from '@/components/widgets/ToolMatchesWidget';
import { RoadmapWidget } from '@/components/widgets/RoadmapWidget';
import { MarketSignalsWidget } from '@/components/widgets/MarketSignalsWidget';

export function DashboardPage() {
  return (
    <div>
      <AlertBanner />
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidationWidget />
        <ToolMatchesWidget />
        <RoadmapWidget />
        <MarketSignalsWidget />
      </div>
    </div>
  );
}
