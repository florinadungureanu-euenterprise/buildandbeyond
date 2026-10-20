export type EventFormat = 'In-person' | 'Online' | 'Hybrid';
export type EventView = 'Popular' | 'Past' | 'Upcoming';

export interface DirectoryEvent {
  id: string;
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  dateLabel?: string;
  endsAt?: string;
  country?: string;
  location: string;
  format?: EventFormat;
  topics: string[];
  url: string;
  popular?: boolean;
  timeLabel?: string;
}

export const EU_COUNTRIES = ['Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czechia', 'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'];

export function isPastEvent(event: DirectoryEvent, now = new Date()): boolean {
  if (!event.endDate && !event.endsAt) return false;
  // Keep multi-day events visible until the final day has ended.
  const end = event.endsAt ?? `${event.endDate}T23:59:59.999Z`;
  return now.getTime() > new Date(end).getTime();
}

export function filterEvents(events: DirectoryEvent[], filters: { view: EventView; country: string; format: string; topic: string }, now = new Date()): DirectoryEvent[] {
  return events.filter(event => {
    const past = isPastEvent(event, now);
    const matchesView = filters.view === 'Past' ? past : !past && (filters.view !== 'Popular' || event.popular === true);
    return matchesView && (filters.country === 'all' || event.country === filters.country)
      && (filters.format === 'all' || event.format === filters.format)
      && (filters.topic === 'all' || event.topics.includes(filters.topic));
  }).sort((a, b) => filters.view === 'Past'
    ? (b.endDate ?? '').localeCompare(a.endDate ?? '')
    : (a.startDate ?? '9999').localeCompare(b.startDate ?? '9999'));
}

export function formatEventDate(event: DirectoryEvent): string {
  if (event.dateLabel) return event.dateLabel;
  if (!event.startDate || !event.endDate) return 'Date to be announced';
  const format = (date: string) => new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
  return event.startDate === event.endDate ? format(event.startDate) : `${format(event.startDate)} – ${format(event.endDate)}`;
}