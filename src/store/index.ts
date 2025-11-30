import { create } from 'zustand';
import { Task, Milestone, Tool, Signal, ValidationScores, PassportData } from '@/types';

interface AppState {
  validation: ValidationScores;
  tools: Tool[];
  signals: Signal[];
  twoWeekTasks: Task[];
  threeMonthMilestones: Milestone[];
  passport: PassportData;
  userInputs: Record<string, string>;
  showComplianceAlert: boolean;
  toolActivationCount: number;

  // Actions
  toggleTask: (taskId: string) => void;
  toggleMilestone: (milestoneId: string) => void;
  addComplianceTasks: () => void;
  dismissComplianceAlert: () => void;
  updateUserInput: (key: string, value: string) => void;
  incrementToolActivation: () => void;
}

const createDemoData = () => {
  const now = new Date();

  const tools: Tool[] = [
    {
      id: '1',
      name: 'Analytics Pro',
      category: 'Data & Insights',
      commission: 15,
      description: 'Advanced analytics and reporting platform',
      features: ['Real-time dashboards', 'Custom reports', 'Data visualization', 'Export to CSV/PDF'],
      pricing: '$49/month'
    },
    {
      id: '2',
      name: 'Growth Engine',
      category: 'Marketing Automation',
      commission: 8,
      description: 'Comprehensive marketing automation suite',
      features: ['Email campaigns', 'A/B testing', 'Lead scoring', 'Social media integration'],
      pricing: '$99/month'
    },
    {
      id: '3',
      name: 'CRM Suite',
      category: 'Customer Management',
      commission: 12,
      description: 'Customer relationship management platform',
      features: ['Contact management', 'Sales pipeline', 'Task automation', 'Mobile app'],
      pricing: '$79/month'
    },
    {
      id: '4',
      name: 'PayFlow',
      category: 'Payment Processing',
      commission: 10,
      description: 'Secure payment processing solution',
      features: ['Multiple payment methods', 'Fraud detection', 'Recurring billing', 'PCI compliance'],
      pricing: '2.9% + $0.30 per transaction'
    },
    {
      id: '5',
      name: 'TeamHub',
      category: 'Team Collaboration',
      commission: 7,
      description: 'Project management and team collaboration',
      features: ['Kanban boards', 'Time tracking', 'File sharing', 'Video calls'],
      pricing: '$12/user/month'
    },
    {
      id: '6',
      name: 'CloudStore',
      category: 'Infrastructure',
      commission: 9,
      description: 'Cloud storage and CDN services',
      features: ['99.9% uptime', 'Global CDN', 'Auto-scaling', 'Developer API'],
      pricing: '$0.02/GB'
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

  const twoWeekTasks: Task[] = [
    { id: '1', title: 'Setup payment processing integration', completed: true, category: 'operations' },
    { id: '2', title: 'Complete market research analysis', completed: true, category: 'market' },
    { id: '3', title: 'Finalize MVP feature set', completed: true, category: 'product' },
    { id: '4', title: 'Design user onboarding flow', completed: false, category: 'product' },
    { id: '5', title: 'Set up analytics tracking', completed: false, category: 'operations' },
    { id: '6', title: 'Draft initial marketing copy', completed: false, category: 'market' },
    { id: '7', title: 'Conduct user testing sessions', completed: false, category: 'product' },
    { id: '8', title: 'Implement feedback mechanisms', completed: false, category: 'product' },
    { id: '9', title: 'Prepare investor pitch deck', completed: false, category: 'operations' },
    { id: '10', title: 'Review security protocols', completed: false, category: 'operations' }
  ];

  const threeMonthMilestones: Milestone[] = [
    {
      id: '1',
      title: 'Beta Launch',
      description: 'Launch private beta with 50 users',
      targetDate: '2025-02-15',
      completed: true,
      category: 'product'
    },
    {
      id: '2',
      title: 'Secure Strategic Partnership',
      description: 'Sign partnership agreement with industry leader',
      targetDate: '2025-02-28',
      completed: true,
      category: 'market'
    },
    {
      id: '3',
      title: 'Expand Core Team',
      description: 'Hire 2 engineers and 1 marketing lead',
      targetDate: '2025-03-15',
      completed: false,
      category: 'team'
    },
    {
      id: '4',
      title: 'Achieve Product-Market Fit',
      description: 'Reach 40% weekly active user retention',
      targetDate: '2025-03-30',
      completed: false,
      category: 'product'
    },
    {
      id: '5',
      title: 'Seed Funding Round',
      description: 'Close $1M seed round',
      targetDate: '2025-04-15',
      completed: false,
      category: 'funding'
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
    roadmapSnapshot: '2-week focus: Complete core product features and onboarding. 3-month plan: Launch public beta, expand team, secure seed funding, and achieve product-market fit metrics.',
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
    euCompliant: true
  };

  return { tools, signals, twoWeekTasks, threeMonthMilestones, passport };
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
    twoWeekTasks: demoData.twoWeekTasks,
    threeMonthMilestones: demoData.threeMonthMilestones,
    passport: demoData.passport,
    userInputs: {},
    showComplianceAlert: true,
    toolActivationCount: 0,

    toggleTask: (taskId) =>
      set((state) => ({
        twoWeekTasks: state.twoWeekTasks.map((task) =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        )
      })),

    toggleMilestone: (milestoneId) =>
      set((state) => ({
        threeMonthMilestones: state.threeMonthMilestones.map((milestone) =>
          milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone
        )
      })),

    addComplianceTasks: () =>
      set((state) => {
        const newTasks: Task[] = [
          {
            id: `compliance-${Date.now()}-1`,
            title: 'Update privacy policy for EU/28th regime v2.1',
            completed: false,
            category: 'compliance',
            isNew: true
          },
          {
            id: `compliance-${Date.now()}-2`,
            title: 'Implement new data retention controls',
            completed: false,
            category: 'compliance',
            isNew: true
          },
          {
            id: `compliance-${Date.now()}-3`,
            title: 'Conduct compliance audit documentation',
            completed: false,
            category: 'compliance',
            isNew: true
          }
        ];

        return {
          twoWeekTasks: [...newTasks, ...state.twoWeekTasks],
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
      }))
  };
});
