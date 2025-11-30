import { useStore } from '@/store';
import { AlertTriangle } from 'lucide-react';

export function AlertBanner() {
  const showAlert = useStore((state) => state.showComplianceAlert);
  const addComplianceTasks = useStore((state) => state.addComplianceTasks);
  const dismissAlert = useStore((state) => state.dismissComplianceAlert);

  if (!showAlert) return null;

  return (
    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 m-6 rounded">
      <div className="flex gap-3">
        <div className="flex-shrink-0 text-amber-600">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-amber-900 text-sm">
            Compliance Requirements Updated
          </div>
          <div className="text-amber-800 text-xs mt-1">
            New EU/28th regime guidelines detected. Your roadmap has been auto-updated with 3 new compliance milestones.
          </div>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={addComplianceTasks}
              className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-medium hover:bg-amber-200 transition-colors"
            >
              View Changes
            </button>
            <button
              type="button"
              onClick={dismissAlert}
              className="inline-block bg-transparent text-amber-600 px-2 py-1 rounded text-xs font-medium hover:bg-amber-50 transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
