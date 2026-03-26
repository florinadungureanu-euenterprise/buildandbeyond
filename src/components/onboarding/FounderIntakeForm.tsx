import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/store';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ArrowRight, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Form sections based on the founder intake form
const formSections = [
  { id: 'basics', title: '1. About You & Your Venture', icon: '👤' },
  { id: 'market', title: '2. Market & Product', icon: '🎯' },
  { id: 'traction', title: '3. Traction & Team', icon: '📈' },
  { id: 'fundraising', title: '4. Fundraising', icon: '💰' },
  { id: 'priorities', title: '5. Priorities & Needs', icon: '🧭' },
  { id: 'support', title: '6. Support & Introductions', icon: '🤝' },
];

// Multi-select options
const buildPriorityOptions = [
  'Customer discovery and idea validation',
  'MVP or product development',
  'Product-market fit',
  'Pilots or early traction',
  'Scaling the product',
];
const gtmPriorityOptions = [
  'Refining the value proposition and positioning',
  'Go-to-market strategy',
  'Pricing and business model',
  'Brand, visibility, and credibility',
  'Partnerships or commercial traction',
  'Market access',
];
const fundraisingPriorityOptions = [
  'Fundraising readiness',
  'Fundraising process and investor outreach',
  'Investor targeting',
  'Warm introductions to relevant investors or partners',
  'Pitch deck and fundraising materials',
  'Pitch coaching and investor readiness',
  'Grants or non-dilutive funding',
  'US or international setup',
];
const teamPriorityOptions = [
  'Hiring or finding a co-founder',
  'Team structure, founder roles, or advisor support',
  'Company setup, legal structure, or equity split',
  'Roadmap and next-step prioritisation',
  'Operations and internal processes',
];
const fundingTypeOptions = [
  'Angels',
  'VC (Venture Capital)',
  'Grants',
  'Bank or regional development loans',
  'Corporate partnership',
  'Revenue-based financing',
  'Strategic investor',
  'Crowdfunding',
];
const introductionOptions = [
  'Funders 💰',
  'Pilot customers',
  'Co-founders',
  'Corporates',
  'Venture builders',
  'Media or ecosystem visibility',
  'Mentors or advisors',
];

export interface IntakeFormData {
  // Basics
  fullName: string;
  companyName: string;
  website: string;
  linkedin: string;
  deckLink: string;
  founderLocation: string;
  companyLocation: string;
  currentStage: string;
  industry: string;
  ventureOneSentence: string;
  
  // Market & Product
  whyThisIdea: string;
  whyNow: string;
  revenueModel: string;
  marketSize: string;
  competitors: string;
  uniqueInsight: string;
  impact: string;
  
  // Traction & Team
  deadline: string;
  whoBuilds: string;
  nonFounderWork: string;
  lookingForCofounder: string;
  cofounderRoles: string;
  techStack: string;
  hasProduct: string;
  productLink: string;
  traction: string;
  proofPoints: string;
  
  // Fundraising
  fundraisingStatus: string;
  raiseAmount: string;
  fundingTypes: string[];
  fundingUse: string;
  currentRunway: string;
  idealInvestor: string;
  fundraisingStepsTaken: string;
  investorFeedback: string;
  hasInvestorList: string;
  fundraisingReadinessHelp: string[];
  
  // Priorities
  buildPriorities: string[];
  gtmPriorities: string[];
  fundraisingPriorities: string[];
  teamPriorities: string[];
  biggestBlockers: string;
  desiredOutcome: string;
  
  // Support
  currentSupport: string;
  introductions: string[];
  introductionDetails: string;
  strategicQuestions: string;
  anythingElse: string;
}

