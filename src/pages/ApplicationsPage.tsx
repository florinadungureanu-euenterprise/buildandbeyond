import { ApplicationsList } from '@/components/applications/ApplicationsList';
import { ScreenTour } from '@/components/tours/ScreenTour';
import { FileCheck } from 'lucide-react';

export function ApplicationsPage() {
  return (
    <div className="p-8 space-y-6">
      <ScreenTour
        screenKey="applications"
        title="Apply to Programs & Opportunities 📝"
        description="Outcome: Apply to the right programs in minutes, not hours.\n\nAccelerators, grants, and partners matched to your stage. Your Passport autofills up to 80% of common application questions."
        icon={<FileCheck className="w-12 h-12 text-primary" />}
      />
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Program Applications</h1>
        <p className="mt-2 text-gray-600">Track your applications to accelerators and programs</p>
      </div>
      <ApplicationsList />
    </div>
  );
}
