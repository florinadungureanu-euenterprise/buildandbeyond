import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';

export function RoadmapWidget() {
  const navigate = useNavigate();
  const twoWeekTasks = useStore((state) => state.twoWeekTasks);
  const threeMonthMilestones = useStore((state) => state.threeMonthMilestones);

  const twoWeekCompleted = twoWeekTasks.filter((t) => t.completed).length;
  const twoWeekTotal = twoWeekTasks.length;
  const twoWeekProgress = (twoWeekCompleted / twoWeekTotal) * 100;

  const threeMonthCompleted = threeMonthMilestones.filter((m) => m.completed).length;
  const threeMonthTotal = threeMonthMilestones.length;
  const threeMonthProgress = (threeMonthCompleted / threeMonthTotal) * 100;

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Roadmap</h3>
        <div className="text-xs text-gray-500">Auto-updated</div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-900">Next 2 Weeks</div>
            <div className="text-xs text-gray-500">
              {twoWeekCompleted}/{twoWeekTotal} Complete
            </div>
          </div>
          <div
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(twoWeekProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Two week tasks progress"
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${twoWeekProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {twoWeekTasks
              .filter((t) => !t.completed)
              .slice(0, 2)
              .map((t) => t.title)
              .join(', ')}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-900">Next 3 Months</div>
            <div className="text-xs text-gray-500">
              {threeMonthCompleted}/{threeMonthTotal} Complete
            </div>
          </div>
          <div
            className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(threeMonthProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Three month milestones progress"
          >
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${threeMonthProgress}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-2">
            {threeMonthMilestones
              .filter((m) => !m.completed)
              .slice(0, 2)
              .map((m) => m.title)
              .join(', ')}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => navigate('/roadmap')}
          className="w-full py-2 text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors"
        >
          View Detailed Roadmap
        </button>
      </div>
    </Card>
  );
}
