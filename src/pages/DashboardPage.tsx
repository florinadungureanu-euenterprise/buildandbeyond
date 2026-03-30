import { useState, useEffect } from 'react';
import { ValidationWidget } from '@/components/widgets/ValidationWidget';
import { RoadmapWidget } from '@/components/widgets/RoadmapWidget';
import { MarketSignalsWidget } from '@/components/widgets/MarketSignalsWidget';
import { ToolMatchesWidget } from '@/components/widgets/ToolMatchesWidget';
import { AlertBanner } from '@/components/AlertBanner';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { MilestoneRecommendations } from '@/components/roadmap/MilestoneRecommendations';
import { ProposalOptIn } from '@/components/onboarding/ProposalOptIn';
import { LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function DashboardPage() {
  const { user } = useAuth();
  const [hasProposalRequest, setHasProposalRequest] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('proposal_requests' as any)
      .select('id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        setHasProposalRequest(!!data && data.length > 0);
      });
  }, [user]);

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
      {hasProposalRequest === false && (
        <ProposalOptIn variant="dashboard" onComplete={() => setHasProposalRequest(true)} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ValidationWidget />
        <ToolMatchesWidget />
        <RoadmapWidget />
        <MarketSignalsWidget />
      </div>
    </div>
  );
}
