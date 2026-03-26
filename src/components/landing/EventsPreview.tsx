import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const previewEvents = [
  { title: 'Web Summit 2026', date: 'Nov 3, 2026', location: 'Lisbon', type: 'conference', featured: true },
  { title: 'Build Weekend', date: 'Jul 20, 2026', location: 'Online + Berlin', type: 'hackathon', featured: true },
  { title: 'EU Startups Summit', date: 'May 14, 2026', location: 'Malta', type: 'conference' },
  { title: 'EIC Summit 2026', date: 'Oct 15, 2026', location: 'Brussels', type: 'conference' },
];

const typeColors: Record<string, string> = {
  conference: 'bg-blue-100 text-blue-700',
  hackathon: 'bg-purple-100 text-purple-700',
};

export function EventsPreview() {
  const navigate = useNavigate();

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
            <Card key={idx} className={`p-5 hover:shadow-md transition-shadow ${event.featured ? 'border-primary/30' : 'border-border'}`}>
              <Badge className={`${typeColors[event.type] || 'bg-muted text-muted-foreground'} capitalize text-xs mb-3`}>
                {event.type}
              </Badge>
              <h3 className="font-semibold text-foreground mb-2 text-sm">{event.title}</h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1"><Calendar className="w-3 h-3" />{event.date}</div>
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => navigate('/signup')}>
            See all events <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
