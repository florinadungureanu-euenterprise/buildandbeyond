import { ToolsList } from '@/components/tools/ToolsList';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Wrench } from 'lucide-react';

export function ToolsPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="tools"
        title="Recommended Tools for Your Build 🛠️"
        description="Here you'll find the best tools matched to your idea or organization — from data and automation to UI, payments, and AI.\n\nWe only recommend what fits your roadmap and stage."
        icon={<Wrench className="w-12 h-12 text-primary" />}
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Recommended Tools</h1>
        <p className="mt-2 text-gray-600">Tools and technologies matched to your needs</p>
      </div>
      <ToolsList />
    </div>
  );
}
