import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Settings, User, Shield, Bell } from 'lucide-react';

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const updatePassport = useStore((s) => s.updatePassport);
  const passport = useStore((s) => s.passport);

  const [profile, setProfile] = useState({
    full_name: '',
    company_name: '',
    linkedin_url: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfile({
            full_name: (data as any).full_name || '',
            company_name: (data as any).company_name || '',
            linkedin_url: (data as any).linkedin_url || '',
          });
        }
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        company_name: profile.company_name,
        linkedin_url: profile.linkedin_url,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', user.id);

    if (error) {
      toast({ title: 'Error saving profile', description: error.message, variant: 'destructive' });
    } else {
      // Sync to passport store so PassportView picks it up
      updatePassport({
        founderName: profile.full_name,
        startupName: profile.company_name || passport.startupName,
      });
      toast({ title: 'Profile saved', description: 'Your account details have been updated.' });
    }
    setLoading(false);
  };

  return (
    <div className="p-8 space-y-6 max-w-3xl">
      <ScreenTour
        screenKey="settings"
        title="Settings & Account ⚙️"
        description="Manage your profile details here so your Passport, Roadmap, and all sections stay in sync. Update once, reflected everywhere."
        icon={<Settings className="w-12 h-12 text-primary" />}
      />

      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Account Details */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Account Details</h2>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ''} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
          </div>
          <div>
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your full name"
            />
          </div>
          <div>
            <Label htmlFor="company_name">Organization / Startup Name</Label>
            <Input
              id="company_name"
              value={profile.company_name}
              onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              placeholder="Your organization name"
            />
          </div>
          <div>
            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
            <Input
              id="linkedin_url"
              value={profile.linkedin_url}
              onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Card>

      {/* Notifications */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
        </div>
        <p className="text-sm text-muted-foreground">Notification preferences coming soon.</p>
      </Card>

      {/* Security */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Security</h2>
        </div>
        <div className="space-y-3">
          <Button variant="outline" onClick={() => {
            supabase.auth.resetPasswordForEmail(user?.email || '', {
              redirectTo: `${window.location.origin}/reset-password`,
            });
            toast({ title: 'Password reset email sent', description: 'Check your inbox for a reset link.' });
          }}>
            Change Password
          </Button>
          <Separator />
          <Button variant="destructive" onClick={signOut}>
            Log Out
          </Button>
        </div>
      </Card>
    </div>
  );
}
