import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, string> = {
  product: 'bg-blue-100 text-blue-700 border-blue-200',
  market: 'bg-green-100 text-green-700 border-green-200',
  team: 'bg-purple-100 text-purple-700 border-purple-200',
  funding: 'bg-orange-100 text-orange-700 border-orange-200'
};

export function RoadmapBoard12Month() {
  const milestones = useStore((state) => state.twelveMonthMilestones);
  const toggleMilestone = useStore((state) => state.toggleMilestone);

  const completedCount = milestones.filter((m) => m.completed).length;
  const completionPercentage = (completedCount / milestones.length) * 100;

  // Group milestones by quarter
  const getQuarter = (dateString: string) => {
    const month = new Date(dateString).getMonth() + 1;
    if (month <= 3) return 'Q1 2025';
    if (month <= 6) return 'Q2 2025';
    if (month <= 9) return 'Q3 2025';
    return 'Q4 2025';
  };

  const quarters = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
  const milestonesByQuarter = quarters.map((quarter) => ({
    quarter,
    milestones: milestones.filter((m) => getQuarter(m.targetDate) === quarter)
  }));

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-foreground">12-Month Roadmap</h1>
          <span className="text-sm text-muted-foreground">
            {completedCount} of {milestones.length} completed
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">
          Strategic milestones and key deliverables for the year
        </p>
      </div>

      <div className="space-y-6">
        {milestonesByQuarter.map(({ quarter, milestones: quarterMilestones }) => (
          <Card key={quarter} className="p-6 border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">{quarter}</h2>
              <span className="text-sm text-muted-foreground">
                {quarterMilestones.filter((m) => m.completed).length} / {quarterMilestones.length} completed
              </span>
            </div>

            <div className="space-y-3">
              {quarterMilestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={cn(
                    'p-4 rounded-lg border border-border cursor-pointer transition-all hover:shadow-md bg-card',
                    milestone.completed && 'opacity-75'
                  )}
                  onClick={() => toggleMilestone(milestone.id)}
                >
                  <div className="flex items-start gap-3">
                    {milestone.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3
                          className={cn(
                            'font-medium text-foreground',
                            milestone.completed && 'line-through text-muted-foreground'
                          )}
                        >
                          {milestone.title}
                        </h3>
                        <Badge className={cn('text-xs font-medium capitalize flex-shrink-0', categoryColors[milestone.category])}>
                          {milestone.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                        {milestone.completed && <span className="text-green-600 font-medium">✓ Completed</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
