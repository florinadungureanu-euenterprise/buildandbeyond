import { create } from 'zustand';
import { Tool, Milestone, Signal, ValidationScores, PassportData, Application, TeamMember, FundingData } from '@/types';

interface AppState {
  validation: ValidationScores;
  tools: Tool[];
  signals: Signal[];
  twelveMonthMilestones: Milestone[];
  passport: PassportData;
  userInputs: Record<string, string>;
  showComplianceAlert: boolean;
  toolActivationCount: number;
  applications: Application[];
  teamMembers: TeamMember[];
  fundingData: FundingData;
  onboardingComplete: boolean;
  dataLoaded: boolean;

  // Actions
  toggleMilestone: (milestoneId: string) => void;
  addComplianceTasks: () => void;
  dismissComplianceAlert: () => void;
  updateUserInput: (key: string, value: string) => void;
  incrementToolActivation: () => void;
  updatePassport: (data: Partial<PassportData>) => void;
  markToolSubscribed: (toolId: string) => void;
  markApplicationApplied: (applicationId: string) => void;
  markFundingRouteApplied: (routeId: string) => void;
  setResearchSignals: (signals: Signal[]) => void;
  addResearchApplications: (apps: Application[]) => void;
  setOnboardingComplete: (complete: boolean) => void;
  setValidation: (v: ValidationScores) => void;
  setMilestones: (m: Milestone[]) => void;
  setSignals: (s: Signal[]) => void;
  setApplications: (a: Application[]) => void;
  setTools: (t: Tool[]) => void;
  setTeamMembers: (t: TeamMember[]) => void;
  setFundingData: (f: FundingData) => void;
  hydrateState: (data: Partial<AppState>) => void;
}

