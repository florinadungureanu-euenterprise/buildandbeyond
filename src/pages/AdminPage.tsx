import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Shield, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Handshake, MessageSquare, TrendingUp, Rocket } from 'lucide-react';
import { format } from 'date-fns';
import { ProposalRequestsTab } from '@/components/admin/ProposalRequestsTab';

interface PartnerSubmission {
  id: string;
  type: string;
  company_name: string;
  contact_name: string;
  email: string;
  website: string | null;
  status: string;
  created_at: string;
  services_offered: string | null;
  geographic_coverage: string | null;
  description: string | null;
}

interface ForumPost {
  id: string;
  title: string;
  category: string;
  industry: string;
  user_id: string;
  created_at: string;
}

interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  linkedin_url: string | null;
}

interface ExpertRow {
  id: string;
  name: string;
  title: string | null;
  scaleit_buckets: string[] | null;
  is_active: boolean | null;
  booking_url: string | null;
  created_at: string;
}

const partnerTypeLabels: Record<string, string> = {
  programme: 'Venture Building',
  investor: 'Investor',
  service_provider: 'Service Provider',
  event_organizer: 'Event Organizer',
  community: 'Community',
  corporate: 'Corporate',
  public_institution: 'Public Institution',
  venue: 'Venue / Hub',
  freelancer: 'Freelancer',
};

