import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, FileSpreadsheet, Upload, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type OnboardingPath = 'chat' | 'form' | 'upload' | null;

interface OnboardingPathSelectorProps {
  onSelect: (path: OnboardingPath) => void;
}

const paths = [
  {
    id: 'chat' as const,
    icon: MessageCircle,
    title: 'Guided Q&A',
    subtitle: 'Entrepreneur Whisperer',
    description: 'Answer questions one by one with AI guidance. Best if you\'re still shaping your idea and want strategic feedback along the way.',
    bestFor: 'Idea stage → Early customers',
    time: '~15-20 min',
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    iconColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 'form' as const,
    icon: FileSpreadsheet,
    title: 'Founder Intake Form',
    subtitle: 'Structured assessment',
    description: 'Fill in a structured form covering your venture, team, traction, fundraising needs, and priorities. Data flows directly into your platform.',
    bestFor: 'MVP → Growth stage',
    time: '~10-15 min',
    color: 'bg-emerald-50 border-emerald-200 hover:border-emerald-400',
    iconColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
  },
  {
    id: 'upload' as const,
    icon: Upload,
    title: 'Upload Documents',
    subtitle: 'Pitch deck, business plan, or data room',
    description: 'Upload your existing materials and we\'ll extract the key information to populate your platform automatically.',
    bestFor: 'Any stage with existing docs',
    time: '~5 min',
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    iconColor: 'text-purple-600',
    badgeColor: 'bg-purple-100 text-purple-700',
  },
];

export function OnboardingPathSelector({ onSelect }: OnboardingPathSelectorProps) {
  const [hoveredPath, setHoveredPath] = useState<string | null>(null);

  return (
    <div className="h-full flex items-center justify-center bg-background p-8">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Welcome to Build & Beyond 🚀
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose how you'd like to get started. Each path populates your platform with
            personalized insights, recommendations, and a roadmap tailored to your stage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {paths.map((path) => {
            const Icon = path.icon;
            return (
              <Card
                key={path.id}
                className={cn(
                  'p-6 cursor-pointer transition-all duration-200 border-2',
                  path.color,
                  hoveredPath === path.id && 'shadow-lg scale-[1.02]'
                )}
                onMouseEnter={() => setHoveredPath(path.id)}
                onMouseLeave={() => setHoveredPath(null)}
                onClick={() => onSelect(path.id)}
              >
                <div className="flex flex-col h-full">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-4', path.color.split(' ')[0])}>
                    <Icon className={cn('w-6 h-6', path.iconColor)} />
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-1">{path.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{path.subtitle}</p>
                  
                  <p className="text-sm text-foreground/80 mb-4 flex-1">{path.description}</p>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className={cn('text-xs', path.badgeColor)}>
                        {path.bestFor}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{path.time}</span>
                      <ArrowRight className={cn('w-4 h-4 transition-transform', 
                        hoveredPath === path.id ? 'translate-x-1' : '', path.iconColor)} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          You can always switch paths or add more information later from your dashboard.
        </p>
      </div>
    </div>
  );
}