// Default tools that are always available as recommendations
const defaultTools: Tool[] = [
  {
    id: '1',
    name: 'Lovable',
    category: 'Development',
    description: 'AI-powered full-stack development platform for rapid prototyping',
    features: ['AI code generation', 'Full-stack support', 'Real-time preview', 'Database integration'],
    pricing: 'Free tier (limited credits), Pro US $25/month, Business US $50/month',
    metrics: { cost_savings: '85%', time_savings: '70%', efficiency_gain: '10x faster development' },
    relevant_stages: ['idea', 'prototype', 'mvp'],
    use_cases: ['rapid prototyping', 'MVP development', 'UI/UX design'],
    url: 'https://lovable.dev'
  },
  {
    id: '2',
    name: 'n8n',
    category: 'Automation',
    description: 'Workflow automation platform for connecting apps and services',
    features: ['Visual workflow builder', '400+ integrations', 'Self-hosted option', 'Custom nodes'],
    pricing: 'Free (self-hosted/community), Cloud Starter ~US $20/month',
    metrics: { cost_savings: '60%', time_savings: '80%', efficiency_gain: '5x productivity boost' },
    relevant_stages: ['mvp', 'early_customers', 'growing_startup', 'scale_up'],
    use_cases: ['workflow automation', 'integration', 'process optimization'],
    url: 'https://n8n.io'
  },
  {
    id: '3',
    name: 'Apify',
    category: 'Data & Research',
    description: 'Web scraping and automation platform for market intelligence',
    features: ['Web scraping', 'Data extraction', 'API integration', 'Scheduled runs'],
    pricing: 'Free tier ($100 platform usage), paid tiers based on usage',
    metrics: { cost_savings: '75%', time_savings: '90%', efficiency_gain: 'Manual research eliminated' },
    relevant_stages: ['idea', 'prototype', 'mvp', 'early_customers'],
    use_cases: ['market research', 'competitor analysis', 'data extraction'],
    url: 'https://apify.com'
  },
  {
    id: '4',
    name: 'Mollie',
    category: 'Payments',
    description: 'Payment service provider for European markets',
    features: ['Multiple payment methods', 'SEPA support', 'Recurring billing', 'PSD2 compliant'],
    pricing: 'No monthly fee, transaction fees vary by payment method',
    metrics: { cost_savings: '40%', time_savings: '95%', efficiency_gain: 'Payment setup in hours vs weeks' },
    relevant_stages: ['mvp', 'early_customers', 'growing_startup', 'scale_up'],
    use_cases: ['payment processing', 'subscription billing', 'revenue collection'],
    url: 'https://www.mollie.com'
  },
  {
    id: '5',
    name: 'ElevenLabs',
    category: 'AI Voice',
    description: 'AI voice generation for realistic text-to-speech',
    features: ['Natural voice synthesis', 'Voice cloning', 'Multiple languages', 'API access'],
    pricing: 'Free tier (limited use), paid tiers based on usage',
    metrics: { cost_savings: '90%', time_savings: '95%', efficiency_gain: 'Voice content at scale' },
    relevant_stages: ['mvp', 'early_customers', 'growing_startup'],
    use_cases: ['voice synthesis', 'content creation', 'accessibility'],
    url: 'https://elevenlabs.io'
  },
  {
    id: '6',
    name: 'Tally',
    category: 'Forms & Data Collection',
    description: 'Free form builder for collecting user feedback and data',
    features: ['Unlimited forms', 'File uploads', 'Conditional logic', 'Integrations'],
    pricing: 'Free (basic), Pro from $29/month for advanced features',
    metrics: { cost_savings: '100%', time_savings: '85%', efficiency_gain: 'Free alternative to Typeform' },
    relevant_stages: ['idea', 'prototype', 'mvp', 'early_customers'],
    use_cases: ['user research', 'feedback collection', 'lead generation'],
    url: 'https://tally.so'
  },
  {
    id: '7',
    name: 'Supabase',
    category: 'Backend & Database',
    description: 'Open-source Firebase alternative with PostgreSQL',
    features: ['Database', 'Authentication', 'Real-time features', 'Storage'],
    pricing: 'Free tier, Pro/Enterprise plans based on database usage',
    metrics: { cost_savings: '70%', time_savings: '80%', efficiency_gain: 'Backend setup in minutes' },
    relevant_stages: ['prototype', 'mvp', 'early_customers', 'growing_startup'],
    use_cases: ['database', 'authentication', 'real-time features']
  },
  {
    id: '8',
    name: 'Stripe',
    category: 'Payments',
    description: 'Payment infrastructure for internet businesses',
    features: ['Payment processing', 'Subscription management', 'Invoicing', 'Global reach'],
    pricing: 'No subscription fee, ~2.9% + fixed fee per transaction',
    metrics: { cost_savings: '35%', time_savings: '85%', efficiency_gain: 'Global payment infrastructure' },
    relevant_stages: ['mvp', 'early_customers', 'growing_startup', 'scale_up', 'established'],
    use_cases: ['payment processing', 'subscription management', 'invoicing']
  },
  {
    id: '9',
    name: 'Notion',
    category: 'Productivity',
    description: 'All-in-one workspace for notes, docs, and collaboration',
    features: ['Documentation', 'Project management', 'Knowledge base', 'Team collaboration'],
    pricing: 'Free tier, Plus/Team/Enterprise from $10/user/month',
    metrics: { cost_savings: '80%', time_savings: '60%', efficiency_gain: 'All-in-one workspace' },
    relevant_stages: ['idea', 'prototype', 'mvp', 'early_customers', 'growing_startup'],
    use_cases: ['documentation', 'project management', 'knowledge base']
  },
  {
    id: '10',
    name: 'Vercel',
    category: 'Hosting & Deployment',
    description: 'Frontend cloud platform for instant deployments',
    features: ['Instant deployments', 'Edge functions', 'Analytics', 'Preview deployments'],
    pricing: 'Free tier (hobby), Pro/Enterprise plans for team features',
    metrics: { cost_savings: '50%', time_savings: '90%', efficiency_gain: 'Zero-config deployments' },
    relevant_stages: ['prototype', 'mvp', 'early_customers', 'growing_startup', 'scale_up'],
    use_cases: ['hosting', 'deployment', 'edge functions']
  }
];