const statusColors: Record<string, string> = {
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  reviewed: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

const ADMIN_AUTH_KEY = 'bb_admin_auth';

export function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');
  const [partners, setPartners] = useState<PartnerSubmission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [proposalRequests, setProposalRequests] = useState<any[]>([]);
  const [experts, setExperts] = useState<ExpertRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Verify admin access via server-side function (is_admin RPC backed by user_roles + RLS)
  const verifyAdmin = useCallback(async () => {
    const { data } = await supabase.rpc('is_admin');
    return data === true;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setChecking(false);
      setError('You must be signed in to access the admin dashboard.');
      return;
    }
    verifyAdmin().then((ok) => {
      if (ok) {
        setAuthenticated(true);
        sessionStorage.setItem(ADMIN_AUTH_KEY, 'verified');
      } else {
        sessionStorage.removeItem(ADMIN_AUTH_KEY);
        setError('Access denied. You are not authorized.');
      }
      setChecking(false);
    });
  }, [user, authLoading, verifyAdmin]);


  useEffect(() => {
    if (authenticated) loadAllData();
  }, [authenticated]);

  const loadAllData = async () => {
    setLoading(true);
    const [partnersRes, profilesRes, postsRes, repliesRes, proposalsRes, expertsRes] = await Promise.all([
      supabase.from('partner_submissions' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('forum_replies').select('*').order('created_at', { ascending: false }),
      supabase.from('proposal_requests' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('experts').select('*').order('created_at', { ascending: true }),
    ]);

    if (partnersRes.data) setPartners(partnersRes.data as any);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (postsRes.data) setPosts(postsRes.data);
    if (repliesRes.data) setReplies(repliesRes.data);
    if (proposalsRes.data) setProposalRequests(proposalsRes.data as any);
    if (expertsRes.data) setExperts(expertsRes.data as ExpertRow[]);
    setLoading(false);
  };

  const toggleExpertActive = async (id: string, current: boolean | null) => {
    const { error } = await supabase.from('experts').update({ is_active: !current }).eq('id', id);
    if (error) { return; }
    setExperts((prev) => prev.map((e) => (e.id === id ? { ...e, is_active: !current } : e)));
  };

  const saveExpertBookingUrl = async (id: string, value: string) => {
    await supabase.from('experts').update({ booking_url: value || null }).eq('id', id);
    setExperts((prev) => prev.map((e) => (e.id === id ? { ...e, booking_url: value || null } : e)));
  };

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentPartners = partners.filter(p => new Date(p.created_at) > weekAgo).length;
  const recentPosts = posts.filter(p => new Date(p.created_at) > weekAgo).length;

  if (!authenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-muted/30">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 p-3 rounded-full bg-primary/10 w-fit">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <p className="text-sm text-muted-foreground">Enter the admin password to continue</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <Input
                type="password"
                placeholder="Admin password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">Unlock Dashboard</Button>
            </form>
            <div className="mt-6 p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">GDPR Compliance</span>
              </div>
              <p className="text-xs text-muted-foreground">
                This dashboard displays personal data (names, emails) under legitimate interest (Art. 6(1)(f) GDPR). 
                Data is processed only for platform administration. Access is restricted to authorized personnel. 
                Session expires when you close the browser tab.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading admin data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform activity and submissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{profiles.length}</p>
                <p className="text-xs text-muted-foreground">Registered Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                <Handshake className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{partners.length}</p>
                <p className="text-xs text-muted-foreground">Partner Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/20">
                <Rocket className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{proposalRequests.length}</p>
                <p className="text-xs text-muted-foreground">Proposal Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                <MessageSquare className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-xs text-muted-foreground">Forum Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">+{recentPartners}</p>
                <p className="text-xs text-muted-foreground">New Partners (7d)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="proposals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="proposals">Proposals ({proposalRequests.length})</TabsTrigger>
          <TabsTrigger value="partners">Partners ({partners.length})</TabsTrigger>
          <TabsTrigger value="users">Users ({profiles.length})</TabsTrigger>
          <TabsTrigger value="forum">Forum ({posts.length})</TabsTrigger>
          <TabsTrigger value="experts">Experts ({experts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="proposals">
          <ProposalRequestsTab requests={proposalRequests} profiles={profiles} onRefresh={loadAllData} />
        </TabsContent>

        <TabsContent value="partners">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Handshake className="w-5 h-5" /> Partner Applications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {partners.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No partner applications yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Coverage</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {partners.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{format(new Date(p.created_at), 'dd MMM yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{partnerTypeLabels[p.type] || p.type}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{p.company_name}</TableCell>
                          <TableCell>{p.contact_name}</TableCell>
                          <TableCell className="text-xs">{p.email}</TableCell>
                          <TableCell className="text-xs">{p.geographic_coverage || '-'}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[p.status] || 'bg-muted text-muted-foreground'}`}>
                              {p.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Registered Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              {profiles.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No registered users yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Joined</TableHead>
                        <TableHead>Full Name</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>LinkedIn</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map(p => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{format(new Date(p.created_at), 'dd MMM yyyy')}</TableCell>
                          <TableCell className="font-medium">{p.full_name || 'Not set'}</TableCell>
                          <TableCell>{p.company_name || '-'}</TableCell>
                          <TableCell>
                            {p.linkedin_url ? (
                              <a href={p.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs">
                                Profile
                              </a>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forum">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Forum Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No forum posts yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Industry</TableHead>
                        <TableHead>Replies</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {posts.map(p => {
                        const replyCount = replies.filter(r => r.post_id === p.id).length;
                        return (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs">{format(new Date(p.created_at), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="font-medium">{p.title}</TableCell>
                            <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                            <TableCell className="text-xs">{p.industry}</TableCell>
                            <TableCell>{replyCount}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="experts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Experts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {experts.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No experts yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Scaleit Buckets</TableHead>
                        <TableHead>Booking URL</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {experts.map((e) => (
                        <TableRow key={e.id}>
                          <TableCell className="font-medium">{e.name}</TableCell>
                          <TableCell className="text-xs">{e.title || '-'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1 max-w-[260px]">
                              {(e.scaleit_buckets || []).map((b) => (
                                <Badge key={b} variant="outline" className="text-[10px]">{b}</Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              defaultValue={e.booking_url || ''}
                              placeholder="https://…"
                              className="text-xs h-8 min-w-[180px]"
                              onBlur={(ev) => {
                                if (ev.target.value !== (e.booking_url || '')) {
                                  saveExpertBookingUrl(e.id, ev.target.value);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Badge className={e.is_active ? statusColors.approved : statusColors.new}>
                              {e.is_active ? 'active' : 'pending'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={e.is_active ? 'outline' : 'default'}
                              onClick={() => toggleExpertActive(e.id, e.is_active)}
                            >
                              {e.is_active ? 'Deactivate' : 'Approve'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
