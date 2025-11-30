import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Calendar, DollarSign, AlertCircle } from 'lucide-react';

export function FundingStatus() {
  const fundingData = useStore((state) => state.fundingData);

  const progressToGoal = (fundingData.current_funding.amount_raised / fundingData.funding_goal.target_amount) * 100;

  const getRunwayColor = (months: number) => {
    if (months >= 12) return 'text-green-600';
    if (months >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Funding Status</span>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {fundingData.current_stage}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount Raised */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Amount Raised</span>
            <span className="text-2xl font-bold text-gray-900">
              ${(fundingData.current_funding.amount_raised / 1000).toFixed(0)}k
            </span>
          </div>
          <Progress value={progressToGoal} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Target: ${(fundingData.funding_goal.target_amount / 1000000).toFixed(1)}M</span>
            <span>{progressToGoal.toFixed(1)}% of goal</span>
          </div>
        </div>

        {/* Funding Sources */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Funding Sources</h4>
          <div className="flex flex-wrap gap-2">
            {fundingData.current_funding.sources.map((source, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {source}
              </Badge>
            ))}
          </div>
          {fundingData.current_funding.last_raise_date && (
            <p className="text-xs text-gray-500 mt-2">
              Last raise: {new Date(fundingData.current_funding.last_raise_date).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <DollarSign className="w-5 h-5 mx-auto mb-1 text-gray-400" />
            <div className="text-lg font-bold text-gray-900">
              ${(fundingData.burn_rate / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-gray-500">Monthly Burn</div>
          </div>
          <div className="text-center">
            <Calendar className={`w-5 h-5 mx-auto mb-1 ${getRunwayColor(fundingData.runway_months)}`} />
            <div className={`text-lg font-bold ${getRunwayColor(fundingData.runway_months)}`}>
              {fundingData.runway_months} mo
            </div>
            <div className="text-xs text-gray-500">Runway</div>
          </div>
          <div className="text-center">
            <TrendingUp className="w-5 h-5 mx-auto mb-1 text-blue-500" />
            <div className="text-lg font-bold text-gray-900">
              {fundingData.readiness_score}%
            </div>
            <div className="text-xs text-gray-500">Readiness</div>
          </div>
        </div>

        {/* Runway Warning */}
        {fundingData.runway_months < 12 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-900">Runway Alert</p>
              <p className="text-yellow-700">
                {fundingData.runway_months < 6 
                  ? 'Critical: Less than 6 months of runway remaining. Prioritize fundraising immediately.'
                  : 'Start fundraising now to maintain healthy runway (target: 18+ months).'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
