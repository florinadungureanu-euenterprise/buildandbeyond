import { ArrowUpRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const events = [
  { title: 'Bits & Pretzels', date: '28–30 Sep 2026', location: 'Munich', url: 'https://www.bitsandpretzels.com' },
  { title: 'Web Summit', date: '9–12 Nov 2026', location: 'Lisbon', url: 'https://websummit.com' },
  { title: 'Slush', date: '18–19 Nov 2026', location: 'Helsinki', url: 'https://slush.org' },
  { title: '4YFN', date: '1–4 Mar 2027', location: 'Barcelona', url: 'https://www.4yfn.com' },
];

export function EventsPreview() {
  return (
    <section className="section-band border-t border-border">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-label"><Calendar /> On the horizon</div>
            <h2 className="section-title mt-6">Where Europe meets next.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Upcoming conferences selected for founders building, funding, and expanding across Europe.</p>
        </div>
        <div className="divide-y divide-border border-y border-border">
          {events.map((event, index) => (
            <a key={event.title} href={event.url} target="_blank" rel="noopener noreferrer" className="group grid gap-3 py-6 transition-colors hover:bg-secondary/30 sm:grid-cols-[3rem_1fr_1fr_auto] sm:items-center sm:px-4">
              <span className="font-heading text-xs text-primary">0{index + 1}</span>
              <h3 className="font-heading text-xl font-semibold">{event.title}</h3>
              <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Calendar />{event.date}</span><span className="flex items-center gap-2"><MapPin />{event.location}</span></div>
              <ArrowUpRight className="text-muted-foreground transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-primary" />
            </a>
          ))}
        </div>
        <div className="mt-8 text-center"><Button variant="outline" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}>Get personalized opportunities <ArrowUpRight /></Button></div>
      </div>
    </section>
  );
}