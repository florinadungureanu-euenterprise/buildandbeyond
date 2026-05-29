import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export async function shareToSlack(text: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast({ title: 'Not signed in', variant: 'destructive' });
    return;
  }
  const { data } = await supabase
    .from('profiles')
    .select('webhook_url')
    .eq('id', user.id)
    .maybeSingle();
  const url = (data as any)?.webhook_url;
  if (!url) {
    toast({ title: 'Connect Slack in Integrations to share' });
    return;
  }
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
      mode: 'no-cors',
    });
    toast({ title: 'Shared to Slack!' });
  } catch (e) {
    console.error('Slack share failed', e);
    toast({ title: 'Failed to share to Slack', variant: 'destructive' });
  }
}
