import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Search, Send, Trash2, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { FounderMatching } from '@/components/matching/FounderMatching';

type PostCategory = 'general' | 'hiring' | 'updates' | 'events' | 'resources' | 'feedback';

interface ForumPost {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: PostCategory;
  industry: string;
  created_at: string;
  author_name: string;
  like_count: number;
  reply_count: number;
  user_liked: boolean;
}

interface ForumReply {
  id: string;
  post_id: string;
  user_id: string;
  parent_reply_id: string | null;
  content: string;
  created_at: string;
  author_name: string;
  like_count: number;
  user_liked: boolean;
  children: ForumReply[];
}

const industries = [
  'All Industries', 'Technology', 'HealthTech', 'FinTech', 'CleanTech', 'EdTech',
  'AI / ML', 'SaaS', 'E-commerce', 'IoT', 'Biotech', 'AgriTech', 'Other'
];

const categories: { value: PostCategory; label: string }[] = [
  { value: 'general', label: 'General Discussion' },
  { value: 'hiring', label: 'Hiring & Talent' },
  { value: 'updates', label: 'Updates & Milestones' },
  { value: 'events', label: 'Events' },
  { value: 'resources', label: 'Resources & Tools' },
  { value: 'feedback', label: 'Feedback & Ideas' },
];

const categoryColor: Record<PostCategory, string> = {
  general: 'bg-muted text-muted-foreground',
  hiring: 'bg-orange-100 text-orange-700',
  updates: 'bg-green-100 text-green-700',
  events: 'bg-purple-100 text-purple-700',
  resources: 'bg-blue-100 text-blue-700',
  feedback: 'bg-yellow-100 text-yellow-700',
};

function ReplyThread({ reply, postId, userId, onReplyAdded, onLike, onDelete }: {
  reply: ForumReply;
  postId: string;
  userId: string;
  onReplyAdded: () => void;
  onLike: (replyId: string, liked: boolean) => void;
  onDelete: (replyId: string) => void;
}) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('forum_replies' as any).insert({
      post_id: postId,
      user_id: userId,
      parent_reply_id: reply.id,
      content: replyContent.trim(),
    } as any);
    setSubmitting(false);
    if (error) { toast.error('Failed to post reply'); return; }
    setReplyContent('');
    setShowReplyInput(false);
    onReplyAdded();
  };

  return (
    <div className="ml-4 border-l-2 border-border pl-4 mt-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        <span className="font-medium text-foreground">{reply.author_name}</span>
        <span>·</span>
        <span>{new Date(reply.created_at).toLocaleDateString()}</span>
      </div>
      <p className="text-sm text-foreground mb-2">{reply.content}</p>
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1 text-xs h-7 px-2" onClick={() => onLike(reply.id, reply.user_liked)}>
          <ThumbsUp className={`w-3 h-3 ${reply.user_liked ? 'fill-primary text-primary' : ''}`} />
          {reply.like_count}
        </Button>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setShowReplyInput(!showReplyInput)}>Reply</Button>
        {reply.user_id === userId && (
          <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-destructive" onClick={() => onDelete(reply.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
      {showReplyInput && (
        <div className="flex gap-2 mt-2">
          <Input placeholder="Write a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()} />
          <Button size="sm" onClick={handleSubmitReply} disabled={submitting || !replyContent.trim()}><Send className="w-3.5 h-3.5" /></Button>
        </div>
      )}
      {reply.children.map((child) => (
        <ReplyThread key={child.id} reply={child} postId={postId} userId={userId} onReplyAdded={onReplyAdded} onLike={onLike} onDelete={onDelete} />
      ))}
    </div>
  );
}

