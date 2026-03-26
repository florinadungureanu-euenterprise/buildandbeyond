export interface Task {
  id: string;
  title: string;
  completed: boolean;
  category?: 'compliance' | 'product' | 'market' | 'operations';
  isNew?: boolean;
}

export interface RoadmapTool {
  tool: string;
  metric: string;           // e.g., "85% cost savings"
  purpose: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  completed: boolean;
  category: 'product' | 'market' | 'team' | 'funding';
  recommended_tools?: RoadmapTool[];
}

export interface ToolMetrics {
  cost_savings: string;      // e.g., "85%"
  time_savings: string;       // e.g., "70%"
  efficiency_gain: string;    // e.g., "10x faster development"
}

export interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  pricing?: string;
  metrics: ToolMetrics;
  relevant_stages?: string[];
  use_cases?: string[];
  why_recommended?: string;
  url?: string;
  subscribed?: boolean;
}

export interface Signal {
  id: string;
  type: 'competitor' | 'trend' | 'regulatory' | 'funding' | 'opportunity';
  title: string;
  message: string;
  suggestedAction: string;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
  source?: string;
}

export interface ValidationScores {
  marketFit: number;
  problemValidation: number;
  solutionFit: number;
}

export interface Application {
  id: string;
  name: string;
  type: 'accelerator' | 'grant' | 'competition & hackathons' | 'incubator';
  description: string;
  benefits: string[];
  eligibility: string[];
  deadline: string;
  matchScore: number;
  industry?: string[];
  trlRange?: string;
  url?: string;
  applied?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'hiring' | 'pending';
  startDate?: string;
}

export interface PassportData {
  founderName: string;
  founderEmail?: string;
  founderLinkedIn?: string;
  startupName: string;
  tagline: string;
  summary: string;
  validationSummary: string;
  competitorSnapshot: string[];
  marketData: string[];
  roadmapSnapshot: string;
  complianceFlags: string[];
  fundingReadiness: { item: string; status: 'complete' | 'in-progress' | 'pending' }[];
  lastUpdated: Date;
  euCompliant: boolean;
  industry?: string;
  trl?: number;
}

export interface OnboardingMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  timestamp: Date;
}

export interface OnboardingQuestion {
  id: number;
  question: string;
  templates: string[];
  key: string;
  stage?: 'early' | 'later' | 'all';
  probe_questions?: string[];
  context?: string;
}

export interface EmpathyMap {
  says: string;
  thinks: string;
  does: string;
  feels: string;
}

export interface OnboardingProfile {
  stage_detected: string;
  customer: string;
  empathy_map: EmpathyMap;
  problem: string;
  consequences_of_problem: string;
  existing_alternatives: string;
  jobs_to_be_done: string;
  solution: string;
  unique_value_proposition: string;
  unfair_advantage: string;
  riskiest_assumption: string;
  method_and_success_criterion: string;
  industry: string;
  region: string;
  business_model: string;
  channels: string;
  revenue_streams: string;
  cost_structure: string;
  key_metrics: string;
  twelve_week_goal: string;
  risks: string;
  fundraising_type: string;
  fundraising_amount: string;
  later_stage_priorities: string;
  later_stage_bottlenecks: string;
  later_stage_goals: string;
  later_stage_tools: string;
  later_stage_process_gaps: string;
  later_stage_metrics: string;
  later_stage_risks: string;
  later_stage_vision: string;
  document_insights: string[];
}

export interface UploadedDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: Date;
  content?: string;
}

export interface FundingRoute {
  id: string;
  name: string;
  type: 'angel' | 'vc' | 'grant' | 'accelerator' | 'crowdfunding' | 'loan';
  description: string;
  typical_amount: string;
  timeline: string;
  match_score: number;
  requirements: string[];
  pros: string[];
  cons: string[];
  next_steps: string[];
  url?: string;
  applied?: boolean;
}

export interface FundingMilestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  status: 'not-started' | 'in-progress' | 'completed';
  funding_type: string;
}

export interface FundingData {
  current_stage: string;
  current_funding: {
    amount_raised: number;
    sources: string[];
    last_raise_date?: string;
  };
  funding_goal: {
    target_amount: number;
    target_date: string;
    purpose: string;
    use_of_funds: { category: string; percentage: number; description: string }[];
  };
  fundraising_type: string;  // From onboarding
  fundraising_amount: string; // From onboarding
  burn_rate: number;
  runway_months: number;
  funding_routes: FundingRoute[];
  funding_milestones: FundingMilestone[];
  readiness_score: number;
}
