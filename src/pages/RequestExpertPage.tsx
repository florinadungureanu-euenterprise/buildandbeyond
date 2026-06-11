import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Send } from 'lucide-react';
import { BucketTag } from '@/pages/ExpertsPage';

interface ExpertRow {
  id: string;
  user_id: string | null;
  name: string;
  title: string | null;
  photo_url: string | null;
  scaleit_buckets: string[] | null;
  booking_url: string | null;
}

export function RequestExpertPage() {
  const { expertId } = useParams<{ expertId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const milestones = useStore((s) => s.twelveMonthMilestones);
  const passport = useStore((s) => s.passport);

  const [expert, setExpert] = useState<ExpertRow | null>(null);
  const [loadingExpert, setLoadingExpert] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');
  const [timeframe, setTimeframe] = useState('exploring');
  const [budget, setBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const returnUrl = useMemo(() => `/request-expert/${expertId || ''}`, [expertId]);

  // Auth gate
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate(`/login?next=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [authLoading, user, navigate, returnUrl]);

  // Onboarding gate (no milestones → onboarding first)
  useEffect(() => {
    if (!user || authLoading) return;
    if (milestones.length === 0) {
      toast.message('Complete a quick onboarding first so the expert sees your context.');
      navigate(`/onboarding?return=${encodeURIComponent(returnUrl)}`, { replace: true });
    }
  }, [user, authLoading, milestones.length, navigate, returnUrl]);

  // Load expert
  useEffect(() => {
    if (!expertId) return;
    supabase
      .from('experts')
      .select('id, user_id, name, title, photo_url, scaleit_buckets, booking_url')
      .eq('id', expertId)
      .maybeSingle()
      .then(({ data }) => {
        setExpert(data as ExpertRow | null);
        setLoadingExpert(false);
      });
  }, [expertId]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmit = !submitting && (selected.size > 0 || message.trim().length >= 20);

  const handleSubmit = async () => {
    if (!user || !expert) return;
    setSubmitting(true);
    const snapshot = milestones
      .filter((m) => selected.has(m.id))
      .map((m) => ({ id: m.id, title: m.title, targetDate: m.targetDate, category: m.category }));

    const { data, error } = await supabase
      .from('proposal_requests')
      .insert({
        user_id: user.id,
        expert_id: expert.id,
        selected_milestones: snapshot,
        founder_message: message.trim() || null,
        timeframe,
        budget_hint: budget.trim() || null,
        founder_email: user.email || null,
        founder_name: passport?.founderName || (user.user_metadata as any)?.full_name || null,
        status: 'pending_expert_approval',
        onboarding_answers: { source: 'request-expert' },
      } as never)
      .select('id')
      .single();

    if (error) {
      setSubmitting(false);
      toast.error('Could not submit: ' + error.message);
      return;
    }

    // Fire-and-await email notification to expert (non-blocking on failure)
    try {
      await supabase.functions.invoke('notify-expert-request', {
        body: { action: 'new_request', requestId: (data as any).id },
      });
    } catch {
      // Email failure should not block the user
    }

    setSubmitting(false);
    toast.success('Request sent. We will email you when the expert responds.');
    navigate('/my-proposals');
  };

  if (authLoading || loadingExpert) {
    return (
      <div className="p-12 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="p-12 max-w-2xl mx-auto">
        <Card className="p-8 text-center space-y-3">
          <p className="text-muted-foreground">We couldn't find that expert.</p>
          <Button asChild variant="outline"><Link to="/team">Back to experts</Link></Button>
        </Card>
      </div>
    );
  }

  const initials = expert.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link to="/team"><ArrowLeft className="w-4 h-4 mr-1" /> Back to experts</Link>
      </Button>

      <Card className="p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            {expert.photo_url ? <AvatarImage src={expert.photo_url} alt={expert.name} /> : null}
            <AvatarFallback className="text-lg font-semibold bg-blue-100 text-blue-700">{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h1 className="text-xl font-bold leading-tight">Tell {expert.name.split(' ')[0]} what they can help you with</h1>
            <p className="text-sm text-muted-foreground">{expert.title}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(expert.scaleit_buckets || []).map((b) => <BucketTag key={b} bucket={b} />)}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Pick the milestones you want help with</Label>
          <p className="text-xs text-muted-foreground">From your 12-month roadmap. Optional — you can also just describe your need below.</p>
          <div className="space-y-2 max-h-64 overflow-auto border border-border rounded-lg p-3">
            {milestones.length === 0 && (
              <p className="text-xs text-muted-foreground">No milestones yet.</p>
            )}
            {milestones.map((m) => (
              <label key={m.id} className="flex items-start gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={selected.has(m.id)}
                  onCheckedChange={() => toggle(m.id)}
                  className="mt-0.5"
                />
                <span className="flex-1">
                  <span className="font-medium">{m.title}</span>
                  <span className="text-xs text-muted-foreground ml-2">{m.category}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="msg">What you're trying to solve</Label>
          <Textarea
            id="msg"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Where are you stuck, what does success look like, what have you tried? A few sentences is plenty."
          />
          <p className="text-xs text-muted-foreground">Min 20 characters (if no milestones selected).</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Timeframe</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="asap">ASAP</SelectItem>
                <SelectItem value="next_month">Within the next month</SelectItem>
                <SelectItem value="next_quarter">Within the next quarter</SelectItem>
                <SelectItem value="exploring">Just exploring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget">Budget hint (optional)</Label>
            <input
              id="budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. €2k pilot, retainer, equity-only"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
          <Button variant="ghost" asChild><Link to="/team">Cancel</Link></Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Send request
          </Button>
        </div>
      </Card>
    </div>
  );
}