const defaultApplications: Application[] = [
  {
    id: 'default-1',
    name: 'EIT Digital Accelerator',
    type: 'accelerator',
    description: 'Pan-European accelerator supporting deep-tech startups with market access, funding, and mentorship across 30+ cities.',
    benefits: ['Up to €25K equity-free funding', 'Market access across Europe', 'Mentorship from industry leaders', 'Access to EIT Digital network'],
    eligibility: ['EU-based startup', 'Technology-focused product', 'Post-MVP stage'],
    deadline: '2026-06-30',
    matchScore: 82,
    industry: ['Technology', 'AI', 'Cybersecurity', 'Digital Health'],
    trlRange: 'TRL 5-8',
    url: 'https://www.eitdigital.eu/accelerator/',
  },
  {
    id: 'default-2',
    name: 'EIC Accelerator',
    type: 'grant',
    description: 'European Innovation Council grant and equity funding for breakthrough innovations with high impact potential.',
    benefits: ['Up to €2.5M grant + €15M equity', 'Business acceleration services', 'Access to investors and corporates', 'EU credibility badge'],
    eligibility: ['SME or startup', 'Breakthrough innovation', 'Strong IP or tech differentiation', 'Scalable business model'],
    deadline: '2026-10-01',
    matchScore: 68,
    industry: ['Deep Tech', 'Green Tech', 'Health', 'Digital'],
    trlRange: 'TRL 5-8',
    url: 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-accelerator_en',
  },
  {
    id: 'default-3',
    name: 'Techstars',
    type: 'accelerator',
    description: 'Global accelerator offering 3-month intensive programs with mentorship, funding, and a lifelong network.',
    benefits: ['$120K investment', '3-month intensive program', 'Mentor network of 10,000+', 'Demo Day exposure to investors'],
    eligibility: ['Any stage startup', 'Committed full-time founding team', 'Scalable business idea'],
    deadline: '2026-08-15',
    matchScore: 75,
    industry: ['Any'],
    trlRange: 'TRL 3-7',
    url: 'https://www.techstars.com/',
  },
  {
    id: 'default-4',
    name: 'Horizon Europe – EIC Pathfinder',
    type: 'grant',
    description: 'EU funding for early-stage research on breakthrough technologies. Ideal for pre-commercial deep tech.',
    benefits: ['Up to €3M grant funding', 'No equity dilution', 'Collaborative research opportunities', 'EU institutional recognition'],
    eligibility: ['Consortium or single entity', 'Novel technology concept', 'Early-stage research (TRL 1-4)'],
    deadline: '2026-09-15',
    matchScore: 55,
    industry: ['Deep Tech', 'Biotech', 'AI', 'Quantum', 'Space'],
    trlRange: 'TRL 1-4',
    url: 'https://eic.ec.europa.eu/eic-funding-opportunities/eic-pathfinder_en',
  },
  {
    id: 'default-5',
    name: 'Build Weekend by Young Creators & n8n',
    type: 'competition & hackathons',
    description: 'A weekend-long hackathon focused on building automation-powered MVPs. Great for early-stage founders.',
    benefits: ['Prizes up to €5K', 'Mentorship from n8n team', 'Community exposure', 'Fast prototyping experience'],
    eligibility: ['Open to all founders and builders', 'Team of 1-4 people', 'Must build during the event'],
    deadline: '2026-07-20',
    matchScore: 90,
    industry: ['Any'],
    trlRange: 'TRL 1-5',
    url: 'https://buildweekend.com',
  },
  {
    id: 'default-6',
    name: 'Startup Wise Guys',
    type: 'accelerator',
    description: 'Leading B2B SaaS accelerator in Europe, offering funding, mentorship, and access to enterprise customers.',
    benefits: ['€50K investment', '5-month program', 'B2B sales mentorship', 'Enterprise customer introductions'],
    eligibility: ['B2B SaaS startup', 'Early revenue or strong traction', 'EU or expansion to EU'],
    deadline: '2026-05-31',
    matchScore: 72,
    industry: ['SaaS', 'B2B', 'FinTech', 'Cybersecurity'],
    trlRange: 'TRL 5-8',
    url: 'https://startupwiseguys.com/',
  },
  {
    id: 'default-7',
    name: 'Climate-KIC Accelerator',
    type: 'incubator',
    description: 'Europe\'s largest climate innovation initiative supporting startups tackling climate change.',
    benefits: ['Up to €95K grant funding', 'Tailored coaching', 'Access to corporate partners', 'Pan-European network'],
    eligibility: ['Climate or sustainability focus', 'Scalable solution', 'EU-based or willing to relocate'],
    deadline: '2026-07-01',
    matchScore: 60,
    industry: ['CleanTech', 'Energy', 'AgriTech', 'Circular Economy'],
    trlRange: 'TRL 3-7',
    url: 'https://www.climate-kic.org/',
  },
  {
    id: 'default-8',
    name: 'Web Summit PITCH Competition',
    type: 'competition & hackathons',
    description: 'Pitch competition at Europe\'s largest tech conference with exposure to 70,000+ attendees and top investors.',
    benefits: ['Global media exposure', 'Investor meetings', 'Free Web Summit tickets', 'Finalist showcase on main stage'],
    eligibility: ['Pre-Series A startup', 'Launched product', 'Strong growth metrics or vision'],
    deadline: '2026-08-01',
    matchScore: 78,
    industry: ['Any'],
    trlRange: 'TRL 4-8',
    url: 'https://websummit.com/pitch',
  },
];

