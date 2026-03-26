import { RoadmapBoard12Month } from '@/components/roadmap/RoadmapBoard12Month';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Map } from 'lucide-react';

export function RoadmapPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="roadmap"
        title="Your Personalized Roadmap 🗺️"
        description="Outcome: Never wonder what to do next.\n\nA 12-month action plan auto-generated from your stage, goals, and industry. It adapts as your context changes."
        icon={<Map className="w-12 h-12 text-primary" />}
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">12-Month Roadmap</h1>
        <p className="mt-2 text-gray-600">Track your milestones and progress over the next year</p>
      </div>
      <RoadmapBoard12Month />
    </div>
  );
}
