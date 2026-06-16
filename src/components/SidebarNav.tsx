import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  LogOut,
  MessageSquare,
  LayoutDashboard,
  Map,
  Activity,
  IdCard,
  Wrench,
  FileText,
  Inbox,
  Briefcase,
  Calendar,
  PiggyBank,
  Users,
  Plug,
  UserCog,
  Settings,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

type NavItem = { path: string; label: string; icon: React.ComponentType<{ className?: string }> };
type NavGroup = { label: string; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: 'Strategy',
    items: [
      { path: '/whisperer', label: 'Whisperer', icon: MessageSquare },
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/roadmap', label: 'Roadmap', icon: Map },
      { path: '/signals', label: 'Market Signals', icon: Activity },
      { path: '/passport', label: 'Passport', icon: IdCard },
    ],
  },
  {
    label: 'Execution',
    items: [
      { path: '/tools', label: 'Tools', icon: Wrench },
      { path: '/applications', label: 'Applications', icon: FileText },
      { path: '/my-proposals', label: 'My Proposals', icon: Inbox },
      { path: '/engagements', label: 'Consulting projects', icon: Briefcase },
      { path: '/fundraising', label: 'Fundraising', icon: PiggyBank },
    ],
  },
  {
    label: 'Network',
    items: [
      { path: '/team', label: 'Experts', icon: Users },
      { path: '/community', label: 'Community', icon: UserCheck },
      { path: '/events', label: 'Events', icon: Calendar },
      { path: '/integrations', label: 'Integrations', icon: Plug },
    ],
  },
];

export function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isApprovedExpert, setIsApprovedExpert] = useState(false);

  useEffect(() => {
    if (!user?.id) { setIsApprovedExpert(false); return; }
    supabase
      .from('experts')
      .select('is_active')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => setIsApprovedExpert(!!(data && (data as any).is_active)));
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const groups: NavGroup[] = isApprovedExpert
    ? [
        ...navGroups,
        { label: 'Expert', items: [{ path: '/expert-profile', label: 'Expert Profile', icon: UserCog }] },
      ]
    : navGroups;

  const isActivePath = (path: string) =>
    location.pathname === path || (path === '/whisperer' && location.pathname === '/onboarding');

  return (
    <nav className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 pb-4">
        <Link to="/" className="block">
          <div className="text-2xl font-bold text-blue-600">Build &</div>
          <div className="text-xl font-bold text-blue-600">Beyond</div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50',
                    )}
                  >
                    <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-blue-600' : 'text-gray-400')} />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="px-3 py-4 border-t border-gray-200 space-y-0.5">
        <Link
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          Settings
        </Link>
        {!isApprovedExpert && user && (
          <Link
            to="/expert-profile"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <UserCog className="w-4 h-4 text-gray-400" />
            Expert Profile
          </Link>
        )}
        <Link
          to="/admin"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          Admin
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </nav>
  );
}