const emptyPassport: PassportData = {
  founderName: '',
  startupName: '',
  tagline: '',
  summary: '',
  validationSummary: '',
  competitorSnapshot: [],
  marketData: [],
  roadmapSnapshot: '',
  complianceFlags: [],
  fundingReadiness: [],
  lastUpdated: new Date(),
  euCompliant: false,
};

const exampleFundingData: FundingData = {
  current_stage: 'Pre-Seed',
  current_funding: { amount_raised: 75000, sources: ['Bootstrapped', 'Friends & Family'], last_raise_date: '2025-11-01' },
  funding_goal: {
    target_amount: 500000,
    target_date: '2027-03-01',
    purpose: 'Scale product development, hire first 3 engineers, and launch go-to-market in DACH region',
    use_of_funds: [
      { category: 'Product Development', percentage: 40, description: 'Core platform build and AI features' },
      { category: 'Hiring', percentage: 30, description: 'Engineering and sales hires' },
      { category: 'Marketing & Sales', percentage: 20, description: 'Go-to-market launch campaigns' },
      { category: 'Operations', percentage: 10, description: 'Legal, compliance, infrastructure' },
    ],
  },
  fundraising_type: 'Pre-Seed',
  fundraising_amount: '500000',
  burn_rate: 8000,
  runway_months: 9,
  funding_routes: [
    {
      id: 'eit-digital',
      name: 'EIT Digital Accelerator',
      type: 'accelerator',
      description: 'Pan-European accelerator for deep tech and digital startups with mentoring, market access and up to EUR 25K.',
      match_score: 92,
      timeline: '3-6 months',
      typical_amount: 'EUR 25K + services',
      requirements: ['EU-based startup', 'Digital/tech focus', 'Post-MVP stage'],
      pros: ['No equity taken', 'Pan-EU market access', 'Strong mentor network'],
      cons: ['Competitive selection', 'Requires relocation for bootcamps'],
      next_steps: ['Check open calls on EIT Digital website', 'Prepare pitch deck', 'Submit application'],
      applied: false,
    },
    {
      id: 'eic-accelerator',
      name: 'EIC Accelerator',
      type: 'grant',
      description: 'EU grant + equity programme for breakthrough innovations. Up to EUR 2.5M grant and EUR 15M equity.',
      match_score: 78,
      timeline: '6-12 months',
      typical_amount: 'EUR 0.5M-2.5M',
      requirements: ['SME registered in EU', 'TRL 5-8', 'High innovation potential'],
      pros: ['Non-dilutive grant component', 'Prestige and validation', 'Large funding amounts'],
      cons: ['Highly competitive (<5% success rate)', 'Long evaluation process'],
      next_steps: ['Register on EU Funding portal', 'Prepare short application', 'Develop business innovation plan'],
      applied: false,
    },
    {
      id: 'angel-round',
      name: 'Angel Investment Round',
      type: 'angel',
      description: 'Raise from individual angel investors or angel syndicates in your region.',
      match_score: 85,
      timeline: '2-4 months',
      typical_amount: 'EUR 50K-250K',
      requirements: ['Compelling team', 'Early traction or MVP', 'Clear market opportunity'],
      pros: ['Fast decision-making', 'Strategic advice from experienced founders', 'Flexible terms'],
      cons: ['Equity dilution', 'Smaller check sizes', 'Variable investor quality'],
      next_steps: ['Build target investor list', 'Prepare pitch deck and financial model', 'Start warm introductions'],
      applied: false,
    },
    {
      id: 'pre-seed-vc',
      name: 'Pre-Seed VC Round',
      type: 'vc',
      description: 'Institutional pre-seed funds focused on early-stage European startups.',
      match_score: 70,
      timeline: '3-6 months',
      typical_amount: 'EUR 200K-1M',
      requirements: ['Strong founding team', 'Large addressable market', 'Product vision and early signal'],
      pros: ['Larger check sizes', 'Follow-on support', 'Network and credibility'],
      cons: ['Significant dilution', 'Board involvement', 'Longer due diligence'],
      next_steps: ['Research EU pre-seed funds', 'Prepare data room', 'Start outreach campaign'],
      applied: false,
    },
    {
      id: 'national-grant',
      name: 'National Innovation Grant',
      type: 'grant',
      description: 'Government-backed innovation grants available in most EU member states for R&D and product development.',
      match_score: 88,
      timeline: '2-6 months',
      typical_amount: 'EUR 20K-200K',
      requirements: ['Registered in eligible country', 'Innovation component', 'Detailed project plan'],
      pros: ['Non-dilutive', 'Government validation', 'Often matched with advisory'],
      cons: ['Bureaucratic process', 'Reporting requirements', 'Country-specific'],
      next_steps: ['Identify grants in your country', 'Prepare project proposal', 'Submit with required documentation'],
      applied: false,
    },
  ],
  funding_milestones: [
    { id: 'fm-1', title: 'Complete pitch deck', description: 'Finalize investor-ready pitch deck with market data', status: 'completed', target_date: '2026-01-15' },
    { id: 'fm-2', title: 'Build investor pipeline', description: 'Identify and research 30+ target investors and programmes', status: 'in-progress', target_date: '2026-04-01' },
    { id: 'fm-3', title: 'Submit grant applications', description: 'Apply to EIC Accelerator and national innovation grants', status: 'pending', target_date: '2026-06-01' },
    { id: 'fm-4', title: 'Close pre-seed round', description: 'Secure EUR 500K from angels and/or pre-seed fund', status: 'pending', target_date: '2027-03-01' },
  ],
  readiness_score: 62,
};

