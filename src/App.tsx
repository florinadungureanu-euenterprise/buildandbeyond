import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
import { SidebarNav } from '@/components/SidebarNav';
import { TopTabs } from '@/components/TopTabs';
import { WelcomeTour } from '@/components/onboarding/WelcomeTour';
import { useDataSync } from '@/hooks/useDataSync';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { DashboardPage } from '@/pages/DashboardPage';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { PassportPage } from '@/pages/PassportPage';
import { RoadmapPage } from '@/pages/RoadmapPage';
import { SignalsPage } from '@/pages/SignalsPage';
import { ToolsPage } from '@/pages/ToolsPage';
import { ApplicationsPage } from '@/pages/ApplicationsPage';
import { TeamPage } from '@/pages/TeamPage';
import { FundraisingPage } from '@/pages/FundraisingPage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted/30">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function Layout() {
  useDataSync();

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}

const router = createBrowserRouter(
  [
    {
      element: <Layout />,
      children: [
        { path: '/', element: <DashboardPage /> },
        { path: '/whisperer', element: <OnboardingPage /> },
        { path: '/onboarding', element: <OnboardingPage /> },
        { path: '/passport', element: <PassportPage /> },
        { path: '/roadmap', element: <RoadmapPage /> },
        { path: '/signals', element: <SignalsPage /> },
        { path: '/tools', element: <ToolsPage /> },
        { path: '/applications', element: <ApplicationsPage /> },
        { path: '/team', element: <TeamPage /> },
        { path: '/fundraising', element: <FundraisingPage /> },
      ]
    },
    { path: '/login', element: <LoginPage /> },
    { path: '/signup', element: <SignupPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
    { path: '*', element: <Navigate to="/" replace /> }
  ],
  {
    future: {
      v7_relativeSplatPath: true
    }
  }
);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
