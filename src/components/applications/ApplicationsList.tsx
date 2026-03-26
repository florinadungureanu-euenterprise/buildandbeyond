import { useState } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Award, TrendingUp, CheckCircle2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const typeColors: Record<string, string> = {
  accelerator: 'bg-blue-100 text-blue-700 border-blue-200',
  grant: 'bg-green-100 text-green-700 border-green-200',
  'competition & hackathons': 'bg-purple-100 text-purple-700 border-purple-200',
  incubator: 'bg-orange-100 text-orange-700 border-orange-200'
};

export function ApplicationsList() {
  const applications = useStore((state) => state.applications);
  const passport = useStore((state) => state.passport);
  const markApplicationApplied = useStore((state) => state.markApplicationApplied);
  const [selectedApp, setSelectedApp] = useState<typeof applications[0] | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();

  const types = ['all', ...Array.from(new Set(applications.map((a) => a.type)))];

  const filteredApps =
    filterType === 'all'
      ? applications
      : applications.filter((a) => a.type === filterType);

  // Sort by match score descending
  const sortedApps = [...filteredApps].sort((a, b) => b.matchScore - a.matchScore);

  if (applications.length === 0) {
    return (
      <div className="p-8 text-center">
        <Card className="p-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">No Programs Found Yet</h2>
          <p className="text-muted-foreground">Complete onboarding to discover grants, accelerators, and programs matched to your startup profile.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">Startup Programs & Applications</h1>
        <p className="text-sm text-muted-foreground">
          Recommended programs matched to {passport.startupName} (Industry: {passport.industry}, TRL: {passport.trl})
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterType(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedApps.map((app) => (
          <Card
            key={app.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-border relative"
            onClick={() => setSelectedApp(app)}
          >
            {app.applied && (
              <div className="absolute top-3 right-3">
                <Badge className="bg-green-100 text-green-700 border-green-200">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Applied
                </Badge>
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">{app.name}</h3>
                <Badge className={cn('text-xs font-medium capitalize', typeColors[app.type])}>
                  {app.type}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-primary">
                <TrendingUp className="w-4 h-4" />
                {app.matchScore}%
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{app.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(app.deadline).toLocaleDateString()}
              </div>
              {app.benefits.length > 0 && (
                <div className="flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {app.benefits.length} benefits
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Application Detail Modal */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedApp && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedApp.name}</span>
                  <div className="flex items-center gap-2">
                    {selectedApp.applied && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                    <Badge className={cn('text-xs font-medium capitalize', typeColors[selectedApp.type])}>
                      {selectedApp.type}
                    </Badge>
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      {selectedApp.matchScore}% Match
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">{selectedApp.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Key Benefits
                  </h4>
                  <ul className="space-y-1">
                    {selectedApp.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Eligibility Requirements</h4>
                  <ul className="space-y-1">
                    {selectedApp.eligibility.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-1">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Application Deadline: </span>
                    <span className="font-medium text-foreground">
                      {new Date(selectedApp.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {selectedApp.industry && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Matched Industries:</span> {selectedApp.industry.join(', ')}
                  </div>
                )}

                {selectedApp.trlRange && (
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">TRL Range:</span> {selectedApp.trlRange}
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  {selectedApp.url && (
                    <Button
                      onClick={() => window.open(selectedApp.url, '_blank', 'noopener,noreferrer')}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit Website
                    </Button>
                  )}
                  {!selectedApp.applied && (
                    <Button
                      onClick={() => {
                        markApplicationApplied(selectedApp.id);
                        toast({
                          title: 'Application marked',
                          description: `${selectedApp.name} has been marked as applied`
                        });
                        setSelectedApp(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Mark as Applied
                    </Button>
                  )}
                  <Button variant="ghost" onClick={() => setSelectedApp(null)}>
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
