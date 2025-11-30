import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { formatPercent } from '@/lib/utils';
import { CheckCircle2 } from 'lucide-react';

export function ValidationWidget() {
  const validation = useStore((state) => state.validation);

  const metrics = [
    { label: 'Market Fit', value: validation.marketFit, color: 'bg-green-500' },
    { label: 'Problem Validation', value: validation.problemValidation, color: 'bg-blue-500' },
    { label: 'Solution Fit', value: validation.solutionFit, color: 'bg-yellow-500' }
  ];

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Validation Results</h3>
        <CheckCircle2 className="w-6 h-6 text-green-500" />
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`flex items-center justify-between ${
              index < metrics.length - 1 ? 'pb-3 border-b border-gray-100' : ''
            }`}
          >
            <span className="text-sm text-gray-600">{metric.label}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${metric.color} rounded-full transition-all duration-300`}
                  style={{ width: `${metric.value * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-10 text-right">
                {formatPercent(metric.value)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button type="button" className="w-full py-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
          View Full Assessment
        </button>
      </div>
    </Card>
  );
}
