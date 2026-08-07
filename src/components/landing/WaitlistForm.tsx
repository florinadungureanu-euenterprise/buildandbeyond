import { useState } from 'react';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const schema = z.object({
  full_name: z.string().trim().min(1, 'Please tell us your name').max(100),
  email: z.string().trim().email('Please enter a valid email').max(255),
  organization: z.string().trim().max(150).optional(),
  role: z.string().trim().max(100).optional(),
  interest: z.string().trim().max(1000).optional(),
});

export function WaitlistForm() {
  const [form, setForm] = useState({ full_name: '', email: '', organization: '', role: '', interest: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('waitlist_signups').insert({
      full_name: parsed.data.full_name,
      email: parsed.data.email,
      organization: parsed.data.organization || null,
      role: parsed.data.role || null,
      interest: parsed.data.interest || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Something went wrong. Please try again.');
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <Card className="p-8 text-center max-w-xl mx-auto">
        <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">You are on the waiting list</h3>
        <p className="text-sm text-muted-foreground">
          Thanks {form.full_name.split(' ')[0]}. We will reach out at {form.email} as soon as your spot opens up.
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-8 max-w-xl mx-auto">
      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wl-name">Full name</Label>
            <Input id="wl-name" value={form.full_name} onChange={set('full_name')} placeholder="Jane Doe" maxLength={100} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-email">Email</Label>
            <Input id="wl-email" type="email" value={form.email} onChange={set('email')} placeholder="you@company.com" maxLength={255} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-org">Organization</Label>
            <Input id="wl-org" value={form.organization} onChange={set('organization')} placeholder="Your startup or organization" maxLength={150} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wl-role">Your role</Label>
            <Input id="wl-role" value={form.role} onChange={set('role')} placeholder="Founder, innovation lead, investor..." maxLength={100} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="wl-interest">What do you want to gain from Build &amp; Beyond?</Label>
          <Textarea id="wl-interest" value={form.interest} onChange={set('interest')} placeholder="Funding, market entry, partners, tools..." rows={3} maxLength={1000} />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={submitting}>
          {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {submitting ? 'Joining...' : 'Join the waiting list'}
          {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          We onboard new founders in small batches. No payment, no credit card.
        </p>
      </form>
    </Card>
  );
}
