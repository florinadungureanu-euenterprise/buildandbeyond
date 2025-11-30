import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/whisperer', label: 'Your Entrepreneur Whisperer' },
  { path: '/', label: 'Dashboard' }
];

export function TopTabs() {
  const location = useLocation();

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center px-8 py-4">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path || 
                            (tab.path === '/whisperer' && location.pathname === '/onboarding');
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  'pb-3 border-b-2 font-medium text-sm transition-colors',
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
