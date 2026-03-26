import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Circle } from 'lucide-react';

export function RoadmapWidget() {
  const navigate = useNavigate();
  const milestones = useStore((state) => state.twelveMonthMilestones);
  const onboardingComplete = useStore((state) => state.onboardingComplete);

  if (!onboardingComplete || milestones.length === 0) {
    return (
      <Card className="shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Roadmap</h3>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">Your personalized roadmap will be generated after onboarding</p>
            <Button variant="outline" className="mt-3" onClick={() => navigate('/onboarding')}>
              Start Onboarding
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Get next 3 months of milestones
  const now = new Date();
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
  
  const upcomingMilestones = milestones.filter((m) => {
    const targetDate = new Date(m.targetDate);
    return targetDate >= now && targetDate <= threeMonthsLater;
  });

  const completedUpcoming = upcomingMilestones.filter((m) => m.completed).length;
  const totalUpcoming = upcomingMilestones.length;
  const upcomingProgress = totalUpcoming > 0 ? (completedUpcoming / totalUpcoming) * 100 : 0;

  const overallComplete = milestones.filter((m) => m.completed).length;
  const overallTotal = milestones.length;
  const overallProgress = (overallComplete / overallTotal) * 100;

  return (
    <Card className="shadow-sm">
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">Roadmap</h3>
          <div className="text-xs text-muted-foreground">Auto-updated</div>
        </div>
      </div>

      <CardContent>
        <div className="space-y-4">
          {/* Next 3 Months */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Next 3 Months</span>
              <span className="text-xs text-muted-foreground">
                {completedUpcoming}/{totalUpcoming}
              </span>
            </div>
            <Progress value={upcomingProgress} className="h-2 mb-2" />
            <div className="space-y-1">
              {upcomingMilestones
                .filter((m) => !m.completed)
                .slice(0, 2)
                .map((milestone) => (
                  <div key={milestone.id} className="text-xs text-muted-foreground flex items-center gap-1">
                    <Circle className="w-3 h-3" />
                    {milestone.title}
                  </div>
                ))}
            </div>
          </div>

          {/* 12 Month Overview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">12-Month Progress</span>
              <span className="text-xs text-muted-foreground">
                {overallComplete}/{overallTotal}
              </span>
            </div>
            <Progress value={overallProgress} className="h-2 mb-2" />
            <p className="text-xs text-muted-foreground">
              {milestones.filter((m) => !m.completed).length} milestones remaining this year
            </p>
          </div>

          <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/roadmap')}>
            View 12-Month Roadmap
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
