import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  DollarSign,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  Loader2,
} from 'lucide-react';
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

interface RequestRow {
  id: string;
  created_at: string;
  sent_at: string | null;
  responded_at: string | null;
  status: string;
  timeframe: string | null;
  founder_message: string | null;
  expert_response_note: string | null;
  generated_modules: Proposal | null;
  expert_id: string | null;
  experts?: { name: string | null } | null;
}

const TIMEFRAME_LABELS: Record<string, string> = {
  asap: 'As soon as possible',
  next_month: 'Within the next month',
  next_quarter: 'Within the next quarter',
  exploring: 'Just exploring',
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    description: string;
    badgeClass: string;
    Icon: typeof Clock;
  }
> = {
  pending_expert_approval: {
    label: 'Awaiting expert review',
    description: "Your request has been sent. We'll email you when the expert responds.",
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    Icon: Clock,
  },
  reviewing: {
    label: 'Under review',
    description: 'The expert is reviewing your request.',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-200',
    Icon: Loader2,
  },
  approved: {
    label: 'Approved',
    description: 'The expert accepted your request. A proposal is being prepared.',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    Icon: CheckCircle2,
  },
  declined: {
    label: 'Declined',
    description: "The expert couldn't take this on. Consider requesting another expert.",
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    Icon: XCircle,
  },
  proposal_sent: {
    label: 'Proposal ready',
    description: 'Review your personalised proposal below.',
    badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
    Icon: FileText,
  },
};

function normalise(g: unknown): Proposal | null {
  if (!g || typeof g !== 'object') return null;
  const obj = g as Record<string, unknown>;
  if (Array.isArray(g)) {
    return {
      executive_summary: '',
      modules: g as ProposalModule[],
      total_timeline: '',
      estimated_investment_range: '',
      next_steps: [],
    };
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
  const location = useLocation();
  const justSubmitted = (location.state as { justSubmitted?: boolean; expertName?: string } | null)
    ?.justSubmitted;
  const submittedExpertName = (location.state as { expertName?: string } | null)?.expertName;

  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('proposal_requests')
      .select(
        'id, created_at, sent_at, responded_at, status, timeframe, founder_message, expert_response_note, generated_modules, expert_id, experts(name)'
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setRows((data || []) as never);
        setLoading(false);
      });
  }, [user?.id]);

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Proposals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track requests you've sent to experts and review proposals.
        </p>
      </div>

      {justSubmitted && (
        <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-emerald-900">
              Request sent{submittedExpertName ? ` to ${submittedExpertName}` : ''}
            </p>
            <p className="text-xs text-emerald-700 mt-0.5">
              You'll receive an email when they respond. Track it below.
            </p>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <Card className="p-12 text-center">
          <Sparkles className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            No requests yet. Pick an expert from scale-it.co to send your first request.
          </p>
        </Card>
      ) : (
        rows.map((row) => {
          const cfg = STATUS_CONFIG[row.status] ?? {
            label: row.status,
            description: '',
            badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
            Icon: Clock,
          };
          const Icon = cfg.Icon;
          const expertName = row.experts?.name || 'Expert';
          const proposal = normalise(row.generated_modules);
          const showProposal = row.status === 'proposal_sent' && proposal;

          return (
            <Card key={row.id} className="p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Request to {expertName}</h2>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Calendar className="w-3 h-3" />
                    Sent {format(new Date(row.created_at), 'dd MMM yyyy')}
                    {row.timeframe && TIMEFRAME_LABELS[row.timeframe] && (
                      <span className="ml-2">· {TIMEFRAME_LABELS[row.timeframe]}</span>
                    )}
                  </p>
                </div>
                <Badge className={`${cfg.badgeClass} border gap-1.5`}>
                  <Icon className="w-3 h-3" />
                  {cfg.label}
                </Badge>
              </div>

              <div className="text-sm text-muted-foreground">{cfg.description}</div>

              {row.founder_message && (
                <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Your message
                  </p>
                  <p className="text-sm">{row.founder_message}</p>
                </div>
              )}

              {row.expert_response_note && (
                <div className="rounded-md border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Note from {expertName}
                  </p>
                  <p className="text-sm">{row.expert_response_note}</p>
                </div>
              )}

              {showProposal && proposal && (
                <>
                  {proposal.executive_summary && (
                    <p className="text-sm leading-relaxed">{proposal.executive_summary}</p>
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

                  {proposal.modules.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Modules</h3>
                      {proposal.modules.map((m, idx) => (
                        <div
                          key={idx}
                          className="rounded-md border border-border bg-muted/20 p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-medium text-sm">{m.title}</h4>
                            <Badge
                              variant={m.priority === 'high' ? 'default' : 'secondary'}
                              className="text-[10px] capitalize"
                            >
                              {m.priority}
                            </Badge>
                          </div>
                          {m.objective && (
                            <p className="text-sm text-muted-foreground">{m.objective}</p>
                          )}
                          {m.deliverables?.length > 0 && (
                            <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-0.5">
                              {m.deliverables.map((d, i) => (
                                <li key={i}>{d}</li>
                              ))}
                            </ul>
                          )}
                          <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-muted-foreground">
                              {m.timeline}
                              {m.assigned_expert_name ? ` · ${m.assigned_expert_name}` : ''}
                            </p>
                            {m.assigned_expert_name && (
                              <Button size="sm" variant="outline" asChild>
                                <a href="#">Book intro call with {m.assigned_expert_name}</a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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
                </>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
