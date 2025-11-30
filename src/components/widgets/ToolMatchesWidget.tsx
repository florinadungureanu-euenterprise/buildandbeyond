import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const commissionColors: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-purple-100 text-purple-700'
};

function getCommissionLevel(commission: number): string {
  if (commission >= 12) return 'high';
  if (commission >= 9) return 'medium';
  return 'low';
}

export function ToolMatchesWidget() {
  const navigate = useNavigate();
  const tools = useStore((state) => state.tools);
  const displayTools = tools.slice(0, 3);

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Tool Matches</h3>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {tools.length} Tools
        </Badge>
      </div>

      <div className="space-y-3">
        {displayTools.map((tool) => {
          const level = getCommissionLevel(tool.commission);
          return (
            <div
              key={tool.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div>
                <div className="font-medium text-sm text-gray-900">{tool.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">{tool.category}</div>
              </div>
              <Badge className={cn('text-xs font-semibold', commissionColors[level])}>
                +{tool.commission}% Commission
              </Badge>
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
