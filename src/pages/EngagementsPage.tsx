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
  scaleit_bucket: string | null;
  status: string;
  current_milestone: string | null;
  started_at: string;
}

export function EngagementsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Engagement[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('engagements')
      .select('*')
      .eq('founder_id', user.id)
      .order('started_at', { ascending: false })
      .then(async ({ data }) => {
        const rows = (data || []) as Engagement[];
        setItems(rows);
        const expertIds = rows.map((r) => r.expert_id).filter(Boolean) as string[];
        if (expertIds.length) {
          const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', expertIds);
          const m: Record<string, string> = {};
          (profiles || []).forEach((p) => { m[p.id] = p.full_name || 'Expert'; });
          setNames(m);
        }
        setLoading(false);
      });
  }, [user?.id]);

  if (loading) return <div className="p-8 text-muted-foreground">Loading…</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Engagements</h1>
        <p className="text-sm text-muted-foreground">Your active collaborations with Scaleit experts.</p>
      </div>
      {items.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">No active engagements yet.</Card>
      ) : (
        items.map((e) => (
          <Card key={e.id} className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-semibold">{e.expert_id ? names[e.expert_id] || 'Expert' : 'Pending expert'}</p>
              {e.scaleit_bucket && <Badge variant="secondary" className="text-xs">{e.scaleit_bucket}</Badge>}
              {e.current_milestone && <p className="text-sm text-muted-foreground">Current: {e.current_milestone}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={e.status === 'active' ? 'default' : 'secondary'}>{e.status}</Badge>
              <Button asChild size="sm"><Link to={`/engagements/${e.id}`}>Open workspace</Link></Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