function PostCard({ post, userId, onRefresh }: { post: ForumPost; userId: string; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadReplies = useCallback(async () => {
    setLoadingReplies(true);
    const { data: repliesData } = await supabase.from('forum_replies' as any).select('*').eq('post_id', post.id).order('created_at', { ascending: true }) as any;
    const { data: likesData } = await supabase.from('forum_likes' as any).select('reply_id').eq('user_id', userId).not('reply_id', 'is', null) as any;
    const { data: allLikes } = await supabase.from('forum_likes' as any).select('reply_id') as any;

    const likedReplyIds = new Set((likesData || []).map((l: any) => l.reply_id));
    const likeCounts: Record<string, number> = {};
    (allLikes || []).forEach((l: any) => { if (l.reply_id) likeCounts[l.reply_id] = (likeCounts[l.reply_id] || 0) + 1; });

    // Build tree
    const flat = (repliesData || []).map((r: any) => ({
      ...r,
      author_name: r.user_id === userId ? 'You' : r.user_id.slice(0, 8),
      like_count: likeCounts[r.id] || 0,
      user_liked: likedReplyIds.has(r.id),
      children: [] as ForumReply[],
    }));

    // Load profile names
    const userIds = [...new Set(flat.map((r: any) => r.user_id))] as string[];
    if (userIds.length > 0) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', userIds);
      const nameMap: Record<string, string> = {};
      (profiles || []).forEach((p) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });
      flat.forEach((r: any) => { if (r.user_id !== userId) r.author_name = nameMap[r.user_id] || r.user_id.slice(0, 8); });
    }

    const map: Record<string, ForumReply> = {};
    flat.forEach((r: any) => { map[r.id] = r; });
    const tree: ForumReply[] = [];
    flat.forEach((r: any) => {
      if (r.parent_reply_id && map[r.parent_reply_id]) {
        map[r.parent_reply_id].children.push(r);
      } else {
        tree.push(r);
      }
    });

    setReplies(tree);
    setLoadingReplies(false);
  }, [post.id, userId]);

  useEffect(() => { if (expanded) loadReplies(); }, [expanded, loadReplies]);

  const handleLikePost = async () => {
    if (post.user_liked) {
      await supabase.from('forum_likes' as any).delete().eq('user_id', userId).eq('post_id', post.id);
    } else {
      await supabase.from('forum_likes' as any).insert({ user_id: userId, post_id: post.id } as any);
    }
    onRefresh();
  };

  const handleLikeReply = async (replyId: string, liked: boolean) => {
    if (liked) {
      await supabase.from('forum_likes' as any).delete().eq('user_id', userId).eq('reply_id', replyId);
    } else {
      await supabase.from('forum_likes' as any).insert({ user_id: userId, reply_id: replyId } as any);
    }
    loadReplies();
  };

  const handleDeleteReply = async (replyId: string) => {
    await supabase.from('forum_replies' as any).delete().eq('id', replyId);
    loadReplies();
    onRefresh();
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;
    setSubmittingReply(true);
    const { error } = await supabase.from('forum_replies' as any).insert({
      post_id: post.id,
      user_id: userId,
      content: replyContent.trim(),
    } as any);
    setSubmittingReply(false);
    if (error) { toast.error('Failed to post reply'); return; }
    setReplyContent('');
    loadReplies();
    onRefresh();
  };

  const handleDeletePost = async () => {
    await supabase.from('forum_posts' as any).delete().eq('id', post.id);
    onRefresh();
  };

  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">{post.title}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-muted-foreground">{post.author_name}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
            <Badge className={categoryColor[post.category]} variant="secondary">{categories.find(c => c.value === post.category)?.label}</Badge>
            <Badge variant="outline" className="text-xs">{post.industry}</Badge>
          </div>
        </div>
        {post.user_id === userId && (
          <Button variant="ghost" size="sm" className="text-destructive" onClick={handleDeletePost}><Trash2 className="w-4 h-4" /></Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleLikePost}>
          <ThumbsUp className={`w-3.5 h-3.5 ${post.user_liked ? 'fill-primary text-primary' : ''}`} />
          {post.like_count}
        </Button>
        <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setExpanded(!expanded)}>
          <MessageCircle className="w-3.5 h-3.5" />
          {post.reply_count} replies
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-border pt-4">
          <div className="flex gap-2 mb-4">
            <Input placeholder="Write a reply..." value={replyContent} onChange={(e) => setReplyContent(e.target.value)} className="text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply()} />
            <Button size="sm" onClick={handleSubmitReply} disabled={submittingReply || !replyContent.trim()}><Send className="w-4 h-4" /></Button>
          </div>
          {loadingReplies ? (
            <p className="text-sm text-muted-foreground">Loading replies...</p>
          ) : replies.length === 0 ? (
            <p className="text-sm text-muted-foreground">No replies yet. Be the first!</p>
          ) : (
            replies.map((reply) => (
              <ReplyThread key={reply.id} reply={reply} postId={post.id} userId={userId} onReplyAdded={loadReplies} onLike={handleLikeReply} onDelete={handleDeleteReply} />
            ))
          )}
        </div>
      )}
    </Card>
  );
}

