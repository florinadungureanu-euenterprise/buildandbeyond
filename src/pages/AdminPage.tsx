import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Handshake, MessageSquare, TrendingUp, Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

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

export function AdminPage() {
  const [partners, setPartners] = useState<PartnerSubmission[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [partnersRes, profilesRes, postsRes, repliesRes] = await Promise.all([
      supabase.from('partner_submissions' as any).select('*').order('created_at', { ascending: false }),
      supabase.from('profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('forum_replies').select('*').order('created_at', { ascending: false }),
    ]);

    if (partnersRes.data) setPartners(partnersRes.data as any);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (postsRes.data) setPosts(postsRes.data);
    if (repliesRes.data) setReplies(repliesRes.data);
    setLoading(false);
  };

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentPartners = partners.filter(p => new Date(p.created_at) > weekAgo).length;
  const recentPosts = posts.filter(p => new Date(p.created_at) > weekAgo).length;

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
      <Tabs defaultValue="partners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="partners">Partner Submissions ({partners.length})</TabsTrigger>
          <TabsTrigger value="users">Registered Users ({profiles.length})</TabsTrigger>
          <TabsTrigger value="forum">Forum Activity ({posts.length} posts, {replies.length} replies)</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
}
