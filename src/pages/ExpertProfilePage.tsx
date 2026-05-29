import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

const SCALEIT_BUCKETS = [
  'Navigate Ready', 'Expansion Ready', 'Raise Ready',
  'Finance Ready', 'Product Ready', 'Sales Ready',
  'Brand Ready', 'Enterprise Ready', 'Scale Ready',
  'Go-to-Market Ready', 'Hiring Ready', 'Ops Ready',
  'Legal Ready', 'Regulation Ready', 'AI Ready',
  'Data Ready', 'Partnerships Ready', 'Exit Ready',
  'Community Ready', 'PR & Comms Ready',
];

interface ExpertRow {
  id: string;
  user_id: string | null;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  linkedin_url: string | null;
  booking_url: string | null;
  scaleit_buckets: string[] | null;
  expertise_keywords: string[] | null;
  is_active: boolean | null;
}

export function ExpertProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expert, setExpert] = useState<ExpertRow | null>(null);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [bookingUrl, setBookingUrl] = useState('');
  const [buckets, setBuckets] = useState<string[]>([]);
  const [keywordsRaw, setKeywordsRaw] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from('experts')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const e = data as ExpertRow;
          setExpert(e);
          setName(e.name || '');
          setTitle(e.title || '');
          setBio(e.bio || '');
          setPhotoUrl(e.photo_url || '');
          setLinkedinUrl(e.linkedin_url || '');
          setBookingUrl(e.booking_url || '');
          setBuckets(e.scaleit_buckets || []);
          setKeywordsRaw((e.expertise_keywords || []).join(', '));
        }
        setLoading(false);
      });
  }, [user?.id]);

  const toggleBucket = (b: string) => {
    setBuckets((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    const keywords = keywordsRaw.split(',').map((k) => k.trim()).filter(Boolean);
    const payload = {
      bio: bio || null,
      photo_url: photoUrl || null,
      linkedin_url: linkedinUrl || null,
      booking_url: bookingUrl || null,
      scaleit_buckets: buckets,
      expertise_keywords: keywords,
      updated_at: new Date().toISOString(),
    };

    if (expert) {
      const { error } = await supabase.from('experts').update(payload).eq('id', expert.id);
      setSaving(false);
      if (error) { toast.error('Failed to save'); return; }
      toast.success('Profile updated');
    } else {
      const { data, error } = await supabase
        .from('experts')
        .insert({
          user_id: user.id,
          name,
          title: title || null,
          ...payload,
          is_active: false,
        })
        .select()
        .single();
      setSaving(false);
      if (error) { toast.error('Failed to apply'); return; }
      setExpert(data as ExpertRow);
      toast.success('Application submitted. Awaiting approval.');
    }
  };

  if (loading) {
    return <div className="p-8 text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {expert ? 'Your Expert Profile' : 'Apply to join the Scaleit team'}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {expert
            ? expert.is_active
              ? 'Your profile is live and visible to founders.'
              : 'Your profile is pending approval.'
            : 'Tell us about your expertise. An admin will review your application.'}
        </p>
      </div>

      <Card className="p-6 space-y-5">
        {!expert && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Florina Rossi" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. EU Grants & Ecosystem" />
            </div>
          </>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="photo">Photo URL</Label>
            <Input id="photo" value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="booking">Booking URL</Label>
            <Input id="booking" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://cal.com/…" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Scaleit buckets</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {SCALEIT_BUCKETS.map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={buckets.includes(b)} onCheckedChange={() => toggleBucket(b)} />
                <span>{b}</span>
              </label>
            ))}
          </div>
          {buckets.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {buckets.map((b) => <Badge key={b} variant="secondary" className="text-xs">{b}</Badge>)}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="keywords">Expertise keywords (comma-separated)</Label>
          <Input
            id="keywords"
            value={keywordsRaw}
            onChange={(e) => setKeywordsRaw(e.target.value)}
            placeholder="EU grants, Horizon Europe, deeptech"
          />
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={saving || (!expert && !name.trim())}>
            {saving ? 'Saving…' : expert ? 'Save changes' : 'Submit application'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
