import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, CheckCircle, Star, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

type UpdateType = 'note' | 'deliverable' | 'milestone_completed' | 'next_step';

interface Update {
  id: string;
  type: UpdateType;
  content: string;
  author_role: string;
  created_at: string;
}

const iconFor = (t: UpdateType) => {
  if (t === 'deliverable') return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (t === 'milestone_completed') return <Star className="w-4 h-4 text-yellow-600" />;
  if (t === 'next_step') return <ArrowRight className="w-4 h-4 text-blue-600" />;
  return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
};

export function EngagementWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [type, setType] = useState<UpdateType>('note');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!id) return;
    const { data } = await supabase
      .from('engagement_updates')
      .select('id, type, content, author_role, created_at')
      .eq('engagement_id', id)
      .order('created_at', { ascending: true });
    setUpdates((data || []) as Update[]);
  };

  useEffect(() => { load(); }, [id]);

  const submit = async () => {
    if (!content.trim() || !user?.id || !id) return;
    setSubmitting(true);
    const { error } = await supabase.from('engagement_updates').insert({
      engagement_id: id,
      author_id: user.id,
      author_role: 'founder',
      type,
      content: content.trim(),
    });
    setSubmitting(false);
    if (error) { toast.error('Failed to post'); return; }
    setContent('');
    load();
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Workspace</h1>

      <div className="space-y-3">
        {updates.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">No updates yet.</Card>
        ) : updates.map((u) => (
          <Card key={u.id} className="p-4 flex gap-3">
            <div className="pt-0.5">{iconFor(u.type)}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                <span className="capitalize">{u.author_role}</span>
                <span>·</span>
                <span>{format(new Date(u.created_at), 'dd MMM yyyy HH:mm')}</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{u.content}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-4 space-y-3">
        <Select value={type} onValueChange={(v) => setType(v as UpdateType)}>
          <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="note">Note</SelectItem>
            <SelectItem value="deliverable">Deliverable</SelectItem>
            <SelectItem value="milestone_completed">Milestone completed</SelectItem>
            <SelectItem value="next_step">Next step</SelectItem>
          </SelectContent>
        </Select>
        <Textarea rows={3} placeholder="Add an update…" value={content} onChange={(e) => setContent(e.target.value)} />
        <Button onClick={submit} disabled={submitting || !content.trim()}>Post update</Button>
      </Card>
    </div>
  );
}
