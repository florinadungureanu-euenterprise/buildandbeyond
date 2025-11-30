import { create } from 'zustand';
import { Task, Milestone, Tool, Signal, ValidationScores, PassportData, Application, TeamMember, FundingData } from '@/types';

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
}

const createDemoData = () => {
  const now = new Date();

  const tools: Tool[] = [
    {
      id: '1',
      name: 'Lovable',
      category: 'Development',
      description: 'AI-powered full-stack development platform for rapid prototyping',
      features: ['AI code generation', 'Full-stack support', 'Real-time preview', 'Database integration'],
      pricing: 'Free tier (limited credits), Pro US $25/month, Business US $50/month',
      metrics: {
        cost_savings: '85%',
        time_savings: '70%',
        efficiency_gain: '10x faster development'
      },
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
      metrics: {
        cost_savings: '60%',
        time_savings: '80%',
        efficiency_gain: '5x productivity boost'
      },
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
      metrics: {
        cost_savings: '75%',
        time_savings: '90%',
        efficiency_gain: 'Manual research eliminated'
      },
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
      metrics: {
        cost_savings: '40%',
        time_savings: '95%',
        efficiency_gain: 'Payment setup in hours vs weeks'
      },
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
      metrics: {
        cost_savings: '90%',
        time_savings: '95%',
        efficiency_gain: 'Voice content at scale'
      },
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
      metrics: {
        cost_savings: '100%',
        time_savings: '85%',
        efficiency_gain: 'Free alternative to Typeform'
      },
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
      metrics: {
        cost_savings: '70%',
        time_savings: '80%',
        efficiency_gain: 'Backend setup in minutes'
      },
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
      metrics: {
        cost_savings: '35%',
        time_savings: '85%',
        efficiency_gain: 'Global payment infrastructure'
      },
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
      metrics: {
        cost_savings: '80%',
        time_savings: '60%',
        efficiency_gain: 'All-in-one workspace'
      },
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
      metrics: {
        cost_savings: '50%',
        time_savings: '90%',
        efficiency_gain: 'Zero-config deployments'
      },
      relevant_stages: ['prototype', 'mvp', 'early_customers', 'growing_startup', 'scale_up'],
      use_cases: ['hosting', 'deployment', 'edge functions']
    }
  ];

  const signals: Signal[] = [
    {
      id: '1',
      type: 'competitor',
      title: 'Competitor Activity Spike',
      message: '3 competitors launched pricing changes in your segment',
      suggestedAction: 'Review roadmap alignment',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: '2',
      type: 'trend',
      title: 'Market Tailwind',
      message: 'Industry adoption rate +12% YoY in your segment',
      suggestedAction: 'Expand GTM timing',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: '3',
      type: 'regulatory',
      title: 'Regulatory Update',
      message: 'EU/28th compliance framework v2.1 published',
      suggestedAction: '3 new roadmap items added',
      timestamp: new Date(now.getTime() - 8 * 60 * 60 * 1000),
      priority: 'high'
    },
    {
      id: '4',
      type: 'trend',
      title: 'Funding Environment Shift',
      message: 'Seed round valuations up 8% this quarter',
      suggestedAction: 'Consider fundraising timeline',
      timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      priority: 'medium'
    },
    {
      id: '5',
      type: 'competitor',
      title: 'New Market Entrant',
      message: 'Well-funded competitor launched in your region',
      suggestedAction: 'Review competitive positioning',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      priority: 'medium'
    }
  ];

  const twelveMonthMilestones: Milestone[] = [
    {
      id: '1',
      title: 'Complete MVP Development',
      description: 'Finish core product features and initial testing',
      targetDate: '2025-01-31',
      completed: true,
      category: 'product',
      recommended_tools: [
        { tool: 'Lovable', metric: '85% cost savings', purpose: 'Rapid MVP development' },
        { tool: 'Supabase', metric: '70% cost savings', purpose: 'Backend infrastructure' }
      ]
    },
    {
      id: '2',
      title: 'Beta Launch',
      description: 'Launch private beta with 50 users',
      targetDate: '2025-02-28',
      completed: true,
      category: 'product',
      recommended_tools: [
        { tool: 'Vercel', metric: '50% cost savings', purpose: 'Instant deployment' },
        { tool: 'Tally', metric: '100% cost savings', purpose: 'User feedback collection' }
      ]
    },
    {
      id: '3',
      title: 'Secure Strategic Partnership',
      description: 'Sign partnership agreement with industry leader',
      targetDate: '2025-03-31',
      completed: false,
      category: 'market',
      recommended_tools: [
        { tool: 'Apify', metric: '75% cost savings', purpose: 'Market intelligence' },
        { tool: 'Notion', metric: '80% cost savings', purpose: 'Partnership documentation' }
      ]
    },
    {
      id: '4',
      title: 'Expand Core Team',
      description: 'Hire 2 engineers and 1 marketing lead',
      targetDate: '2025-04-30',
      completed: false,
      category: 'team',
      recommended_tools: [
        { tool: 'Notion', metric: '80% cost savings', purpose: 'Team collaboration' },
        { tool: 'n8n', metric: '60% cost savings', purpose: 'Onboarding automation' }
      ]
    },
    {
      id: '5',
      title: 'Public Launch',
      description: 'Launch product publicly with full marketing campaign',
      targetDate: '2025-05-31',
      completed: false,
      category: 'product',
      recommended_tools: [
        { tool: 'Vercel', metric: '50% cost savings', purpose: 'Production hosting' },
        { tool: 'Stripe', metric: '35% cost savings', purpose: 'Payment processing' }
      ]
    },
    {
      id: '6',
      title: 'Achieve Product-Market Fit',
      description: 'Reach 40% weekly active user retention',
      targetDate: '2025-06-30',
      completed: false,
      category: 'product',
      recommended_tools: [
        { tool: 'Tally', metric: '100% cost savings', purpose: 'User surveys' },
        { tool: 'n8n', metric: '60% cost savings', purpose: 'Analytics automation' }
      ]
    },
    {
      id: '7',
      title: 'Seed Funding Round',
      description: 'Close $1M seed round',
      targetDate: '2025-07-31',
      completed: false,
      category: 'funding',
      recommended_tools: [
        { tool: 'Notion', metric: '80% cost savings', purpose: 'Pitch deck & data room' }
      ]
    },
    {
      id: '8',
      title: 'Scale to 1000 Users',
      description: 'Reach 1000 active paying customers',
      targetDate: '2025-08-31',
      completed: false,
      category: 'market',
      recommended_tools: [
        { tool: 'Stripe', metric: '35% cost savings', purpose: 'Subscription management' },
        { tool: 'n8n', metric: '60% cost savings', purpose: 'Customer onboarding automation' }
      ]
    },
    {
      id: '9',
      title: 'International Expansion',
      description: 'Launch in 3 European markets',
      targetDate: '2025-09-30',
      completed: false,
      category: 'market',
      recommended_tools: [
        { tool: 'Mollie', metric: '40% cost savings', purpose: 'European payment processing' },
        { tool: 'Apify', metric: '75% cost savings', purpose: 'Market research' }
      ]
    },
    {
      id: '10',
      title: 'Advanced Features Release',
      description: 'Release AI-powered analytics suite',
      targetDate: '2025-10-31',
      completed: false,
      category: 'product',
      recommended_tools: [
        { tool: 'ElevenLabs', metric: '90% cost savings', purpose: 'Voice features' },
        { tool: 'Lovable', metric: '85% cost savings', purpose: 'Rapid feature development' }
      ]
    },
    {
      id: '11',
      title: 'Series A Preparation',
      description: 'Prepare materials and metrics for Series A',
      targetDate: '2025-11-30',
      completed: false,
      category: 'funding',
      recommended_tools: [
        { tool: 'Notion', metric: '80% cost savings', purpose: 'Due diligence preparation' },
        { tool: 'n8n', metric: '60% cost savings', purpose: 'Metrics automation' }
      ]
    },
    {
      id: '12',
      title: 'Year-End Review',
      description: 'Complete annual review and plan for next year',
      targetDate: '2025-12-31',
      completed: false,
      category: 'team',
      recommended_tools: [
        { tool: 'Notion', metric: '80% cost savings', purpose: 'Planning & documentation' }
      ]
    }
  ];

  const applications: Application[] = [
    {
      id: '1',
      name: 'Y Combinator',
      type: 'accelerator',
      description: 'World-renowned startup accelerator providing funding, mentorship, and network',
      benefits: ['$500k investment', 'Silicon Valley network', 'Alumni community', 'Demo Day exposure'],
      eligibility: ['Early-stage startup', 'Scalable business model', 'Strong founding team'],
      deadline: '2025-03-15',
      matchScore: 85,
      industry: ['SaaS', 'Technology'],
      trlRange: '4-6'
    },
    {
      id: '2',
      name: 'Horizon Europe Grant',
      type: 'grant',
      description: 'EU research and innovation funding program for breakthrough technologies',
      benefits: ['Up to €2.5M funding', 'No equity dilution', 'EU market access', 'Research partnerships'],
      eligibility: ['EU-based', 'Deep tech focus', 'TRL 3-6', 'Innovation potential'],
      deadline: '2025-04-30',
      matchScore: 92,
      industry: ['Technology', 'SaaS', 'AI'],
      trlRange: '3-6'
    },
    {
      id: '3',
      name: 'European Innovation Council',
      type: 'grant',
      description: 'Support for game-changing innovations with high-risk/high-gain potential',
      benefits: ['€2.5M grant + €15M equity', 'Acceleration services', 'Business coaching', 'Investor network'],
      eligibility: ['European company', 'Breakthrough innovation', 'Scale-up potential', 'TRL 5-8'],
      deadline: '2025-06-01',
      matchScore: 88,
      industry: ['Technology', 'AI'],
      trlRange: '5-8'
    },
    {
      id: '4',
      name: 'Techstars Accelerator',
      type: 'accelerator',
      description: 'Global accelerator network with mentor-driven programs',
      benefits: ['$120k investment', 'Mentor network', 'Lifetime network access', 'Corporate partnerships'],
      eligibility: ['Product traction', 'Scalable model', 'Committed founders'],
      deadline: '2025-02-28',
      matchScore: 78,
      industry: ['SaaS', 'Technology'],
      trlRange: '4-7'
    },
    {
      id: '5',
      name: 'EIT Digital Challenge',
      type: 'competition',
      description: 'European competition for digital technology startups',
      benefits: ['€50k prize', 'EIT network access', 'Media exposure', 'Investor connections'],
      eligibility: ['Digital innovation', 'EU presence', 'Scalable solution'],
      deadline: '2025-05-15',
      matchScore: 82,
      industry: ['Technology', 'SaaS'],
      trlRange: '4-6'
    }
  ];

  const teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Alex Morgan',
      role: 'CEO & Founder',
      status: 'active',
      startDate: '2024-01-01'
    },
    {
      id: '2',
      name: 'Senior Engineer',
      role: 'Lead Developer',
      status: 'hiring'
    },
    {
      id: '3',
      name: 'Marketing Lead',
      role: 'Head of Marketing',
      status: 'hiring'
    },
    {
      id: '4',
      name: 'Product Designer',
      role: 'UX/UI Designer',
      status: 'pending'
    }
  ];

  const passport: PassportData = {
    founderName: 'Alex Morgan',
    startupName: 'TechVenture',
    tagline: 'Building the future of collaborative work',
    summary: 'TechVenture is a SaaS platform that reimagines team collaboration by combining AI-powered insights with intuitive project management. We serve mid-sized companies looking to improve productivity and reduce operational overhead.',
    validationSummary: 'Strong market validation with 80% market fit score based on 50+ customer interviews. Problem validation confirmed through industry surveys showing 75% of target companies struggle with existing solutions. Solution fit currently at 50% as we iterate on feature set based on beta feedback.',
    competitorSnapshot: [
      'Competitor A: Strong in enterprise, weak in SMB market',
      'Competitor B: Good UX but limited integrations',
      'Competitor C: Price leader but lacking advanced features',
      'Our differentiator: AI-driven insights + seamless integrations'
    ],
    marketData: [
      'TAM: $12B globally, $3.2B in target segment',
      'Growth rate: 18% CAGR over next 5 years',
      'Customer acquisition cost: $450 (decreasing)',
      'Lifetime value: $3,200 (12-month cohorts)',
      'Current traction: 150 signups, 50 active beta users'
    ],
    roadmapSnapshot: '12-month plan: Launch MVP, secure partnerships, expand team, achieve product-market fit, close seed funding, scale to 1000 users, expand internationally, release advanced features, and prepare for Series A.',
    complianceFlags: [
      'GDPR compliant',
      'EU/28th regime aligned',
      'SOC 2 Type II in progress',
      'Data residency controls implemented'
    ],
    fundingReadiness: [
      { item: 'Pitch deck', status: 'complete' },
      { item: 'Financial model', status: 'complete' },
      { item: 'Cap table', status: 'complete' },
      { item: 'Customer references', status: 'in-progress' },
      { item: 'Legal documents', status: 'in-progress' },
      { item: 'Due diligence materials', status: 'pending' }
    ],
    lastUpdated: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    euCompliant: true,
    industry: 'SaaS',
    trl: 5
  };

  const fundingData: FundingData = {
    current_stage: 'Seed',
    current_funding: {
      amount_raised: 250000,
      sources: ['Bootstrapped', 'Friends & Family'],
      last_raise_date: '2024-06-15'
    },
    funding_goal: {
      target_amount: 1000000,
      target_date: '2025-07-31',
      purpose: 'Accelerate product development, expand team, and scale go-to-market',
      use_of_funds: [
        { category: 'Product Development', percentage: 40, description: 'Engineering team expansion and feature development' },
        { category: 'Marketing & Sales', percentage: 30, description: 'Customer acquisition and brand building' },
        { category: 'Operations', percentage: 20, description: 'Infrastructure and business operations' },
        { category: 'Reserve', percentage: 10, description: 'Emergency buffer and unexpected opportunities' }
      ]
    },
    fundraising_type: 'Seed Round',
    fundraising_amount: '$1M',
    burn_rate: 35000,
    runway_months: 18,
    funding_routes: [
      {
        id: '1',
        name: 'Angel Investment',
        type: 'angel',
        description: 'Individual investors providing early-stage capital',
        typical_amount: '$25k - $250k',
        timeline: '2-4 months',
        match_score: 85,
        requirements: ['Strong MVP', 'Clear market opportunity', 'Compelling pitch'],
        pros: ['Flexible terms', 'Mentorship', 'Quick decision-making'],
        cons: ['Smaller amounts', 'Multiple investors needed', 'Varied expectations'],
        next_steps: ['Refine pitch deck', 'Join angel networks', 'Get warm intros']
      },
      {
        id: '2',
        name: 'Venture Capital',
        type: 'vc',
        description: 'Professional investors providing growth capital',
        typical_amount: '$500k - $5M',
        timeline: '4-6 months',
        match_score: 78,
        requirements: ['Product-market fit', 'Scalable business model', 'Strong team'],
        pros: ['Larger amounts', 'Strategic support', 'Network access'],
        cons: ['Equity dilution', 'Board seats', 'High growth expectations'],
        next_steps: ['Build traction', 'Complete financial model', 'Research target VCs']
      },
      {
        id: '3',
        name: 'EU Horizon Europe',
        type: 'grant',
        description: 'EU research and innovation funding program',
        typical_amount: '€2.5M - €10M',
        timeline: '6-12 months',
        match_score: 92,
        requirements: ['EU-based', 'Innovation potential', 'TRL 3-6', 'Research component'],
        pros: ['Non-dilutive', 'Large amounts', 'Credibility boost'],
        cons: ['Lengthy process', 'Reporting requirements', 'Milestone-based'],
        next_steps: ['Check eligibility', 'Find consortium partners', 'Prepare proposal']
      },
      {
        id: '4',
        name: 'EIC Accelerator',
        type: 'grant',
        description: 'European Innovation Council funding for breakthrough innovations',
        typical_amount: '€2.5M grant + €15M equity',
        timeline: '8-10 months',
        match_score: 88,
        requirements: ['Breakthrough innovation', 'European company', 'TRL 5-8', 'Scale-up potential'],
        pros: ['Blended financing', 'EU network', 'Coaching services'],
        cons: ['Highly competitive', 'Equity component', 'Extensive reporting'],
        next_steps: ['Assess innovation readiness', 'Prepare video pitch', 'Submit application']
      },
      {
        id: '5',
        name: 'Accelerator Program',
        type: 'accelerator',
        description: 'Structured program with funding and mentorship',
        typical_amount: '$25k - $150k',
        timeline: '3-6 months',
        match_score: 82,
        requirements: ['Scalable idea', 'Committed team', 'Coachable founders'],
        pros: ['Mentorship', 'Network', 'Fast-track learning'],
        cons: ['Equity for small amounts', 'Time commitment', 'Relocation often required'],
        next_steps: ['Research programs', 'Complete applications', 'Prepare for interviews']
      }
    ],
    funding_milestones: [
      {
        id: '1',
        title: 'Complete Pitch Deck',
        description: 'Finalize investor-ready pitch deck with all key metrics',
        target_date: '2025-03-15',
        status: 'completed',
        funding_type: 'Preparation'
      },
      {
        id: '2',
        title: 'Build Angel Investor Pipeline',
        description: 'Identify and reach out to 20+ potential angel investors',
        target_date: '2025-04-30',
        status: 'in-progress',
        funding_type: 'Angel Investment'
      },
      {
        id: '3',
        title: 'Submit EU Grant Applications',
        description: 'Apply to Horizon Europe and EIC Accelerator programs',
        target_date: '2025-05-31',
        status: 'not-started',
        funding_type: 'EU Grants'
      },
      {
        id: '4',
        title: 'Close Seed Round',
        description: 'Secure $1M in seed funding from angels and/or VCs',
        target_date: '2025-07-31',
        status: 'not-started',
        funding_type: 'Seed Round'
      }
    ],
    readiness_score: 78
  };

  return { tools, signals, twelveMonthMilestones, passport, applications, teamMembers, fundingData };
};

export const useStore = create<AppState>((set) => {
  const demoData = createDemoData();

  return {
    validation: {
      marketFit: 0.8,
      problemValidation: 0.75,
      solutionFit: 0.5
    },
    tools: demoData.tools,
    signals: demoData.signals,
    twelveMonthMilestones: demoData.twelveMonthMilestones,
    passport: demoData.passport,
    userInputs: {},
    showComplianceAlert: true,
    toolActivationCount: 0,
    applications: demoData.applications,
    teamMembers: demoData.teamMembers,
    fundingData: demoData.fundingData,

    toggleMilestone: (milestoneId) =>
      set((state) => ({
        twelveMonthMilestones: state.twelveMonthMilestones.map((milestone) =>
          milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
        )
      })),

    addComplianceTasks: () =>
      set((state) => {
        // Add compliance milestone to roadmap instead
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
        passport: {
          ...state.passport,
          ...data,
          lastUpdated: new Date()
        }
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
      }))
  };
});
