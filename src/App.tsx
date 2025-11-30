import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { SidebarNav } from '@/components/SidebarNav';
import { TopTabs } from '@/components/TopTabs';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { DashboardPage } from '@/pages/DashboardPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PassportPage } from '@/pages/PassportPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { SignalsPage } from '@/pages/SignalsPage';
import { ToolsPage } from '@/pages/ToolsPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { TeamPage } from '@/pages/TeamPage';
import { FundraisingPage } from '@/pages/FundraisingPage';

function Layout() {
  return (
    <>
      <WelcomeTour />
      <div className="flex h-screen bg-gray-50">
        <SidebarNav />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopTabs />
          <div className="flex-1 overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <DashboardPage /> },
        { path: '/whisperer', element: <OnboardingPage /> },
        { path: '/onboarding', element: <OnboardingPage /> }, // Keep old route for compatibility
        { path: '/passport', element: <PassportPage /> },
        { path: '/roadmap', element: <RoadmapPage /> },
        { path: '/signals', element: <SignalsPage /> },
        { path: '/tools', element: <ToolsPage /> },
        { path: '/applications', element: <ApplicationsPage /> },
        { path: '/team', element: <TeamPage /> },
        { path: '/fundraising', element: <FundraisingPage /> },
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
