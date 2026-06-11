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
import { Upload } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const SCALEIT_BUCKETS = [
  'Navigate Ready', 'Expansion Ready', 'Raise Ready',
  'Finance Ready', 'Product Ready', 'Sales Ready',
  'Brand Ready', 'Enterprise Ready', 'Scale Ready',
  'Go-to-Market Ready', 'Hiring Ready', 'Ops Ready',
  'Legal Ready', 'Regulation Ready', 'AI Ready',
  'Data Ready', 'Partnerships Ready', 'Exit Ready',
  'Community Ready', 'PR & Comms Ready',
];

// Display helper: strip " Ready" suffix while keeping stored values intact for compatibility
export const displayBucket = (b: string) => b.replace(/\s*Ready$/i, '').trim();


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
  notable_projects: string | null;
  achievements: string | null;
  companies: string | null;
  what_makes_you_happy: string | null;
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
  const [customBucket, setCustomBucket] = useState('');
  const [notableProjects, setNotableProjects] = useState('');
  const [achievements, setAchievements] = useState('');
  const [companies, setCompanies] = useState('');
  const [whatMakesYouHappy, setWhatMakesYouHappy] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    if (!user?.id) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    setUploadingPhoto(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${user.id}/photo-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from('expert-photos')
      .upload(path, file, { cacheControl: '3600', upsert: true });
    if (upErr) {
      setUploadingPhoto(false);
      toast.error('Upload failed: ' + upErr.message);
      return;
    }
    const { data: pub } = supabase.storage.from('expert-photos').getPublicUrl(path);
    setPhotoUrl(pub.publicUrl);
    setUploadingPhoto(false);
    toast.success('Photo uploaded. Remember to save changes.');
  };

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
          setNotableProjects(e.notable_projects || '');
          setAchievements(e.achievements || '');
          setCompanies(e.companies || '');
          setWhatMakesYouHappy(e.what_makes_you_happy || '');
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
      notable_projects: notableProjects || null,
      achievements: achievements || null,
      companies: companies || null,
      what_makes_you_happy: whatMakesYouHappy || null,
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

      <p className="text-sm text-muted-foreground leading-relaxed">
        As a Scaleit expert, your profile helps founders discover you based on the areas you advise on.
        Once approved, you will be able to review client needs, craft proposals, track delivery progress,
        and suggest additional support — all within your dedicated engagement workspace.
      </p>

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

        <div className="space-y-1.5">
          <Label htmlFor="companies">Companies you've worked for or with</Label>
          <Textarea
            id="companies"
            rows={3}
            value={companies}
            onChange={(e) => setCompanies(e.target.value)}
            placeholder="e.g. Startupbootcamp, TNW, Heineken, Kraft Heinz, AI4ALL Amsterdam"
          />
          <p className="text-xs text-muted-foreground">Roles, employers, or notable corporate/programme collaborations.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="projects">Notable projects you've worked on</Label>
          <Textarea
            id="projects"
            rows={4}
            value={notableProjects}
            onChange={(e) => setNotableProjects(e.target.value)}
            placeholder="e.g. Led AMS Startup Booster programme (NPS 9.8); ran FUTRXPO with 3,000+ attendees; supported 300+ startups through Startupbootcamp."
          />
          <p className="text-xs text-muted-foreground">Programmes you've built or led, founders you've supported, ventures you've taken to the next stage.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="achievements">Achievements</Label>
          <Textarea
            id="achievements"
            rows={3}
            value={achievements}
            onChange={(e) => setAchievements(e.target.value)}
            placeholder="e.g. MSc Digital Business at UvA; Oxford Saïd Private Market Investments; closed €X in non-dilutive funding for portfolio companies."
          />
          <p className="text-xs text-muted-foreground">Credentials, awards, deals closed, outcomes you're proud of.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="happy">What makes you happy about what you do?</Label>
          <Textarea
            id="happy"
            rows={3}
            value={whatMakesYouHappy}
            onChange={(e) => setWhatMakesYouHappy(e.target.value)}
            placeholder="What gives you energy when you sit down to work with founders?"
          />
          <p className="text-xs text-muted-foreground">Helps us match you to founders whose challenges actually light you up.</p>
        </div>

        <div className="space-y-1.5">
          <Label>Profile photo</Label>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20 border border-border">
              {photoUrl ? <AvatarImage src={photoUrl} alt="Profile" /> : null}
              <AvatarFallback className="text-lg font-semibold">
                {(name || 'Y').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5">
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(file);
                  e.target.value = '';
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingPhoto}
                onClick={() => document.getElementById('photo-upload')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploadingPhoto ? 'Uploading…' : photoUrl ? 'Replace photo' : 'Upload photo'}
              </Button>
              {photoUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-2 text-muted-foreground"
                  onClick={() => setPhotoUrl('')}
                >
                  Remove
                </Button>
              )}
              <p className="text-xs text-muted-foreground">PNG or JPG, up to 5MB.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="linkedin">LinkedIn URL</Label>
            <Input id="linkedin" value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="booking">Booking URL</Label>
            <Input id="booking" value={bookingUrl} onChange={(e) => setBookingUrl(e.target.value)} placeholder="https://cal.com/…" />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Scaleit buckets</Label>
          <p className="text-xs text-muted-foreground">Pick the areas you advise on. You can also add your own.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Array.from(new Set([...SCALEIT_BUCKETS, ...buckets])).map((b) => (
              <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox checked={buckets.includes(b)} onCheckedChange={() => toggleBucket(b)} />
                <span>{b}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <Input
              placeholder="Add your own (comma-separated, or one at a time)"
              value={customBucket}
              onChange={(e) => setCustomBucket(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const additions = customBucket
                    .split(',')
                    .map((s) => s.trim())
                    .filter((s) => s && !buckets.includes(s));
                  if (additions.length) setBuckets([...buckets, ...additions]);
                  setCustomBucket('');
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const additions = customBucket
                  .split(',')
                  .map((s) => s.trim())
                  .filter((s) => s && !buckets.includes(s));
                if (additions.length) setBuckets([...buckets, ...additions]);
                setCustomBucket('');
              }}
            >
              Add
            </Button>
          </div>
          {buckets.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-2">
              {buckets.map((b) => (
                <Badge key={b} variant="secondary" className="text-xs cursor-pointer" onClick={() => toggleBucket(b)}>
                  {b} ×
                </Badge>
              ))}
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
