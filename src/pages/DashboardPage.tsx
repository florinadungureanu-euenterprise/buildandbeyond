import { ValidationWidget } from '@/components/widgets/ValidationWidget';
import { RoadmapWidget } from '@/components/widgets/RoadmapWidget';
import { MarketSignalsWidget } from '@/components/widgets/MarketSignalsWidget';
import { ToolMatchesWidget } from '@/components/widgets/ToolMatchesWidget';
import { AlertBanner } from '@/components/AlertBanner';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { LayoutDashboard } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="dashboard"
        title="Your Startup Command Center 🧭"
        description="This is where you track your progress:\n\n• Validation results\n• Recommended tools\n• Key market signals\n• Your next roadmap steps\n\nEverything here updates automatically as you build."
        icon={<LayoutDashboard className="w-12 h-12 text-primary" />}
      />
      <AlertBanner />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidationWidget />
        <ToolMatchesWidget />
        <RoadmapWidget />
        <MarketSignalsWidget />
      </div>
    </div>
  );
}
