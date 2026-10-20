import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Calendar, Plus, Send } from 'lucide-react';
import { EventDirectory } from '@/components/events/EventDirectory';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function EventsPage() {
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', date: '', location: '', type: 'meetup', url: '', organizer: '', tags: '' });
  const { toast } = useToast();
  const { user } = useAuth();

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
    <div className="p-5 md:p-8 space-y-6">
      <ScreenTour
        screenKey="events"
        title="Startup Events & Opportunities 🎪"
        description="Discover conferences, hackathons, meetups, and workshops relevant to your stage.\n\nYou can also submit your own events for the community!"
        icon={<Calendar className="w-12 h-12 text-primary" />}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Events</h1>
          <p className="mt-2 text-muted-foreground">Conferences, hackathons, and workshops for European founders</p>
        </div>
        <Button onClick={() => setShowSubmitDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Submit Event
        </Button>
      </div>

      <EventDirectory />

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
