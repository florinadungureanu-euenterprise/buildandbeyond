import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { CheckCircle2, XCircle, Loader2, Mail, Calendar } from 'lucide-react';

interface RequestRow {
  id: string;
  user_id: string;
  created_at: string;
  status: string;
  founder_message: string | null;
  founder_email: string | null;
  founder_name: string | null;
  timeframe: string | null;
  budget_hint: string | null;
  selected_milestones: Array<{ id: string; title: string; category: string }> | null;
  expert_response_note: string | null;
  responded_at: string | null;
}

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending_expert_approval: { label: 'New', cls: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Approved', cls: 'bg-emerald-100 text-emerald-800' },
  declined: { label: 'Declined', cls: 'bg-slate-200 text-slate-700' },
};

export function ExpertRequestsPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expertId, setExpertId] = useState<string | null>(null);
  const [acting, setActing] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async (eid: string) => {
    const { data } = await supabase
      .from('proposal_requests')
      .select('*')
      .eq('expert_id', eid)
      .order('created_at', { ascending: false });
    setRows((data || []) as never);
    setLoading(false);
  };

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('experts')
      .select('id, is_active')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data || !(data as any).is_active) {
          setLoading(false);
          return;
        }
        setExpertId((data as any).id);
        load((data as any).id);
      });
  }, [user?.id]);

  const respond = async (row: RequestRow, action: 'approved' | 'declined') => {
    setActing(row.id);
    const { error } = await supabase
      .from('proposal_requests')
      .update({
        status: action,
        expert_response_note: notes[row.id]?.trim() || null,
        responded_at: new Date().toISOString(),
      } as never)
      .eq('id', row.id);
    if (error) {
      setActing(null);
      toast.error('Could not save: ' + error.message);
      return;
    }
    try {
      await supabase.functions.invoke('notify-expert-request', {
        body: { action, requestId: row.id },
      });
    } catch { /* email is best-effort */ }
    setActing(null);
    toast.success(action === 'approved' ? 'Approved and emailed the founder.' : 'Declined and emailed the founder.');
    if (expertId) load(expertId);
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>;
  }

  if (!expertId) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <Card className="p-8 text-center space-y-3">
          <h1 className="text-xl font-bold">Expert Requests</h1>
          <p className="text-muted-foreground">This inbox is for approved experts only.</p>
          <Button asChild variant="outline"><Link to="/expert-profile">Apply as expert</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Expert Requests</h1>
        <p className="text-sm text-muted-foreground mt-1">Founders who want your help. Approve to send them a confirmation email and unlock booking.</p>
      </div>

      {rows.length === 0 && (
        <Card className="p-12 text-center text-muted-foreground">
          No requests yet. They'll show up here when a founder picks you.
        </Card>
      )}

      {rows.map((row) => {
        const badge = STATUS_BADGE[row.status] || { label: row.status, cls: 'bg-muted text-muted-foreground' };
        const isPending = row.status === 'pending_expert_approval';
        const milestones = row.selected_milestones || [];
        return (
          <Card key={row.id} className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{row.founder_name || row.founder_email || 'A founder'}</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(row.created_at), 'dd MMM yyyy, HH:mm')}</span>
                  {row.founder_email && (
                    <a href={`mailto:${row.founder_email}`} className="flex items-center gap-1 hover:text-foreground">
                      <Mail className="w-3 h-3" /> {row.founder_email}
                    </a>
                  )}
                </p>
              </div>
              <Badge className={badge.cls + ' border-0'}>{badge.label}</Badge>
            </div>

            {milestones.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Milestones they want help with</p>
                <ul className="text-sm space-y-1">
                  {milestones.map((m) => (
                    <li key={m.id} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <span>{m.title} <span className="text-xs text-muted-foreground ml-1">· {m.category}</span></span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {row.founder_message && (
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">What they're trying to solve</p>
                <p className="text-sm whitespace-pre-wrap text-foreground/90 bg-muted/40 p-3 rounded-md">{row.founder_message}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              {row.timeframe && <div><span className="font-semibold text-foreground">Timeframe:</span> {row.timeframe}</div>}
              {row.budget_hint && <div><span className="font-semibold text-foreground">Budget:</span> {row.budget_hint}</div>}
            </div>

            {isPending ? (
              <div className="space-y-3 pt-2 border-t border-border">
                <Textarea
                  rows={2}
                  placeholder="Optional note to include in the email to the founder…"
                  value={notes[row.id] || ''}
                  onChange={(e) => setNotes({ ...notes, [row.id]: e.target.value })}
                />
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => respond(row, 'declined')}
                    disabled={acting === row.id}
                  >
                    <XCircle className="w-4 h-4 mr-1.5" /> Decline
                  </Button>
                  <Button
                    onClick={() => respond(row, 'approved')}
                    disabled={acting === row.id}
                  >
                    {acting === row.id ? <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-1.5" />}
                    Approve & email founder
                  </Button>
                </div>
              </div>
            ) : (
              row.expert_response_note && (
                <p className="text-xs text-muted-foreground italic">Your note: {row.expert_response_note}</p>
              )
            )}
          </Card>
        );
      })}
    </div>
  );
}
