import { ValidationWidget } from '@/components/widgets/ValidationWidget';
import { RoadmapWidget } from '@/components/widgets/RoadmapWidget';
import { MarketSignalsWidget } from '@/components/widgets/MarketSignalsWidget';
import { ToolMatchesWidget } from '@/components/widgets/ToolMatchesWidget';
import { AlertBanner } from '@/components/AlertBanner';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { MilestoneRecommendations } from '@/components/roadmap/MilestoneRecommendations';
import { LayoutDashboard } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="dashboard"
        title="Your Command Center 🧭"
        description="Outcome: Always know what to focus on next.\n\nSee your validation scores, upcoming milestones, market signals, and tool recommendations in one view. Everything updates as you build."
        icon={<LayoutDashboard className="w-12 h-12 text-primary" />}
      />
      <AlertBanner />
      <MilestoneRecommendations />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidationWidget />
        <ToolMatchesWidget />
        <RoadmapWidget />
        <MarketSignalsWidget />
      </div>
    </div>
  );
}
