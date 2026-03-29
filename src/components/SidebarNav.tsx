import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { LogOut } from 'lucide-react';

const navItems = [
  { path: '/whisperer', label: 'Your Entrepreneur Whisperer' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/roadmap', label: 'Roadmap' },
  { path: '/signals', label: 'Market Signals' },
  { path: '/passport', label: 'Passport' },
  { path: '/tools', label: 'Tools' },
  { path: '/applications', label: 'Applications' },
  { path: '/events', label: 'Events' },
  { path: '/fundraising', label: 'Fundraising' },
  { path: '/community', label: 'Community' }
];

export function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="mb-8">
        <Link to="/" className="block">
          <div className="text-2xl font-bold text-blue-600">Build &</div>
          <div className="text-xl font-bold text-blue-600">Beyond</div>
        </Link>
      </div>

      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path ||
                          (item.path === '/whisperer' && location.pathname === '/onboarding');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-200 space-y-3">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Account</div>
        <Link to="/settings" className="block text-sm text-gray-700 hover:text-blue-600 transition-colors">
          Settings
        </Link>
        <Link to="/admin" className="block text-sm text-gray-700 hover:text-blue-600 transition-colors">
          Admin
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </nav>
  );
}
