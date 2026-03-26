import { useState } from 'react';
import { useStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Sparkles, MessageSquare, Globe, Briefcase, Target } from 'lucide-react';

interface FounderMatch {
  id: string;
  name: string;
  startup: string;
  stage: string;
  industry: string;
  location: string;
  skills: string[];
  lookingFor: string[];
  matchScore: number;
  matchReasons: string[];
}

// Example matches to demonstrate the feature
const exampleMatches: FounderMatch[] = [
  {
    id: '1',
    name: 'Sarah K.',
    startup: 'GreenLogistics AI',
    stage: 'MVP',
    industry: 'CleanTech',
    location: 'Berlin, DE',
    skills: ['Machine Learning', 'Supply Chain', 'Fundraising'],
    lookingFor: ['Technical Co-Founder', 'Frontend Developer'],
    matchScore: 92,
    matchReasons: ['Complementary skills', 'Same region', 'Similar stage'],
  },
  {
    id: '2',
    name: 'Marco R.',
    startup: 'FinCompliance',
    stage: 'Pre-Seed',
    industry: 'FinTech',
    location: 'Amsterdam, NL',
    skills: ['Compliance', 'Legal Tech', 'Product Management'],
    lookingFor: ['Growth Marketer', 'Backend Engineer'],
    matchScore: 85,
    matchReasons: ['Industry overlap', 'Needs your skill set', 'EU focus'],
  },
  {
    id: '3',
    name: 'Lina T.',
    startup: 'EduMentor',
    stage: 'Idea',
    industry: 'EdTech',
    location: 'Vienna, AT',
    skills: ['Education', 'Content Strategy', 'Community Building'],
    lookingFor: ['Technical Co-Founder', 'UX Designer'],
    matchScore: 78,
    matchReasons: ['Looking for your expertise', 'DACH region', 'Early stage synergy'],
  },
  {
    id: '4',
    name: 'Tom A.',
    startup: 'MedScan',
    stage: 'Early Customers',
    industry: 'HealthTech',
    location: 'Zurich, CH',
    skills: ['Medical Devices', 'Hardware', 'Regulatory'],
    lookingFor: ['Sales Lead', 'Data Scientist'],
    matchScore: 71,
    matchReasons: ['Potential partnership', 'Complementary market', 'Revenue stage'],
  },
];

export function FounderMatching() {
  const [matches] = useState<FounderMatch[]>(exampleMatches);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Founder Matching</h2>
          <p className="text-sm text-muted-foreground">
            Discover founders with complementary skills, industry overlap, and co-building potential.
          </p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          AI-Matched
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matches.map((match) => (
          <Card key={match.id} className="p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{match.name}</h3>
                <p className="text-sm text-muted-foreground">{match.startup}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">{match.matchScore}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-3">
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Briefcase className="w-3 h-3" />{match.industry}
              </Badge>
              <Badge variant="outline" className="text-xs flex items-center gap-1">
                <Globe className="w-3 h-3" />{match.location}
              </Badge>
              <Badge variant="secondary" className="text-xs">{match.stage}</Badge>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Skills</p>
              <div className="flex flex-wrap gap-1">
                {match.skills.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>

            <div className="mb-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Looking for</p>
              <div className="flex flex-wrap gap-1">
                {match.lookingFor.map((l) => (
                  <Badge key={l} variant="outline" className="text-xs text-primary border-primary/30">{l}</Badge>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Why matched</p>
              <div className="flex flex-wrap gap-1">
                {match.matchReasons.map((r) => (
                  <span key={r} className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{r}</span>
                ))}
              </div>
            </div>

            <Button size="sm" variant="outline" className="w-full">
              <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
              Request Introduction
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
