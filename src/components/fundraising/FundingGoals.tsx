import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function FundingGoals() {
  const fundingData = useStore((state) => state.fundingData);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <Circle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Funding Goal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Target className="w-5 h-5 text-blue-600" />
            Funding Goal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <div className="text-3xl font-bold text-gray-900">
              ${(fundingData.funding_goal.target_amount / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-gray-500 mt-1">Target Amount</div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Target: {new Date(fundingData.funding_goal.target_date).toLocaleDateString()}</span>
          </div>

          <div>
            <p className="text-sm text-gray-700 mb-3">{fundingData.funding_goal.purpose}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Use of Funds</h4>
            <div className="space-y-3">
              {fundingData.funding_goal.use_of_funds.map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{item.category}</span>
                    <span className="text-xs font-bold text-gray-900">{item.percentage}%</span>
                  </div>
                  <Progress value={item.percentage} className="h-2 mb-1" />
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funding Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funding Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fundingData.funding_milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  'p-3 rounded-lg border transition-all',
                  milestone.status === 'completed' ? 'bg-green-50 border-green-200' :
                  milestone.status === 'in-progress' ? 'bg-blue-50 border-blue-200' :
                  'bg-white border-gray-200'
                )}
              >
                <div className="flex items-start gap-2">
                  {getStatusIcon(milestone.status)}
                  <div className="flex-1 min-w-0">
                    <h5 className={cn(
                      'font-medium text-sm',
                      milestone.status === 'completed' ? 'text-gray-600 line-through' : 'text-gray-900'
                    )}>
                      {milestone.title}
                    </h5>
                    <p className="text-xs text-gray-600 mt-1">{milestone.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={cn('text-xs', getStatusColor(milestone.status))}>
                        {milestone.status.replace('-', ' ')}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {new Date(milestone.target_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
