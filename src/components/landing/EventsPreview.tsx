import { ArrowUpRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EventDirectory } from '@/components/events/EventDirectory';

export function EventsPreview() {
  return (
    <section id="events" className="section-band border-t border-border scroll-mt-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="section-label"><Calendar /> Events</div>
            <h2 className="section-title mt-6">Where Europe meets next.</h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">Europe’s innovation community, from deep tech and AI to investment and life sciences.</p>
        </div>
        <EventDirectory />
        <div className="mt-8 text-center"><Button variant="outline" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}>Get personalized opportunities <ArrowUpRight /></Button></div>
      </div>
    </section>
  );
}