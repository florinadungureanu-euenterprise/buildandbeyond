import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

const groups: Array<{ category: string; items: Array<{ name: string; status: 'live' | 'soon' | 'webhook' }> }> = [
  { category: 'Comms', items: [{ name: 'Slack', status: 'live' }] },
  { category: 'Productivity', items: [{ name: 'Notion', status: 'soon' }, { name: 'Google Calendar', status: 'soon' }] },
  { category: 'Project Management', items: [{ name: 'Linear', status: 'soon' }, { name: 'Trello', status: 'soon' }] },
  { category: 'Automation', items: [{ name: 'Zapier', status: 'soon' }, { name: 'Make', status: 'soon' }, { name: 'Webhook', status: 'webhook' }] },
];

export function IntegrationsPage() {
  const { user } = useAuth();
  const [waitlistFor, setWaitlistFor] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.email) return;
    setEmail(user.email);
  }, [user?.email]);

  const joinWaitlist = async () => {
    if (!waitlistFor || !email) return;
    setSubmitting(true);
    const { error } = await supabase.from('connector_waitlist').insert({
      user_id: user?.id || null,
      connector_name: waitlistFor,
      email,
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to join waitlist'); return; }
    toast.success(`You're on the ${waitlistFor} waitlist.`);
    setWaitlistFor(null);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Integrations</h1>
        <p className="text-sm text-muted-foreground">Connect EU Enterprise to the tools you already use.</p>
      </div>

      {groups.map((g) => (
        <div key={g.category} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{g.category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {g.items.map((it) => (
              <Card key={it.name} className="p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{it.name}</p>
                  {it.status === 'live' && <Badge variant="secondary" className="text-xs">Available</Badge>}
                  {it.status === 'soon' && <Badge variant="outline" className="text-xs">Coming soon</Badge>}
                  {it.status === 'webhook' && <Badge className="text-xs">Active</Badge>}
                </div>
                {it.status === 'webhook' && (
                  <Button asChild size="sm" variant="outline">
                    <Link to="/settings">Configure in Settings</Link>
                  </Button>
                )}
                {it.status === 'soon' && (
                  <Button size="sm" variant="outline" onClick={() => setWaitlistFor(it.name)}>Join waitlist</Button>
                )}
                {it.status === 'live' && (
                  <Button size="sm" variant="outline" disabled>Connected via workspace</Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={!!waitlistFor} onOpenChange={(open) => !open && setWaitlistFor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join the waitlist for {waitlistFor}</DialogTitle>
          </DialogHeader>
          <Input placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setWaitlistFor(null)}>Cancel</Button>
            <Button onClick={joinWaitlist} disabled={submitting || !email}>Join waitlist</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
