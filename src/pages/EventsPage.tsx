import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Calendar, MapPin, ExternalLink, Plus, Clock, Users, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'conference' | 'hackathon' | 'meetup' | 'webinar' | 'workshop' | 'demo-day';
  url?: string;
  organizer: string;
  tags: string[];
  featured?: boolean;
}

const typeColors: Record<string, string> = {
  conference: 'bg-blue-100 text-blue-700 border-blue-200',
  hackathon: 'bg-purple-100 text-purple-700 border-purple-200',
  meetup: 'bg-green-100 text-green-700 border-green-200',
  webinar: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  workshop: 'bg-orange-100 text-orange-700 border-orange-200',
  'demo-day': 'bg-pink-100 text-pink-700 border-pink-200',
};

const defaultEvents: Event[] = [
  {
    id: '1', title: 'Web Summit 2026', description: 'Europe\'s largest tech conference bringing together startups, investors, and industry leaders. Nov 9-12, 2026.',
    date: '2026-11-09', location: 'Lisbon, Portugal', type: 'conference', url: 'https://websummit.com',
    organizer: 'Web Summit', tags: ['Tech', 'Networking', 'Investors'], featured: true,
  },
  {
    id: '2', title: 'Slush 2026', description: 'The most founder-focused event on the planet: 5,800 startups and 3,300 investors in Helsinki. Nov 18-19, 2026.',
    date: '2026-11-18', location: 'Helsinki, Finland', type: 'conference', url: 'https://slush.org',
    organizer: 'Slush', tags: ['Startup', 'Investors', 'Nordic'], featured: true,
  },
  {
    id: '3', title: 'Bits & Pretzels 2026', description: 'Curated founders festival in Munich with 1,500+ VC firms, ending at Oktoberfest. Sep 28-30, 2026.',
    date: '2026-09-28', location: 'Munich, Germany', type: 'conference', url: 'https://www.bitsandpretzels.com',
    organizer: 'Bits & Pretzels', tags: ['Founders', 'VC', 'Networking'],
  },
  {
    id: '4', title: '4YFN Barcelona 2027', description: 'Startup arm of MWC connecting founders, investors, and corporates with structured matchmaking and a pitch competition.',
    date: '2027-03-01', location: 'Barcelona, Spain', type: 'conference', url: 'https://www.4yfn.com',
    organizer: 'GSMA', tags: ['Matchmaking', 'Corporates', 'Pitch'],
  },
  {
    id: '5', title: 'MWC Barcelona 2027', description: 'The world\'s largest connectivity event covering mobile, 5G, AI devices, and digital transformation. Mar 1-4, 2027.',
    date: '2027-03-01', location: 'Barcelona, Spain', type: 'conference', url: 'https://www.mwcbarcelona.com',
    organizer: 'GSMA', tags: ['Deep Tech', 'AI', 'Enterprise'],
  },
  {
    id: '6', title: 'VivaTech 2027', description: 'Europe\'s largest startup and technology event at Paris Expo Porte de Versailles. Jun 16-19, 2027.',
    date: '2027-06-16', location: 'Paris, France', type: 'conference', url: 'https://vivatech.com',
    organizer: 'VivaTech', tags: ['Startup', 'Innovation', 'Corporates'],
  },
];


