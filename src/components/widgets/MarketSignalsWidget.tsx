import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const signalStyles: Record<string, { bg: string; border: string; title: string; text: string; action: string }> = {
  competitor: {
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    title: 'text-blue-900',
    text: 'text-blue-700',
    action: 'text-blue-600'
  },
  trend: {
    bg: 'bg-green-50',
    border: 'border-green-100',
    title: 'text-green-900',
    text: 'text-green-700',
    action: 'text-green-600'
  },
  regulatory: {
    bg: 'bg-gray-50',
    border: 'border-gray-100',
    title: 'text-gray-900',
    text: 'text-gray-700',
    action: 'text-gray-600'
  }
};

export function MarketSignalsWidget() {
  const signals = useStore((state) => state.signals);
  const onboardingComplete = useStore((state) => state.onboardingComplete);
  const displaySignals = signals.slice(0, 3);

  if (!onboardingComplete || signals.length === 0) {
    return (
      <Card className="p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-4">Market Signals</h3>
        <div className="text-center py-6">
          <div className="flex items-center justify-center gap-1 mb-2">
            <div className="w-2 h-2 bg-muted-foreground rounded-full" />
            <div className="text-xs text-muted-foreground">Waiting for data</div>
          </div>
          <p className="text-sm text-muted-foreground">Market signals will appear here after onboarding</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Market Signals</h3>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <div className="text-xs text-gray-600">Live</div>
        </div>
      </div>

      <div className="space-y-3">
        {displaySignals.map((signal) => {
          const styles = signalStyles[signal.type];
          return (
            <div
              key={signal.id}
              className={cn('p-3 rounded-lg border', styles.bg, styles.border)}
            >
              <div className={cn('text-sm font-medium', styles.title)}>{signal.title}</div>
              <div className={cn('text-xs mt-1', styles.text)}>{signal.message}</div>
              <div className={cn('text-xs mt-2', styles.action)}>
                → {signal.suggestedAction}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-500">Updates every 4 hours</div>
        <button type="button" className="text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
          Configure
        </button>
      </div>
    </Card>
  );
}
