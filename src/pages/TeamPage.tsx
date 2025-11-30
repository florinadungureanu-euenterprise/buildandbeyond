import { TeamManagement } from '@/components/team/TeamManagement';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Users } from 'lucide-react';

export function TeamPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="team"
        title="Team Alignment & Collaboration 👥"
        description="Invite teammates, advisors, or collaborators to follow the roadmap, share updates, and align priorities — all in one place.\n\nKeep everyone synchronized as you build."
        icon={<Users className="w-12 h-12 text-primary" />}
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <p className="mt-2 text-gray-600">Manage your team members and their roles</p>
      </div>
      <TeamManagement />
    </div>
  );
}
