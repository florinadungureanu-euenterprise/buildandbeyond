import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/whisperer', label: 'Your Entrepreneur Whisperer' },
  { path: '/', label: 'Dashboard' },
  { path: '/roadmap', label: 'Roadmap' },
  { path: '/signals', label: 'Market Signals' },
  { path: '/passport', label: 'Passport' },
  { path: '/tools', label: 'Tools' },
  { path: '/applications', label: 'Applications' },
  { path: '/team', label: 'Team' }
];

export function SidebarNav() {
  const location = useLocation();

  return (
    <nav className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
      <div className="mb-8">
        <div className="text-2xl font-bold text-blue-600">Founder</div>
        <div className="text-xs text-gray-500 mt-1">Platform</div>
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

      <div className="pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">Account</div>
        <button type="button" className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
          Settings
        </button>
      </div>
    </nav>
  );
}
