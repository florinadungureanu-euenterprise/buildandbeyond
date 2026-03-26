import { ToolsList } from '@/components/tools/ToolsList';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { Wrench } from 'lucide-react';

export function ToolsPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="tools"
        title="Your Matched Toolstack 🛠️"
        description="Outcome: Stop wasting time researching tools.\n\nCurated tools matched to your stage, industry, and roadmap. From dev platforms and automation to payments and AI, only what fits your build."
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
