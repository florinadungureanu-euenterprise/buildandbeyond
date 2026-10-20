import { useEffect, useState } from 'react';
import { ArrowUpRight, Calendar, ChevronDown, Globe, MapPin, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { eventCatalog } from '@/lib/event-catalog';
import { EU_COUNTRIES, filterEvents, formatEventDate, type EventView } from '@/lib/events';

const INITIAL_VISIBLE = 5;
const MORE_VISIBLE = 10;

export function EventDirectory() {
  const [view, setView] = useState<EventView>('Upcoming');
  const [country, setCountry] = useState('all');
  const [format, setFormat] = useState('all');
  const [topic, setTopic] = useState('all');
  const [visible, setVisible] = useState(INITIAL_VISIBLE);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => { setVisible(INITIAL_VISIBLE); }, [view, country, format, topic]);
  const topics = [...new Set(eventCatalog.flatMap(event => event.topics))].sort();
  const events = filterEvents(eventCatalog, { view, country, format, topic }, now);
  const shown = events.slice(0, visible);
  const reset = () => { setCountry('all'); setFormat('all'); setTopic('all'); };

  return (
    <div className="space-y-6" aria-label="Event directory">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Event timing">
        {(['Popular', 'Upcoming', 'Past'] as EventView[]).map(value => (
          <Button key={value} variant={view === value ? 'default' : 'outline'} size="sm" aria-pressed={view === value} onClick={() => setView(value)}>{value}</Button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2"><Label htmlFor="event-country">Location</Label><Select value={country} onValueChange={setCountry}><SelectTrigger id="event-country" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All EU countries</SelectItem>{EU_COUNTRIES.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="event-format">Types</Label><Select value={format} onValueChange={setFormat}><SelectTrigger id="event-format" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All formats</SelectItem>{['In-person', 'Online', 'Hybrid'].map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label htmlFor="event-topic">Topic / industry</Label><Select value={topic} onValueChange={setTopic}><SelectTrigger id="event-topic" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All industries</SelectItem>{topics.map(value => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground" aria-live="polite">Showing {shown.length} of {events.length} {events.length === 1 ? 'event' : 'events'}</p>{(country !== 'all' || format !== 'all' || topic !== 'all') && <Button variant="ghost" size="sm" onClick={reset}><RotateCcw className="h-4 w-4" /> Reset filters</Button>}</div>
      <div className="divide-y divide-border border-y border-border">
        {shown.map(event => (
          <article key={event.id} className="grid gap-5 py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0 space-y-2"><div className="flex flex-wrap gap-2"><Badge variant="secondary">{event.format ?? 'Format pending'}</Badge>{event.topics.map(value => <Badge key={value} variant="outline">{value}</Badge>)}</div><h3 className="break-words font-heading text-lg font-semibold text-foreground">{event.title}</h3><p className="text-sm leading-6 text-muted-foreground">{event.description}</p></div>
            <div className="min-w-0 space-y-2 text-sm text-muted-foreground"><p className="flex items-start gap-2"><Calendar className="mt-0.5 h-4 w-4 shrink-0" /><span>{formatEventDate(event)}{event.timeLabel && <span className="block">{event.timeLabel}</span>}</span></p><p className="flex items-start gap-2">{event.format === 'Online' ? <Globe className="mt-0.5 h-4 w-4 shrink-0" /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0" />}<span>{event.location}</span></p></div>
            <Button asChild variant="outline" size="sm" className="justify-self-start"><a href={event.url} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${event.title} website`}>Website <ArrowUpRight className="h-4 w-4" /></a></Button>
          </article>
        ))}
        {events.length === 0 && <div className="py-12 text-center"><h3 className="font-heading font-semibold">No matching events</h3><p className="mt-2 text-sm text-muted-foreground">No events match these selections.</p><Button variant="outline" className="mt-4" onClick={reset}><RotateCcw className="h-4 w-4" /> Reset filters</Button></div>}
      </div>
      {shown.length < events.length && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={() => setVisible(count => count + MORE_VISIBLE)}>
            See more <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}