import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Engagement {
  id: string;
  expert_id: string | null;
  founder_id: string | null;
  scaleit_bucket: string | null;
  status: string;
  current_milestone: string | null;
  started_at: string;
}

function EngagementCard({ e, counterpartyName, role }: { e: Engagement; counterpartyName: string; role: 'founder' | 'expert' }) {
  return (
    <Card className="p-5 flex items-center justify-between">
      <div className="space-y-1">
        <p className="font-semibold">{counterpartyName}</p>
        <p className="text-xs text-muted-foreground">{role === 'founder' ? 'Your expert' : 'Your client'}</p>
        {e.scaleit_bucket && <Badge variant="secondary" className="text-xs">{e.scaleit_bucket}</Badge>}
        {e.current_milestone && <p className="text-sm text-muted-foreground">Current: {e.current_milestone}</p>}
      </div>
      <div className="flex items-center gap-3">
        <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>{e.status}</Badge>
        <Button asChild size="sm"><Link to={`/engagements/${e.id}`}>Open workspace</Link></Button>
      </div>
    </Card>
  );
}

export function EngagementsPage() {
  const { user } = useAuth();
  const [asFounder, setAsFounder] = useState<Engagement[]>([]);
  const [asExpert, setAsExpert] = useState<Engagement[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    (async () => {
      const [{ data: f }, { data: x }] = await Promise.all([
        supabase.from('engagements').select('*').eq('founder_id', user.id).order('started_at', { ascending: false }),
        supabase.from('engagements').select('*').eq('expert_id', user.id).order('started_at', { ascending: false }),
      ]);
      const founderRows = (f || []) as Engagement[];
      const expertRows = (x || []) as Engagement[];
      setAsFounder(founderRows);
      setAsExpert(expertRows);
      const ids = [
        ...founderRows.map((r) => r.expert_id),
        ...expertRows.map((r) => r.founder_id),
      ].filter(Boolean) as string[];
      if (ids.length) {
        const { data: profiles } = await supabase.from('profiles').select('id, full_name, company_name').in('id', ids);
        const m: Record<string, string> = {};
        (profiles || []).forEach((p: any) => { m[p.id] = p.company_name || p.full_name || 'Member'; });
        setNames(m);
      }
      setLoading(false);
    })();
  }, [user?.id]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Consulting projects</h1>
        <p className="text-sm text-muted-foreground">Collaborations with Scaleit experts and your clients.</p>
      </div>

      {asExpert.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My Clients</h2>
          {asExpert.map((e) => (
            <EngagementCard key={e.id} e={e} counterpartyName={e.founder_id ? names[e.founder_id] || 'Founder' : 'Founder'} role="expert" />
          ))}
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">My Experts</h2>
        {asFounder.length === 0 ? (
          <Card className="p-12 text-center text-muted-foreground">No active engagements yet.</Card>
        ) : (
          asFounder.map((e) => (
            <EngagementCard key={e.id} e={e} counterpartyName={e.expert_id ? names[e.expert_id] || 'Expert' : 'Pending expert'} role="founder" />
          ))
        )}
      </section>
    </div>
  );
}
