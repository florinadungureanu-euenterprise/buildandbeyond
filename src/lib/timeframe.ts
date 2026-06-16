export const TIMEFRAME_LABELS: Record<string, string> = {
  asap: 'As soon as possible',
  next_month: 'Within the next month',
  next_quarter: 'Within the next quarter',
  exploring: 'Just exploring',
};

export function formatTimeframe(value?: string | null): string {
  if (!value) return '';
  return (
    TIMEFRAME_LABELS[value] ||
    value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
