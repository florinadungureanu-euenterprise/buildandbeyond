import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, Circle, Calendar, Target } from 'lucide-react';

const categoryColors: Record<string, string> = {
  product: 'bg-blue-100 text-blue-700 border-blue-200',
  market: 'bg-green-100 text-green-700 border-green-200',
  team: 'bg-purple-100 text-purple-700 border-purple-200',
  funding: 'bg-orange-100 text-orange-700 border-orange-200',
  operations: 'bg-gray-100 text-gray-700 border-gray-200',
  compliance: 'bg-red-100 text-red-700 border-red-200'
};

export function RoadmapBoard() {
  const twoWeekTasks = useStore((state) => state.twoWeekTasks);
  const threeMonthMilestones = useStore((state) => state.threeMonthMilestones);
  const toggleTask = useStore((state) => state.toggleTask);
  const toggleMilestone = useStore((state) => state.toggleMilestone);

  const twoWeekCompleted = twoWeekTasks.filter((t) => t.completed).length;
  const twoWeekTotal = twoWeekTasks.length;
  const twoWeekProgress = (twoWeekCompleted / twoWeekTotal) * 100;

  const threeMonthCompleted = threeMonthMilestones.filter((m) => m.completed).length;
  const threeMonthTotal = threeMonthMilestones.length;
  const threeMonthProgress = (threeMonthCompleted / threeMonthTotal) * 100;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Roadmap</h1>
        <p className="text-sm text-gray-600">
          Auto-generated and continuously updated based on your goals
        </p>
      </div>

      {/* Two Week Sprint */}
      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Next 2 Weeks</h2>
              <p className="text-sm text-gray-500">Sprint focus and immediate actions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{twoWeekCompleted}/{twoWeekTotal}</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        <div className="mb-4">
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
        </div>

        <div className="space-y-2">
          {twoWeekTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all',
                task.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50',
                task.isNew && 'ring-2 ring-amber-300 animate-pulse'
              )}
            >
              {task.completed ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
              )}
              <span
                className={cn(
                  'flex-1 text-sm',
                  task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                )}
              >
                {task.title}
              </span>
              {task.category && (
                <Badge
                  variant="secondary"
                  className={cn('text-xs', categoryColors[task.category])}
                >
                  {task.category}
                </Badge>
              )}
              {task.isNew && (
                <Badge className="bg-amber-100 text-amber-700 text-xs">New</Badge>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Three Month Milestones */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Next 3 Months</h2>
              <p className="text-sm text-gray-500">Strategic milestones and goals</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{threeMonthCompleted}/{threeMonthTotal}</div>
            <div className="text-xs text-gray-500">Complete</div>
          </div>
        </div>

        <div className="mb-4">
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
        </div>

        <div className="space-y-3">
          {threeMonthMilestones.map((milestone) => (
            <div
              key={milestone.id}
              onClick={() => toggleMilestone(milestone.id)}
              className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all',
                milestone.completed
                  ? 'bg-gray-50 border-gray-200'
                  : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50'
              )}
            >
              <div className="flex items-start gap-3">
                {milestone.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-1">
                    <h3
                      className={cn(
                        'font-semibold',
                        milestone.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}
                    >
                      {milestone.title}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs ml-2', categoryColors[milestone.category])}
                    >
                      {milestone.category}
                    </Badge>
                  </div>
                  <p
                    className={cn(
                      'text-sm mb-2',
                      milestone.completed ? 'text-gray-400' : 'text-gray-600'
                    )}
                  >
                    {milestone.description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
