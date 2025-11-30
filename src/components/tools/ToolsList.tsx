import { useState } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { ExternalLink } from 'lucide-react';

const commissionColors: Record<string, string> = {
  high: 'bg-green-100 text-green-700',
  medium: 'bg-blue-100 text-blue-700',
  low: 'bg-purple-100 text-purple-700'
};

function getCommissionLevel(commission: number): string {
  if (commission >= 12) return 'high';
  if (commission >= 9) return 'medium';
  return 'low';
}

export function ToolsList() {
  const tools = useStore((state) => state.tools);
  const incrementToolActivation = useStore((state) => state.incrementToolActivation);
  const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(tools.map((t) => t.category)))];

  const filteredTools =
    selectedCategory === 'all'
      ? tools
      : tools.filter((t) => t.category === selectedCategory);

  const handleActivate = () => {
    incrementToolActivation();
    setSelectedTool(null);
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Tool Matches</h1>
        <p className="text-sm text-gray-600">
          Curated tools matched to your startup's needs with affiliate commissions
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => {
          const level = getCommissionLevel(tool.commission);
          return (
            <Card
              key={tool.id}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedTool(tool)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{tool.name}</h3>
                  <p className="text-xs text-gray-500">{tool.category}</p>
                </div>
                <Badge className={cn('text-xs font-semibold', commissionColors[level])}>
                  +{tool.commission}%
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">{tool.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">{tool.pricing}</span>
                <ExternalLink className="w-4 h-4 text-gray-400" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Tool Detail Modal */}
      <Dialog open={!!selectedTool} onOpenChange={() => setSelectedTool(null)}>
        <DialogContent className="max-w-2xl">
          {selectedTool && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedTool.name}</span>
                  <Badge
                    className={cn(
                      'text-xs font-semibold',
                      commissionColors[getCommissionLevel(selectedTool.commission)]
                    )}
                  >
                    +{selectedTool.commission}% Commission
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">{selectedTool.category}</p>
                  <p className="text-sm text-gray-700">{selectedTool.description}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features</h4>
                  <ul className="space-y-1">
                    {selectedTool.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-1">Pricing</h4>
                  <p className="text-sm text-gray-700">{selectedTool.pricing}</p>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleActivate} className="flex-1">
                    Activate Tool
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTool(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
