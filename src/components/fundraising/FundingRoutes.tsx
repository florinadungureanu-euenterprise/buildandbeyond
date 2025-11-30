import { useState } from 'react';
import { useStore } from '@/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FundingRoute } from '@/types';
import { TrendingUp, Clock, CheckCircle2, XCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const typeColors: Record<string, string> = {
  angel: 'bg-purple-100 text-purple-700',
  vc: 'bg-blue-100 text-blue-700',
  grant: 'bg-green-100 text-green-700',
  accelerator: 'bg-orange-100 text-orange-700',
  crowdfunding: 'bg-pink-100 text-pink-700',
  loan: 'bg-gray-100 text-gray-700'
};

export function FundingRoutes() {
  const fundingData = useStore((state) => state.fundingData);
  const markFundingRouteApplied = useStore((state) => state.markFundingRouteApplied);
  const [selectedRoute, setSelectedRoute] = useState<FundingRoute | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const { toast } = useToast();

  const types = ['all', ...Array.from(new Set(fundingData.funding_routes.map(r => r.type)))];
  
  const filteredRoutes = selectedType === 'all' 
    ? fundingData.funding_routes 
    : fundingData.funding_routes.filter(r => r.type === selectedType);

  // Sort by match score
  const sortedRoutes = [...filteredRoutes].sort((a, b) => b.match_score - a.match_score);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Funding Routes</span>
            <span className="text-sm font-normal text-gray-500">
              {fundingData.funding_routes.length} options available
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {types.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {type}
              </Button>
            ))}
          </div>

          {/* Routes List */}
          <div className="space-y-3">
            {sortedRoutes.map((route) => (
              <div
                key={route.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer relative"
                onClick={() => setSelectedRoute(route)}
              >
                {route.applied && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Applied
                    </Badge>
                  </div>
                )}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-900">{route.name}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{route.description}</p>
                  </div>
                  <Badge className={cn('text-xs capitalize flex-shrink-0 ml-2', typeColors[route.type])}>
                    {route.type}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <TrendingUp className="w-3 h-3" />
                      Match Score
                    </div>
                    <div className="font-semibold text-sm text-gray-900">{route.match_score}%</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Clock className="w-3 h-3" />
                      Timeline
                    </div>
                    <div className="font-semibold text-sm text-gray-900">{route.timeline}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Amount</div>
                    <div className="font-semibold text-sm text-gray-900">{route.typical_amount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Route Detail Modal */}
      <Dialog open={!!selectedRoute} onOpenChange={() => setSelectedRoute(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedRoute && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedRoute.name}</span>
                  <div className="flex items-center gap-2">
                    {selectedRoute.applied && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                    <Badge className={cn('text-xs capitalize', typeColors[selectedRoute.type])}>
                      {selectedRoute.type}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-gray-700">{selectedRoute.description}</p>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Match Score</div>
                    <div className="text-lg font-bold text-gray-900">{selectedRoute.match_score}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Timeline</div>
                    <div className="text-lg font-bold text-gray-900">{selectedRoute.timeline}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Typical Amount</div>
                    <div className="text-lg font-bold text-gray-900">{selectedRoute.typical_amount}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Requirements</h4>
                  <ul className="space-y-1">
                    {selectedRoute.requirements.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Pros
                    </h4>
                    <ul className="space-y-1">
                      {selectedRoute.pros.map((pro, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {pro}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Cons
                    </h4>
                    <ul className="space-y-1">
                      {selectedRoute.cons.map((con, idx) => (
                        <li key={idx} className="text-sm text-gray-700">• {con}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-1">
                    <ArrowRight className="w-4 h-4 text-blue-600" />
                    Next Steps
                  </h4>
                  <ol className="space-y-2">
                    {selectedRoute.next_steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="font-semibold text-blue-600">{idx + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="flex gap-2 pt-4">
                  {selectedRoute.url && (
                    <Button
                      onClick={() => window.open(selectedRoute.url, '_blank', 'noopener,noreferrer')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                  {!selectedRoute.applied && (
                    <Button
                      onClick={() => {
                        markFundingRouteApplied(selectedRoute.id);
                        toast({
                          title: 'Application marked',
                          description: `${selectedRoute.name} has been marked as applied`
                        });
                        setSelectedRoute(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Applied
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setSelectedRoute(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
