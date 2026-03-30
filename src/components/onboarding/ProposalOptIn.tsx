import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Rocket, CheckCircle2, Loader2 } from 'lucide-react';

interface ProposalOptInProps {
  variant?: 'post-onboarding' | 'dashboard';
  onComplete?: () => void;
}

const modules = [
  { id: 'validation', label: 'Idea Validation & Customer Discovery', desc: 'Validate your problem-solution fit with structured experiments' },
  { id: 'gtm', label: 'Go-to-Market Strategy', desc: 'Define positioning, channels, and launch plan' },
  { id: 'fundraising', label: 'Fundraising Preparation', desc: 'Pitch deck review, investor targeting, and readiness coaching' },
  { id: 'product', label: 'Product Roadmap & Prioritization', desc: 'Structure your backlog and plan sprints effectively' },
  { id: 'growth', label: 'Growth & Traction', desc: 'Set up metrics, experiments, and scaling playbooks' },
  { id: 'operations', label: 'Operations & Team Setup', desc: 'Company structure, hiring plan, and process design' },
];

export function ProposalOptIn({ variant = 'post-onboarding', onComplete }: ProposalOptInProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const userInputs = useStore((s) => s.userInputs);
  const passport = useStore((s) => s.passport);
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!user || selectedModules.length === 0) return;
    setSubmitting(true);

    try {
      const answers = {
        userInputs,
        startupName: passport.startupName,
        founderName: passport.founderName,
        industry: passport.industry,
        tagline: passport.tagline,
        summary: passport.summary,
        selectedModules,
      };

      const { error } = await supabase.from('proposal_requests' as any).insert({
        user_id: user.id,
        onboarding_answers: answers,
        status: 'new',
      } as any);

      if (error) throw error;

      setSubmitted(true);
      toast({ title: 'Request sent!', description: 'You will receive a personalized proposal soon.' });
      onComplete?.();
    } catch (err) {
      console.error('Error submitting proposal request:', err);
      toast({ title: 'Error', description: 'Failed to submit request. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
        <CardContent className="pt-6 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
          <h3 className="text-lg font-semibold text-foreground">Request Received!</h3>
          <p className="text-sm text-muted-foreground">
            We will review your profile and send you a personalized proposal with tailored modules to help you reach your goals.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={variant === 'dashboard' ? '' : 'border-primary/20'}>
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Rocket className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {variant === 'dashboard' ? 'Need expert support?' : 'Want hands-on support to reach your goals?'}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get a personalized proposal with action modules tailored to your venture. Select the areas where you need the most support.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modules.map((mod) => (
            <label
              key={mod.id}
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedModules.includes(mod.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/40'
              }`}
            >
              <Checkbox
                checked={selectedModules.includes(mod.id)}
                onCheckedChange={() => toggleModule(mod.id)}
                className="mt-0.5"
              />
              <div>
                <span className="text-sm font-medium text-foreground">{mod.label}</span>
                <p className="text-xs text-muted-foreground mt-0.5">{mod.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={selectedModules.length === 0 || submitting}
          className="w-full"
          size="lg"
        >
          {submitting ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
          ) : (
            <>Request Personalized Proposal ({selectedModules.length} module{selectedModules.length !== 1 ? 's' : ''})</>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Free of charge. No commitment required.
        </p>
      </CardContent>
    </Card>
  );
}