export function CommunityPage() {
  const { user } = useAuth();
  const userId = user?.id || '';

  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' as PostCategory, industry: 'Technology' });
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    let query = supabase.from('forum_posts' as any).select('*').order('created_at', { ascending: false }) as any;
    if (selectedIndustry !== 'All Industries') query = query.eq('industry', selectedIndustry);
    if (selectedCategory !== 'all') query = query.eq('category', selectedCategory);
    if (searchQuery) query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

    const { data: postsData, error } = await query;
    if (error) { console.error(error); setLoading(false); return; }

    const postIds = (postsData || []).map((p: any) => p.id);
    const userIds = [...new Set((postsData || []).map((p: any) => p.user_id))] as string[];

    // Batch fetch likes, reply counts, profiles
    const [likesRes, userLikesRes, repliesRes, profilesRes] = await Promise.all([
      supabase.from('forum_likes' as any).select('post_id').not('post_id', 'is', null) as any,
      supabase.from('forum_likes' as any).select('post_id').eq('user_id', userId).not('post_id', 'is', null) as any,
      supabase.from('forum_replies' as any).select('post_id') as any,
      userIds.length > 0 ? supabase.from('profiles').select('id, full_name').in('id', userIds) : { data: [] },
    ]);

    const likeCounts: Record<string, number> = {};
    (likesRes.data || []).forEach((l: any) => { if (l.post_id) likeCounts[l.post_id] = (likeCounts[l.post_id] || 0) + 1; });
    const userLikedSet = new Set((userLikesRes.data || []).map((l: any) => l.post_id));
    const replyCounts: Record<string, number> = {};
    (repliesRes.data || []).forEach((r: any) => { replyCounts[r.post_id] = (replyCounts[r.post_id] || 0) + 1; });
    const nameMap: Record<string, string> = {};
    ((profilesRes as any).data || []).forEach((p: any) => { nameMap[p.id] = p.full_name || p.id.slice(0, 8); });

    const enriched: ForumPost[] = (postsData || []).map((p: any) => ({
      ...p,
      author_name: p.user_id === userId ? 'You' : (nameMap[p.user_id] || p.user_id.slice(0, 8)),
      like_count: likeCounts[p.id] || 0,
      reply_count: replyCounts[p.id] || 0,
      user_liked: userLikedSet.has(p.id),
    }));

    setPosts(enriched);
    setLoading(false);
  }, [userId, selectedIndustry, selectedCategory, searchQuery]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('forum_posts' as any).insert({
      user_id: userId,
      title: newPost.title.trim(),
      content: newPost.content.trim(),
      category: newPost.category,
      industry: newPost.industry,
    } as any);
    setSubmitting(false);
    if (error) { toast.error('Failed to create post'); return; }
    toast.success('Post created!');
    setShowNewPost(false);
    setNewPost({ title: '', content: '', category: 'general', industry: 'Technology' });
    loadPosts();
  };

  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="community"
        title="Community Forums"
        description="Connect with founders, talent, and partners in your industry. Share updates, find collaborators, promote events, and get feedback from people who understand your journey."
        icon={<MessageSquare className="w-12 h-12 text-primary" />}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community</h1>
          <p className="mt-2 text-muted-foreground">Connect, share, and grow with fellow founders</p>
        </div>
      </div>

      <Tabs defaultValue="forum" className="w-full">
        <TabsList>
          <TabsTrigger value="forum" className="gap-1.5"><MessageSquare className="w-4 h-4" /> Forum</TabsTrigger>
          <TabsTrigger value="matching" className="gap-1.5"><Users className="w-4 h-4" /> Founder Matching</TabsTrigger>
        </TabsList>

        <TabsContent value="matching" className="mt-6">
          <FounderMatching />
        </TabsContent>

        <TabsContent value="forum" className="mt-6 space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowNewPost(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search posts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex gap-2 flex-wrap">
          <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory('all')}>All</Button>
          {categories.map((c) => (
            <Button key={c.value} variant={selectedCategory === c.value ? 'default' : 'outline'} size="sm" onClick={() => setSelectedCategory(c.value)}>
              {c.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-8 text-center"><p className="text-muted-foreground">Loading posts...</p></Card>
        ) : posts.length === 0 ? (
          <Card className="p-8 text-center"><p className="text-muted-foreground">No posts found. Be the first to start a discussion!</p></Card>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} userId={userId} onRefresh={loadPosts} />)
        )}
      </div>

      {/* New Post Dialog */}
      <Dialog open={showNewPost} onOpenChange={setShowNewPost}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create a Post</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Post title" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
            <Textarea placeholder="What do you want to share?" value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} rows={4} />
            <div className="flex gap-3">
              <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v as PostCategory })}>
                <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={newPost.industry} onValueChange={(v) => setNewPost({ ...newPost, industry: v })}>
                <SelectTrigger><SelectValue placeholder="Industry" /></SelectTrigger>
                <SelectContent>
                  {industries.filter(i => i !== 'All Industries').map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPost(false)}>Cancel</Button>
            <Button onClick={handleCreatePost} disabled={submitting || !newPost.title || !newPost.content}>
              {submitting ? 'Posting...' : 'Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
