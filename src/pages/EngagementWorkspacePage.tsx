import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, CheckCircle, Star, ArrowRight, Lightbulb, Send } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type UpdateType = 'note' | 'deliverable' | 'milestone_completed' | 'next_step' | 'suggestion';

interface Update {
  id: string;
  type: UpdateType;
  content: string;
  author_role: string;
  created_at: string;
}

interface Engagement {
  id: string;
  founder_id: string | null;
  expert_id: string | null;
  proposal_id: string | null;
  current_milestone: string | null;
  status: string;
  scaleit_bucket: string | null;
}

interface ProposalModule {
  title?: string;
  objective?: string;
  deliverables?: string[];
  timeline?: string;
}

interface Proposal {
  id: string;
  status: string;
  sent_at: string | null;
  generated_modules: any;
  onboarding_answers: any;
  notes: string | null;
}

const iconFor = (t: UpdateType) => {
  if (t === 'deliverable') return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (t === 'milestone_completed') return <Star className="w-4 h-4 text-yellow-600" />;
  if (t === 'next_step') return <ArrowRight className="w-4 h-4 text-blue-600" />;
  if (t === 'suggestion') return <Lightbulb className="w-4 h-4 text-amber-600" />;
  return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
};

export function EngagementWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [counterpartyName, setCounterpartyName] = useState<string>('');
  const [founderData, setFounderData] = useState<any>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [modulesDraft, setModulesDraft] = useState<string>('');
  const [updates, setUpdates] = useState<Update[]>([]);
  const [type, setType] = useState<UpdateType>('note');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [milestoneDraft, setMilestoneDraft] = useState('');

  const isExpert = !!engagement && engagement.expert_id === user?.id;
  const role: 'founder' | 'expert' = isExpert ? 'expert' : 'founder';

  const loadUpdates = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('engagement_updates')
      .select('id, type, content, author_role, created_at')
      .eq('engagement_id', id)
      .order('created_at', { ascending: true });
    setUpdates((data || []) as Update[]);
  };

  useEffect(() => {
    if (!id || !user?.id) return;
    (async () => {
      const { data: eng } = await supabase.from('engagements').select('*').eq('id', id).maybeSingle();
      if (!eng) return;
      setEngagement(eng as Engagement);
      setMilestoneDraft((eng as Engagement).current_milestone || '');

      const counterpartyId = eng.expert_id === user.id ? eng.founder_id : eng.expert_id;
      if (counterpartyId) {
        const { data: p } = await supabase.from('profiles').select('full_name, company_name').eq('id', counterpartyId).maybeSingle();
        setCounterpartyName((p as any)?.company_name || (p as any)?.full_name || 'Member');
      }

      // If current user is the expert, fetch founder's data + proposal
      if (eng.expert_id === user.id && eng.founder_id) {
        const { data: ud } = await supabase
          .from('user_data')
          .select('onboarding_profile, user_inputs, validation, milestones, passport')
          .eq('user_id', eng.founder_id)
          .maybeSingle();
        setFounderData(ud);

        let proposalRow: any = null;
        if (eng.proposal_id) {
          const { data } = await supabase.from('proposal_requests').select('*').eq('id', eng.proposal_id).maybeSingle();
          proposalRow = data;
        }
        if (!proposalRow) {
          const { data } = await supabase
            .from('proposal_requests')
            .select('*')
            .eq('user_id', eng.founder_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          proposalRow = data;
        }
        if (proposalRow) {
          setProposal(proposalRow as Proposal);
          setModulesDraft(JSON.stringify(proposalRow.generated_modules || [], null, 2));
        }
      }

      loadUpdates();
    })();
  }, [id, user?.id]);

  const submitUpdate = async () => {
    if (!content.trim() || !user?.id || !id) return;
    setSubmitting(true);
    const { error } = await supabase.from('engagement_updates').insert({
      engagement_id: id,
      author_id: user.id,
      author_role: role,
      type,
      content: content.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to post'); return; }
    setContent('');
    loadUpdates();
  };

  const saveMilestone = async () => {
    if (!id) return;
    const { error } = await supabase.from('engagements').update({ current_milestone: milestoneDraft }).eq('id', id);
    if (error) { toast.error('Failed to update milestone'); return; }
    toast.success('Milestone updated');
    setEngagement((e) => e ? { ...e, current_milestone: milestoneDraft } : e);
  };

  const saveProposalModules = async () => {
    if (!proposal) return;
    let parsed: any;
    try { parsed = JSON.parse(modulesDraft); } catch { toast.error('Invalid JSON'); return; }
    const { error } = await supabase
      .from('proposal_requests')
      .update({ generated_modules: parsed, status: 'proposal_generated' })
      .eq('id', proposal.id);
    if (error) { toast.error('Failed to save proposal'); return; }
    toast.success('Proposal saved');
    setProposal({ ...proposal, generated_modules: parsed, status: 'proposal_generated' });
  };

  const sendProposal = async () => {
    if (!proposal) return;
    const { error } = await supabase
      .from('proposal_requests')
      .update({ status: 'proposal_sent', sent_at: new Date().toISOString() })
      .eq('id', proposal.id);
    if (error) { toast.error('Failed to send proposal'); return; }
    toast.success('Proposal sent to client');
    setProposal({ ...proposal, status: 'proposal_sent', sent_at: new Date().toISOString() });
  };

  if (!engagement) return <div className="p-8 text-muted-foreground">Loading…</div>;

  const modules: ProposalModule[] = Array.isArray(proposal?.generated_modules) ? proposal!.generated_modules : [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workspace</h1>
          <p className="text-sm text-muted-foreground">
            {isExpert ? 'Client' : 'Expert'}: <span className="font-medium">{counterpartyName}</span>
          </p>
        </div>
        <Badge variant={engagement.status === 'active' ? 'default' : 'secondary'}>{engagement.status}</Badge>
      </div>

      {isExpert && (
        <>
          <Card className="p-5 space-y-3">
            <h2 className="font-semibold">Client needs</h2>
            {!founderData ? (
              <p className="text-sm text-muted-foreground">No onboarding data yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {Object.entries(founderData.onboarding_profile || {}).slice(0, 12).map(([k, v]) => (
                  <div key={k} className="border rounded p-2">
                    <div className="text-xs uppercase text-muted-foreground">{k.replace(/_/g, ' ')}</div>
                    <div className="break-words">{typeof v === 'string' ? v : JSON.stringify(v)}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Proposal</h2>
              {proposal && (
                <Badge variant={proposal.status === 'proposal_sent' ? 'default' : 'secondary'}>
                  {proposal.status}{proposal.sent_at ? ` · ${format(new Date(proposal.sent_at), 'dd MMM')}` : ''}
                </Badge>
              )}
            </div>
            {!proposal ? (
              <p className="text-sm text-muted-foreground">No proposal request found for this client yet.</p>
            ) : (
              <>
                {modules.length > 0 && (
                  <div className="space-y-2">
                    {modules.map((m, i) => (
                      <div key={i} className="border rounded p-3 text-sm">
                        <div className="font-medium">{m.title || `Module ${i + 1}`}</div>
                        {m.objective && <div className="text-muted-foreground mt-1">{m.objective}</div>}
                        {m.timeline && <div className="text-xs mt-1">Timeline: {m.timeline}</div>}
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground">Modules JSON (edit to refine)</label>
                  <Textarea rows={10} className="font-mono text-xs" value={modulesDraft} onChange={(e) => setModulesDraft(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={saveProposalModules}>Save draft</Button>
                  <Button onClick={sendProposal}><Send className="w-4 h-4 mr-2" />Send to client</Button>
                </div>
              </>
            )}
          </Card>

          <Card className="p-5 space-y-3">
            <h2 className="font-semibold">Current milestone</h2>
            <div className="flex gap-2">
              <Input value={milestoneDraft} onChange={(e) => setMilestoneDraft(e.target.value)} placeholder="e.g. Kickoff & discovery" />
              <Button variant="outline" onClick={saveMilestone}>Save</Button>
            </div>
          </Card>
        </>
      )}

      <Card className="p-5 space-y-3">
        <h2 className="font-semibold">Updates</h2>
        <div className="space-y-3">
          {updates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No updates yet.</p>
          ) : updates.map((u) => (
            <div key={u.id} className="flex gap-3">
              <div className="pt-0.5">{iconFor(u.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span className="capitalize">{u.author_role}</span>
                  <span>·</span>
                  <span className="capitalize">{u.type.replace(/_/g, ' ')}</span>
                  <span>·</span>
                  <span>{format(new Date(u.created_at), 'dd MMM yyyy HH:mm')}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{u.content}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 pt-3 border-t">
          <Select value={type} onValueChange={(v) => setType(v as UpdateType)}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="note">Note</SelectItem>
              <SelectItem value="deliverable">Deliverable</SelectItem>
              <SelectItem value="milestone_completed">Milestone completed</SelectItem>
              <SelectItem value="next_step">Next step</SelectItem>
              {isExpert && <SelectItem value="suggestion">Suggestion for client</SelectItem>}
            </SelectContent>
          </Select>
          <Textarea
            rows={3}
            placeholder={isExpert ? 'Post a progress update or suggest something to your client…' : 'Add an update…'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button onClick={submitUpdate} disabled={submitting || !content.trim()}>Post update</Button>
        </div>
      </Card>
    </div>
  );
}
