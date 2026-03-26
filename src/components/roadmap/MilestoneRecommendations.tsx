import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, FileText, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Recommendation {
  type: 'tool' | 'application' | 'connection';
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
}

function getRecommendationsForMilestone(
  milestoneTitle: string,
  category: string
): Recommendation[] {
  const recs: Recommendation[] = [];

  if (category === 'product') {
    recs.push(
      { type: 'tool', title: 'Explore development tools', description: 'AI-powered dev platforms matched to your build phase', link: '/tools', icon: <Zap className="w-4 h-4" /> },
      { type: 'application', title: 'Apply to relevant programmes', description: 'Accelerators and grants that support product milestones', link: '/applications', icon: <FileText className="w-4 h-4" /> }
    );
  }
  if (category === 'market') {
    recs.push(
      { type: 'tool', title: 'Marketing & analytics tools', description: 'Tools for user acquisition, analytics, and market research', link: '/tools', icon: <Zap className="w-4 h-4" /> },
      { type: 'connection', title: 'Connect with growth founders', description: 'Founders who have scaled in your industry', link: '/community', icon: <Users className="w-4 h-4" /> }
    );
  }
  if (category === 'funding') {
    recs.push(
      { type: 'application', title: 'Funding opportunities', description: 'Grants, investors, and programmes matched to your stage', link: '/fundraising', icon: <FileText className="w-4 h-4" /> },
      { type: 'connection', title: 'Investor introductions', description: 'Get matched with investors in your sector and geography', link: '/community', icon: <Users className="w-4 h-4" /> }
    );
  }
  if (category === 'team') {
    recs.push(
      { type: 'connection', title: 'Find co-founders & talent', description: 'Browse founder matches with complementary skills', link: '/community', icon: <Users className="w-4 h-4" /> },
      { type: 'tool', title: 'HR & team tools', description: 'Hiring platforms and team management solutions', link: '/tools', icon: <Zap className="w-4 h-4" /> }
    );
  }

  return recs;
}

export function MilestoneRecommendations() {
  const milestones = useStore((s) => s.twelveMonthMilestones);
  const navigate = useNavigate();

  // Find recently completed milestones (last completed ones)
  const completedMilestones = milestones.filter((m) => m.completed);
  const recentCompleted = completedMilestones.slice(-2);

  // Find next upcoming milestones
  const upcoming = milestones.filter((m) => !m.completed).slice(0, 2);

  const milestonesToShow = [...recentCompleted, ...upcoming].slice(0, 3);

  if (milestonesToShow.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Smart Recommendations</h3>
        <Badge variant="secondary" className="text-xs">AI-Triggered</Badge>
      </div>

      <div className="space-y-4">
        {milestonesToShow.map((milestone) => {
          const recs = getRecommendationsForMilestone(milestone.title, milestone.category);
          return (
            <div key={milestone.id} className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={milestone.completed ? 'default' : 'outline'} className="text-xs">
                  {milestone.completed ? 'Completed' : 'Upcoming'}
                </Badge>
                <span className="text-sm font-medium text-foreground">{milestone.title}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-2">
                {recs.map((rec, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(rec.link)}
                    className="flex items-start gap-2 p-2.5 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
                  >
                    <div className="mt-0.5 text-primary">{rec.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">{rec.title}</p>
                      <p className="text-xs text-muted-foreground">{rec.description}</p>
                    </div>
                    <ArrowRight className="w-3 h-3 text-muted-foreground group-hover:text-primary mt-1 transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
