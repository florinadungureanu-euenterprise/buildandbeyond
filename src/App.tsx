import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/SidebarNav';
import { TopTabs } from '@/components/TopTabs';
import { DashboardPage } from '@/pages/DashboardPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PassportPage } from '@/pages/PassportPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { SignalsPage } from '@/pages/SignalsPage';
import { ToolsPage } from '@/pages/ToolsPage';

function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopTabs />
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <DashboardPage /> },
        { path: '/onboarding', element: <OnboardingPage /> },
        { path: '/passport', element: <PassportPage /> },
        { path: '/roadmap', element: <RoadmapPage /> },
        { path: '/signals', element: <SignalsPage /> },
        { path: '/tools', element: <ToolsPage /> },
        { path: '*', element: <DashboardPage /> }
      ]
    }
  ],
  {
    future: {
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
