import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { MessageSquare, Plus, ThumbsUp, MessageCircle, Search, Filter } from 'lucide-react';

type PostCategory = 'general' | 'hiring' | 'updates' | 'events' | 'resources' | 'feedback';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: PostCategory;
  industry: string;
  likes: number;
  replies: number;
  createdAt: Date;
  liked: boolean;
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

const examplePosts: ForumPost[] = [
  {
    id: '1', title: 'Looking for a React developer for our MVP',
    content: 'We are building a HealthTech platform and need a senior React developer for 3 months. Remote-friendly, equity available.',
    author: 'Maria S.', category: 'hiring', industry: 'HealthTech', likes: 12, replies: 5, createdAt: new Date('2026-03-24'), liked: false,
  },
  {
    id: '2', title: 'Just closed our pre-seed round!',
    content: 'Excited to share that we raised 350K from angel investors. Happy to share learnings with fellow founders.',
    author: 'Thomas K.', category: 'updates', industry: 'FinTech', likes: 34, replies: 12, createdAt: new Date('2026-03-23'), liked: false,
  },
  {
    id: '3', title: 'Best tools for customer discovery interviews?',
    content: 'Starting our validation phase. What tools and frameworks do you recommend for running customer discovery?',
    author: 'Leila M.', category: 'resources', industry: 'SaaS', likes: 8, replies: 7, createdAt: new Date('2026-03-22'), liked: false,
  },
];

export function CommunityPage() {
  const [posts, setPosts] = useState<ForumPost[]>(examplePosts);
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'general' as PostCategory, industry: 'Technology' });

  const filtered = posts.filter((p) => {
    if (selectedIndustry !== 'All Industries' && p.industry !== selectedIndustry) return false;
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery && !p.title.toLowerCase().includes(searchQuery.toLowerCase()) && !p.content.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleLike = (id: string) => {
    setPosts(posts.map((p) => p.id === id ? { ...p, likes: p.liked ? p.likes - 1 : p.likes + 1, liked: !p.liked } : p));
  };

  const handleCreatePost = () => {
    const post: ForumPost = {
      id: Date.now().toString(),
      ...newPost,
      author: 'You',
      likes: 0,
      replies: 0,
      createdAt: new Date(),
      liked: false,
    };
    setPosts([post, ...posts]);
    setShowNewPost(false);
    setNewPost({ title: '', content: '', category: 'general', industry: 'Technology' });
  };

  const categoryColor: Record<PostCategory, string> = {
    general: 'bg-muted text-muted-foreground',
    hiring: 'bg-orange-100 text-orange-700',
    updates: 'bg-green-100 text-green-700',
    events: 'bg-purple-100 text-purple-700',
    resources: 'bg-blue-100 text-blue-700',
    feedback: 'bg-yellow-100 text-yellow-700',
  };

  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="community"
        title="Community Forums 🌐"
        description="Connect with founders, talent, and partners in your industry. Share updates, find collaborators, promote events, and get feedback from people who understand your journey."
        icon={<MessageSquare className="w-12 h-12 text-primary" />}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Community</h1>
          <p className="mt-2 text-muted-foreground">Connect, share, and grow with fellow founders</p>
        </div>
        <Button onClick={() => setShowNewPost(true)} className="gap-2">
          <Plus className="w-4 h-4" /> New Post
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
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
        {filtered.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No posts found. Be the first to start a discussion!</p>
          </Card>
        )}
        {filtered.map((post) => (
          <Card key={post.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{post.title}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">{post.author}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{post.createdAt.toLocaleDateString()}</span>
                  <Badge className={categoryColor[post.category]} variant="secondary">{categories.find(c => c.value === post.category)?.label}</Badge>
                  <Badge variant="outline" className="text-xs">{post.industry}</Badge>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => handleLike(post.id)}>
                <ThumbsUp className={`w-3.5 h-3.5 ${post.liked ? 'fill-primary text-primary' : ''}`} />
                {post.likes}
              </Button>
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                <MessageCircle className="w-3.5 h-3.5" />
                {post.replies} replies
              </Button>
            </div>
          </Card>
        ))}
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
            <Button onClick={handleCreatePost} disabled={!newPost.title || !newPost.content}>Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
