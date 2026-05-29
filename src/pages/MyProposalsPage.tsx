import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, DollarSign, ArrowRight, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface ProposalModule {
  title: string;
  objective: string;
  deliverables: string[];
  timeline: string;
  priority: 'high' | 'medium' | 'low';
  assigned_expert_name: string;
}

interface Proposal {
  executive_summary: string;
  modules: ProposalModule[];
  total_timeline: string;
  estimated_investment_range: string;
  next_steps: string[];
}

interface ProposalRow {
  id: string;
  created_at: string;
  sent_at: string | null;
  generated_modules: Proposal | null;
}

function normalise(g: unknown): Proposal | null {
  if (!g || typeof g !== 'object') return null;
  const obj = g as Record<string, unknown>;
  if (Array.isArray(g)) {
    return { executive_summary: '', modules: g as ProposalModule[], total_timeline: '', estimated_investment_range: '', next_steps: [] };
  }
  return {
    executive_summary: (obj.executive_summary as string) || '',
    modules: Array.isArray(obj.modules) ? (obj.modules as ProposalModule[]) : [],
    total_timeline: (obj.total_timeline as string) || '',
    estimated_investment_range: (obj.estimated_investment_range as string) || '',
    next_steps: Array.isArray(obj.next_steps) ? (obj.next_steps as string[]) : [],
  };
}

export function MyProposalsPage() {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('proposal_requests')
      .select('id, created_at, sent_at, generated_modules')
      .eq('user_id', user.id)
      .eq('status', 'proposal_sent')
      .order('sent_at', { ascending: false })
      .then(({ data }) => {
        setProposals((data || []) as never);
        setLoading(false);
      });
  }, [user?.id]);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading proposals…</div>;
  }

  if (proposals.length === 0) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">My Proposals</h1>
        <Card className="p-12 text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">No proposals yet — complete your profile to get matched with an expert.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">Personalised proposals from the Scaleit team.</p>
      </div>

      {proposals.map((p) => {
        const proposal = normalise(p.generated_modules);
        if (!proposal) return null;
        return (
          <Card key={p.id} className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Proposal</h2>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                  <Calendar className="w-3 h-3" />
                  Sent {p.sent_at ? format(new Date(p.sent_at), 'dd MMM yyyy') : '—'}
                </p>
              </div>
              <Badge variant="secondary">Active</Badge>
            </div>

            {proposal.executive_summary && (
              <p className="text-sm text-foreground leading-relaxed">{proposal.executive_summary}</p>
            )}

            <div className="flex gap-4 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{proposal.total_timeline || 'Timeline TBD'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" />
                <span>{proposal.estimated_investment_range || 'Investment TBD'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Modules</h3>
              {proposal.modules.map((m, idx) => (
                <Card key={idx} className="p-4 space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-medium text-sm">{m.title}</h4>
                    <Badge variant={m.priority === 'high' ? 'destructive' : m.priority === 'medium' ? 'default' : 'secondary'} className="text-[10px]">
                      {m.priority}
                    </Badge>
                  </div>
                  {m.objective && <p className="text-sm text-muted-foreground">{m.objective}</p>}
                  {m.deliverables?.length > 0 && (
                    <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
                      {m.deliverables.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      {m.timeline} {m.assigned_expert_name ? `· ${m.assigned_expert_name}` : ''}
                    </p>
                    {m.assigned_expert_name && (
                      <Button size="sm" variant="outline" asChild>
                        <a href="#">Book intro call with {m.assigned_expert_name}</a>
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>

            {proposal.next_steps?.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Next steps</h3>
                <ol className="space-y-1.5">
                  {proposal.next_steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowRight className="w-3.5 h-3.5 mt-1 text-primary flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