const initialFormData: IntakeFormData = {
  fullName: '', companyName: '', website: '', linkedin: '', deckLink: '',
  founderLocation: '', companyLocation: '', currentStage: '', industry: '', ventureOneSentence: '',
  whyThisIdea: '', whyNow: '', revenueModel: '', marketSize: '', competitors: '',
  uniqueInsight: '', impact: '',
  deadline: '', whoBuilds: '', nonFounderWork: '', lookingForCofounder: '', cofounderRoles: '',
  techStack: '', hasProduct: '', productLink: '', traction: '', proofPoints: '',
  fundraisingStatus: '', raiseAmount: '', fundingTypes: [], fundingUse: '', currentRunway: '',
  idealInvestor: '', fundraisingStepsTaken: '', investorFeedback: '', hasInvestorList: '',
  fundraisingReadinessHelp: [],
  buildPriorities: [], gtmPriorities: [], fundraisingPriorities: [], teamPriorities: [],
  biggestBlockers: '', desiredOutcome: '',
  currentSupport: '', introductions: [], introductionDetails: '', strategicQuestions: '', anythingElse: '',
};

function MultiSelect({ options, selected, onChange, label }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void; label: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <div className="space-y-2">
        {options.map(opt => (
          <div key={opt} className="flex items-center gap-2">
            <Checkbox
              checked={selected.includes(opt)}
              onCheckedChange={(checked) => {
                onChange(checked ? [...selected, opt] : selected.filter(s => s !== opt));
              }}
            />
            <span className="text-sm">{opt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function FounderIntakeForm({ onBack }: { onBack: () => void }) {
  const [formData, setFormData] = useState<IntakeFormData>(initialFormData);
  const [currentSection, setCurrentSection] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const update = (field: keyof IntakeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setIsSubmitting(true);

    try {
      // Save form data as onboarding_profile
      const profileData = {
        source: 'intake_form',
        stage_detected: formData.currentStage,
        customer: formData.ventureOneSentence,
        problem: formData.uniqueInsight,
        solution: formData.ventureOneSentence,
        unique_value_proposition: formData.uniqueInsight,
        business_model: formData.revenueModel,
        industry: formData.industry,
        region: formData.companyLocation,
        fundraising_type: formData.fundingTypes.join(', '),
        fundraising_amount: formData.raiseAmount,
        risks: formData.biggestBlockers,
        twelve_week_goal: formData.desiredOutcome,
        channels: formData.gtmPriorities.join(', '),
        // Full intake form stored
        intake_form: formData,
      };

      // Upsert to user_data
      await supabase.from('user_data' as any).upsert({
        user_id: user.id,
        onboarding_profile: profileData,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'user_id' });

      // Update profiles table
      await supabase.from('profiles' as any).upsert({
        id: user.id,
        full_name: formData.fullName,
        company_name: formData.companyName,
        linkedin_url: formData.linkedin,
        updated_at: new Date().toISOString(),
      } as any, { onConflict: 'id' });

      // Trigger the form-to-platform mapper edge function
      const { data: mapperResult } = await supabase.functions.invoke('map-intake-form', {
        body: { formData, userId: user.id },
      });

      if (mapperResult?.success) {
        const store = useStore.getState();
        
        // Update passport
        if (mapperResult.passport) {
          store.updatePassport(mapperResult.passport);
        }
        
        // Update signals
        if (mapperResult.signals?.length) {
          store.setResearchSignals(mapperResult.signals);
        }
        
        // Update applications
        if (mapperResult.applications?.length) {
          store.addResearchApplications(mapperResult.applications);
        }
      }

      // Also trigger research agent for market data enrichment
      try {
        const { researchAgent } = await import('@/lib/api/research-agent');
        const researchProfile = {
          industry: formData.industry,
          region: formData.companyLocation,
          solution: formData.ventureOneSentence,
          customer: formData.ventureOneSentence,
          companyName: formData.companyName,
          linkedinUrl: formData.linkedin,
          stage: formData.currentStage,
          fundraisingType: formData.fundingTypes.join(', '),
        };

        const [marketResult, passportResult, opportunitiesResult] = await Promise.allSettled([
          researchAgent.researchMarket(researchProfile, user.id),
          researchAgent.enrichPassport(researchProfile, user.id),
          researchAgent.findOpportunities(researchProfile, user.id),
        ]);

        const store = useStore.getState();
        if (marketResult.status === 'fulfilled' && marketResult.value.success && marketResult.value.signals) {
          store.setResearchSignals(marketResult.value.signals as any);
        }
        if (passportResult.status === 'fulfilled' && passportResult.value.success && passportResult.value.passport) {
          const e = passportResult.value.passport;
          store.updatePassport({
            competitorSnapshot: e.topCompetitors || [],
            marketData: [
              e.marketSize ? `Market Size: ${e.marketSize}` : '',
              e.marketGrowthRate ? `Growth Rate: ${e.marketGrowthRate}` : '',
              e.fundingLandscape ? `Funding: ${e.fundingLandscape}` : '',
              ...(e.keyInsights || []),
            ].filter(Boolean),
          });
        }
        if (opportunitiesResult.status === 'fulfilled' && opportunitiesResult.value.success && opportunitiesResult.value.opportunities) {
          store.addResearchApplications(opportunitiesResult.value.opportunities.map(opp => ({
            id: '',
            name: opp.name,
            type: (opp.type === 'vc' || opp.type === 'angel' ? 'accelerator' : opp.type) as any,
            description: opp.description,
            benefits: opp.benefits,
            eligibility: opp.eligibility || [],
            deadline: opp.deadline || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            matchScore: opp.matchScore || 70,
            url: opp.url,
          })));
        }
      } catch (researchError) {
        console.error('Research agent error (non-blocking):', researchError);
      }

      setIsComplete(true);
      toast({ title: 'Form submitted!', description: 'Your platform is being populated with personalized data.' });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({ title: 'Error', description: 'Failed to submit form. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isComplete) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="max-w-lg p-8 text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">You're all set! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            Your platform is being populated with personalized insights, market signals, and recommendations based on your answers and open-source market data.
          </p>
          <Button onClick={() => navigate('/')} size="lg" className="w-full">
            View Your Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const section = formSections[currentSection];

  return (
    <div className="h-full flex">
      {/* Main form */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">{section.icon} {section.title}</h1>
            </div>
            <Badge variant="secondary">{currentSection + 1} / {formSections.length}</Badge>
          </div>

          {/* Progress */}
          <div className="w-full h-2 bg-muted rounded-full mb-8">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${((currentSection + 1) / formSections.length) * 100}%` }}
            />
          </div>

          {/* Section content */}
          <div className="space-y-6">
            {currentSection === 0 && (
              <>
                <Field label="Full name *" value={formData.fullName} onChange={v => update('fullName', v)} />
                <Field label="Company name *" value={formData.companyName} onChange={v => update('companyName', v)} />
                <Field label="Website" value={formData.website} onChange={v => update('website', v)} placeholder="https://" />
                <Field label="LinkedIn" value={formData.linkedin} onChange={v => update('linkedin', v)} placeholder="https://linkedin.com/in/..." />
                <Field label="Deck link (optional)" value={formData.deckLink} onChange={v => update('deckLink', v)} />
                <Field label="Where are you based?" value={formData.founderLocation} onChange={v => update('founderLocation', v)} />
                <Field label="Where is the company based?" value={formData.companyLocation} onChange={v => update('companyLocation', v)} />
                <div>
                  <Label className="text-sm font-medium mb-2 block">Current stage *</Label>
                  <Select value={formData.currentStage} onValueChange={v => update('currentStage', v)}>
                    <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Idea">Idea</SelectItem>
                      <SelectItem value="Prototype">Prototype</SelectItem>
                      <SelectItem value="MVP">MVP</SelectItem>
                      <SelectItem value="Pre-revenue">Pre-revenue</SelectItem>
                      <SelectItem value="Early traction">Early traction</SelectItem>
                      <SelectItem value="Revenue generating">Revenue generating</SelectItem>
                      <SelectItem value="Growth">Growth</SelectItem>
                      <SelectItem value="Established but pivoting">Established but pivoting</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Industry / sector *" value={formData.industry} onChange={v => update('industry', v)} placeholder="e.g. AgTech, Construction, SaaS..." />
                <TextareaField label="Describe your venture in one sentence *" value={formData.ventureOneSentence} onChange={v => update('ventureOneSentence', v)} placeholder="For [customer] who [problem], we [solution]..." />
              </>
            )}

            {currentSection === 1 && (
              <>
                <TextareaField label="Why did you choose this idea? Personal or professional insight?" value={formData.whyThisIdea} onChange={v => update('whyThisIdea', v)} />
                <TextareaField label="Why now? Why is this the right moment?" value={formData.whyNow} onChange={v => update('whyNow', v)} />
                <TextareaField label="Revenue model (subscriptions, usage-based, licensing, etc.)" value={formData.revenueModel} onChange={v => update('revenueModel', v)} />
                <TextareaField label="How big could this become, in your own words?" value={formData.marketSize} onChange={v => update('marketSize', v)} />
                <TextareaField label="Main competitors or alternatives today" value={formData.competitors} onChange={v => update('competitors', v)} />
                <TextareaField label="What do you understand about this market that others may be missing?" value={formData.uniqueInsight} onChange={v => update('uniqueInsight', v)} />
                <TextareaField label="Impact: What impact do you want this company to have?" value={formData.impact} onChange={v => update('impact', v)} />
              </>
            )}

            {currentSection === 2 && (
              <>
                <TextareaField label="Specific deadline or milestone in the next 6 months?" value={formData.deadline} onChange={v => update('deadline', v)} />
                <TextareaField label="Who is building the product today?" value={formData.whoBuilds} onChange={v => update('whoBuilds', v)} />
                <TextareaField label="Has any work been done by non-founders, contractors, or partners?" value={formData.nonFounderWork} onChange={v => update('nonFounderWork', v)} />
                <div>
                  <Label className="text-sm font-medium mb-2 block">Looking for a co-founder or key hires?</Label>
                  <Select value={formData.lookingForCofounder} onValueChange={v => update('lookingForCofounder', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                      <SelectItem value="Not sure yet">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.lookingForCofounder === 'Yes' && (
                  <TextareaField label="Which roles?" value={formData.cofounderRoles} onChange={v => update('cofounderRoles', v)} />
                )}
                <Field label="Tech stack" value={formData.techStack} onChange={v => update('techStack', v)} />
                <div>
                  <Label className="text-sm font-medium mb-2 block">Do you have a live product/prototype?</Label>
                  <Select value={formData.hasProduct} onValueChange={v => update('hasProduct', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="In progress">In progress</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="Link to product or demo (optional)" value={formData.productLink} onChange={v => update('productLink', v)} />
                <TextareaField label="Traction or early validation achieved so far?" value={formData.traction} onChange={v => update('traction', v)} />
                <TextareaField label="Main proof points that make you believe this can work?" value={formData.proofPoints} onChange={v => update('proofPoints', v)} />
              </>
            )}

            {currentSection === 3 && (
              <>
                <div>
                  <Label className="text-sm font-medium mb-2 block">Are you currently fundraising?</Label>
                  <Select value={formData.fundraisingStatus} onValueChange={v => update('fundraisingStatus', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not yet">Not yet</SelectItem>
                      <SelectItem value="Preparing to start">Preparing to start</SelectItem>
                      <SelectItem value="Actively fundraising">Actively fundraising</SelectItem>
                      <SelectItem value="Recently closed">Recently closed a round</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Field label="How much are you looking to raise?" value={formData.raiseAmount} onChange={v => update('raiseAmount', v)} placeholder="e.g. €100k-€500k" />
                <MultiSelect label="Funding types you're exploring" options={fundingTypeOptions} selected={formData.fundingTypes} onChange={v => update('fundingTypes', v)} />
                <TextareaField label="What would the funding mainly be used for?" value={formData.fundingUse} onChange={v => update('fundingUse', v)} />
                <div>
                  <Label className="text-sm font-medium mb-2 block">Current runway</Label>
                  <Select value={formData.currentRunway} onValueChange={v => update('currentRunway', v)}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Less than 3 months">Less than 3 months</SelectItem>
                      <SelectItem value="3 to 6 months">3 to 6 months</SelectItem>
                      <SelectItem value="6 to 12 months">6 to 12 months</SelectItem>
                      <SelectItem value="12+ months">12+ months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TextareaField label="What kind of investor/backer would be the best fit?" value={formData.idealInvestor} onChange={v => update('idealInvestor', v)} />
                <TextareaField label="Fundraising steps already taken" value={formData.fundraisingStepsTaken} onChange={v => update('fundraisingStepsTaken', v)} />
                <TextareaField label="Investor feedback, objections, or patterns so far" value={formData.investorFeedback} onChange={v => update('investorFeedback', v)} />
              </>
            )}

            {currentSection === 4 && (
              <>
                <MultiSelect label="Build priorities" options={buildPriorityOptions} selected={formData.buildPriorities} onChange={v => update('buildPriorities', v)} />
                <MultiSelect label="Go-to-market priorities" options={gtmPriorityOptions} selected={formData.gtmPriorities} onChange={v => update('gtmPriorities', v)} />
                <MultiSelect label="Fundraising priorities" options={fundraisingPriorityOptions} selected={formData.fundraisingPriorities} onChange={v => update('fundraisingPriorities', v)} />
                <MultiSelect label="Team and operations priorities" options={teamPriorityOptions} selected={formData.teamPriorities} onChange={v => update('teamPriorities', v)} />
                <TextareaField label="Biggest things currently slowing you down" value={formData.biggestBlockers} onChange={v => update('biggestBlockers', v)} />
                <TextareaField label="What would a very useful outcome look like in 6 months?" value={formData.desiredOutcome} onChange={v => update('desiredOutcome', v)} />
              </>
            )}

            {currentSection === 5 && (
              <>
                <TextareaField label="Where do you currently go for support, opportunities, or resources?" value={formData.currentSupport} onChange={v => update('currentSupport', v)} />
                <MultiSelect label="What kinds of introductions could be most valuable?" options={introductionOptions} selected={formData.introductions} onChange={v => update('introductions', v)} />
                <TextareaField label="Elaborate on the introductions you need (be specific!)" value={formData.introductionDetails} onChange={v => update('introductionDetails', v)} placeholder='e.g. "a climate-focused angel who has backed hardware startups before"' />
                <TextareaField label="Any strategic questions top of mind?" value={formData.strategicQuestions} onChange={v => update('strategicQuestions', v)} />
                <TextareaField label="Anything else I should know?" value={formData.anythingElse} onChange={v => update('anythingElse', v)} />
              </>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8 pb-8">
            <Button
              variant="outline"
              onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
              disabled={currentSection === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Previous
            </Button>

            {currentSection < formSections.length - 1 ? (
              <Button onClick={() => setCurrentSection(currentSection + 1)}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting || !formData.fullName || !formData.companyName}>
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 mr-1 animate-spin" /> Processing...</>
                ) : (
                  <><Send className="w-4 h-4 mr-1" /> Submit & Generate Platform</>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Right sidebar - section navigation */}
      <div className="w-72 bg-muted/30 border-l border-border p-6 overflow-y-auto">
        <h4 className="font-semibold text-foreground text-sm mb-4">Sections</h4>
        <div className="space-y-2">
          {formSections.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setCurrentSection(idx)}
              className={cn(
                'w-full text-left p-3 rounded-lg text-sm transition-colors',
                idx === currentSection
                  ? 'bg-primary/10 text-primary font-medium border border-primary/20'
                  : idx < currentSection
                  ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              <span className="mr-2">{s.icon}</span>
              {s.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Simple field components
function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <Input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function TextareaField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  return (
    <div>
      <Label className="text-sm font-medium mb-2 block">{label}</Label>
      <Textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} />
    </div>
  );
}
