import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const metricColors: Record<string, string> = {
  cost_savings: 'bg-green-100 text-green-700',
  time_savings: 'bg-blue-100 text-blue-700',
  efficiency_gain: 'bg-purple-100 text-purple-700'
};

export function ToolMatchesWidget() {
  const navigate = useNavigate();
  const tools = useStore((state) => state.tools);
  const onboardingComplete = useStore((state) => state.onboardingComplete);
  const displayTools = tools.slice(0, 3);

  if (!onboardingComplete) {
    return (
      <Card className="p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Tool Matches</h3>
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">Complete onboarding to get personalized tool recommendations</p>
          <button onClick={() => navigate('/onboarding')} className="mt-3 text-sm text-primary font-medium hover:underline">Start Onboarding</button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Tool Matches</h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {tools.length} Tools
        </Badge>
      </div>

      <div className="space-y-3">
        {displayTools.map((tool) => {
          return (
            <div
              key={tool.id}
              className="flex items-start justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="flex-1">
                <div className="font-medium text-sm text-gray-900">{tool.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 mb-2">{tool.category}</div>
                <div className="flex flex-wrap gap-1.5">
                  <Badge className={cn('text-xs', metricColors.cost_savings)}>
                    💰 {tool.metrics.cost_savings}
                  </Badge>
                  <Badge className={cn('text-xs', metricColors.time_savings)}>
                    ⏱️ {tool.metrics.time_savings}
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate('/tools')}
          className="w-full py-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          Browse All Tools
        </button>
      </div>
    </Card>
  );
}