export const useStore = create<AppState>((set) => ({
  validation: { marketFit: 0, problemValidation: 0, solutionFit: 0 },
  tools: defaultTools,
  signals: [],
  twelveMonthMilestones: [],
  passport: emptyPassport,
  userInputs: {},
  showComplianceAlert: false,
  toolActivationCount: 0,
  applications: defaultApplications,
  teamMembers: [],
  fundingData: emptyFundingData,
  onboardingComplete: false,
  dataLoaded: false,

  toggleMilestone: (milestoneId) =>
    set((state) => ({
      twelveMonthMilestones: state.twelveMonthMilestones.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
      )
    })),

  addComplianceTasks: () =>
    set((state) => {
      const newMilestone: Milestone = {
        id: `compliance-${Date.now()}`,
        title: 'Complete EU/28th Compliance Update',
        description: 'Update privacy policy, implement data retention controls, and conduct compliance audit',
        targetDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        completed: false,
        category: 'team'
      };
      return {
        twelveMonthMilestones: [newMilestone, ...state.twelveMonthMilestones],
        showComplianceAlert: false
      };
    }),

  dismissComplianceAlert: () => set({ showComplianceAlert: false }),

  updateUserInput: (key, value) =>
    set((state) => ({
      userInputs: { ...state.userInputs, [key]: value }
    })),

  incrementToolActivation: () =>
    set((state) => ({
      toolActivationCount: state.toolActivationCount + 1
    })),

  updatePassport: (data) =>
    set((state) => ({
      passport: { ...state.passport, ...data, lastUpdated: new Date() }
    })),

  markToolSubscribed: (toolId) =>
    set((state) => ({
      tools: state.tools.map((tool) =>
        tool.id === toolId ? { ...tool, subscribed: true } : tool
      )
    })),

  markApplicationApplied: (applicationId) =>
    set((state) => ({
      applications: state.applications.map((app) =>
        app.id === applicationId ? { ...app, applied: true } : app
      )
    })),

  markFundingRouteApplied: (routeId) =>
    set((state) => ({
      fundingData: {
        ...state.fundingData,
        funding_routes: state.fundingData.funding_routes.map((route) =>
          route.id === routeId ? { ...route, applied: true } : route
        )
      }
    })),

  setResearchSignals: (newSignals) =>
    set((state) => ({
      signals: [
        ...newSignals.map((s, i) => ({
          ...s,
          id: `research-${Date.now()}-${i}`,
          timestamp: new Date(),
        })),
        ...state.signals,
      ]
    })),

  addResearchApplications: (newApps) =>
    set((state) => ({
      applications: [
        ...state.applications,
        ...newApps.map((a, i) => ({
          ...a,
          id: `research-${Date.now()}-${i}`,
        })),
      ]
    })),

  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
  setValidation: (v) => set({ validation: v }),
  setMilestones: (m) => set({ twelveMonthMilestones: m }),
  setSignals: (s) => set({ signals: s }),
  setApplications: (a) => set({ applications: a }),
  setTools: (t) => set({ tools: t }),
  setTeamMembers: (t) => set({ teamMembers: t }),
  setFundingData: (f) => set({ fundingData: f }),

  hydrateState: (data) =>
    set((state) => ({
      ...state,
      ...data,
      dataLoaded: true,
    })),
}));
