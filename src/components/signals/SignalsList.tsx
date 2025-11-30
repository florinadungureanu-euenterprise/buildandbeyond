import { useState } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { timeAgo, cn } from '@/lib/utils';
import { Activity, TrendingUp, AlertTriangle, FileText } from 'lucide-react';

const signalIcons = {
  competitor: TrendingUp,
  trend: Activity,
  regulatory: FileText
};

const signalStyles: Record<string, { bg: string; border: string; title: string; text: string }> = {
  competitor: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    title: 'text-blue-900',
    text: 'text-blue-700'
  },
  trend: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    title: 'text-green-900',
    text: 'text-green-700'
  },
  regulatory: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    title: 'text-amber-900',
    text: 'text-amber-700'
  }
};

const priorityColors: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-700'
};

export function SignalsList() {
  const signals = useStore((state) => state.signals);
  const [selectedType, setSelectedType] = useState<string>('all');

  const types = ['all', 'competitor', 'trend', 'regulatory'];

  const filteredSignals =
    selectedType === 'all' ? signals : signals.filter((s) => s.type === selectedType);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Market Signals</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Live Updates</span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Real-time market intelligence and competitive insights
        </p>
      </div>

      {/* Auto-refresh Banner */}
      <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Automatic updates every 4 hours
            </span>
          </div>
          <Button variant="outline" size="sm">
            Configure Settings
          </Button>
        </div>
      </Card>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.map((signal) => {
          const styles = signalStyles[signal.type];
          const Icon = signalIcons[signal.type];

          return (
            <Card key={signal.id} className={cn('p-6 border-l-4', styles.bg, styles.border)}>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', styles.bg)}>
                    <Icon className={cn('w-5 h-5', styles.title)} />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className={cn('text-lg font-semibold mb-1', styles.title)}>
                        {signal.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize text-xs">
                          {signal.type}
                        </Badge>
                        <Badge className={cn('text-xs', priorityColors[signal.priority])}>
                          {signal.priority} priority
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {timeAgo(signal.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className={cn('text-sm mb-3', styles.text)}>{signal.message}</p>
                  <div className={cn('flex items-center gap-2 text-sm font-medium', styles.title)}>
                    <AlertTriangle className="w-4 h-4" />
                    <span>Suggested Action: {signal.suggestedAction}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {filteredSignals.length === 0 && (
        <Card className="p-12 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No signals found for the selected filter</p>
        </Card>
      )}
    </div>
  );
}