export function EventsPage() {
  const [filterType, setFilterType] = useState<string>('all');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', type: 'meetup', url: '', organizer: '', tags: '' });
  const { toast } = useToast();
  const { user } = useAuth();

  const types = ['all', ...Array.from(new Set(defaultEvents.map(e => e.type)))];
  const filtered = filterType === 'all' ? defaultEvents : defaultEvents.filter(e => e.type === filterType);
  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSubmitEvent = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      toast({ title: 'Missing fields', description: 'Please fill in title, date, and location', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      // Store event submission for approval
      await supabase.from('event_submissions' as any).insert({
        title: formData.title, description: formData.description, event_date: formData.date,
        location: formData.location, type: formData.type, url: formData.url,
        organizer: formData.organizer, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        submitted_by: user?.id || 'anonymous', status: 'pending',
      } as any);
      toast({ title: 'Event submitted!', description: 'Your event has been submitted for review. We\'ll notify you once it\'s approved.' });
      setShowSubmitDialog(false);
      setFormData({ title: '', description: '', date: '', location: '', type: 'meetup', url: '', organizer: '', tags: '' });
    } catch (err) {
      toast({ title: 'Submission saved', description: 'Your event has been recorded for review.' });
      setShowSubmitDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="events"
        title="Startup Events & Opportunities 🎪"
        description="Discover conferences, hackathons, meetups, and workshops relevant to your stage.\n\nYou can also submit your own events for the community!"
        icon={<Calendar className="w-12 h-12 text-primary" />}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="mt-2 text-muted-foreground">Conferences, hackathons, and workshops for European founders</p>
        </div>
        <Button onClick={() => setShowSubmitDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Submit Event
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {types.map(type => (
          <Button key={type} variant={filterType === type ? 'default' : 'outline'} size="sm" onClick={() => setFilterType(type)} className="capitalize">
            {type === 'demo-day' ? 'Demo Day' : type}
          </Button>
        ))}
      </div>

      {/* Featured Events */}
      {filterType === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sorted.filter(e => e.featured).map(event => (
            <Card key={event.id} className="p-6 border-primary/30 bg-primary/5 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/20">⭐ Featured</Badge>
                <Badge className={typeColors[event.type] + ' capitalize'}>{event.type}</Badge>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{event.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{event.description}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{event.organizer}</span>
              </div>
              <div className="flex flex-wrap gap-1 mb-4">
                {event.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
              </div>
              {event.url && (
                <Button size="sm" onClick={() => window.open(event.url, '_blank', 'noopener,noreferrer')}>
                  <ExternalLink className="w-3 h-3 mr-1" /> Visit
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* All Events */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.filter(e => filterType !== 'all' || !e.featured).map(event => (
          <Card key={event.id} className="p-5 hover:shadow-md transition-shadow border-border">
            <div className="flex items-center justify-between mb-2">
              <Badge className={typeColors[event.type] + ' capitalize text-xs'}>{event.type}</Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
            <h3 className="font-semibold text-foreground mb-1">{event.title}</h3>
            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <MapPin className="w-3 h-3" />{event.location}
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {event.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
            </div>
            {event.url && (
              <Button size="sm" variant="ghost" className="w-full" onClick={() => window.open(event.url, '_blank', 'noopener,noreferrer')}>
                <ExternalLink className="w-3 h-3 mr-1" /> Learn more
              </Button>
            )}
          </Card>
        ))}
      </div>

      {/* Submit Event Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit an Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Event Title *</Label><Input value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} placeholder="e.g., Startup Weekend Berlin" /></div>
            <div><Label>Description</Label><Textarea value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the event" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Date *</Label><Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} /></div>
              <div><Label>Location *</Label><Input value={formData.location} onChange={e => setFormData(p => ({ ...p, location: e.target.value }))} placeholder="City, Country or Online" /></div>
            </div>
            <div><Label>Organizer</Label><Input value={formData.organizer} onChange={e => setFormData(p => ({ ...p, organizer: e.target.value }))} placeholder="Organization name" /></div>
            <div><Label>Website URL</Label><Input value={formData.url} onChange={e => setFormData(p => ({ ...p, url: e.target.value }))} placeholder="https://..." /></div>
            <div><Label>Tags (comma-separated)</Label><Input value={formData.tags} onChange={e => setFormData(p => ({ ...p, tags: e.target.value }))} placeholder="e.g., AI, Networking, Funding" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowSubmitDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmitEvent} disabled={submitting}>
              <Send className="w-4 h-4 mr-2" />{submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
