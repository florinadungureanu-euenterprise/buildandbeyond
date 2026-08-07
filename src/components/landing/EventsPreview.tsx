import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';

const previewEvents = [
  { title: 'Bits & Pretzels 2026', date: 'Sep 28-30, 2026', location: 'Munich', type: 'conference', url: 'https://www.bitsandpretzels.com', featured: true },
  { title: 'Web Summit 2026', date: 'Nov 9-12, 2026', location: 'Lisbon', type: 'conference', url: 'https://websummit.com', featured: true },
  { title: 'Slush 2026', date: 'Nov 18-19, 2026', location: 'Helsinki', type: 'conference', url: 'https://slush.org' },
  { title: '4YFN Barcelona 2027', date: 'Mar 1-4, 2027', location: 'Barcelona', type: 'conference', url: 'https://www.4yfn.com' },
];


const typeColors: Record<string, string> = {
  conference: 'bg-blue-100 text-blue-700',
  hackathon: 'bg-purple-100 text-purple-700',
};

export function EventsPreview() {


  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Upcoming Events for Founders
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Conferences, hackathons, and workshops curated for European startup founders
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {previewEvents.map((event, idx) => (
            <a key={idx} href={event.url} target="_blank" rel="noopener noreferrer" className="block">
              <Card className={`p-5 h-full hover:shadow-md transition-shadow ${event.featured ? 'border-primary/30' : 'border-border'}`}>
                <Badge className={`${typeColors[event.type] || 'bg-muted text-muted-foreground'} capitalize text-xs mb-3`}>
                  {event.type}
                </Badge>
                <h3 className="font-semibold text-foreground mb-2 text-sm">{event.title}</h3>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</div>
                  <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</div>
                </div>
              </Card>
            </a>
          ))}
        </div>


        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}>
            Join the waiting list for full access <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
